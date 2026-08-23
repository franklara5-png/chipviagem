import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { z } from "zod";
import {
  buildAssistantSystemPrompt,
  CHAT_MAX_MESSAGES,
  CHAT_MAX_CHARS_PER_MESSAGE,
  CHAT_MAX_TOTAL_CHARS,
  CHAT_RATE_LIMIT,
  CHAT_RATE_WINDOW_MS,
} from "@/lib/ai-assistant";
import { buildCalculatorContextBlock, type CalculatorSnapshot } from "@/lib/calculator-context";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getSiteUrl } from "@/lib/seo";

export const maxDuration = 30;

/** Teto do corpo cru, antes de qualquer parse. */
const MAX_BODY_BYTES = 64 * 1024;

/**
 * Só 'user' e 'assistant'. Aceitar 'system' deixaria o cliente sobrescrever
 * o prompt do servidor e usar a chave da DeepSeek para qualquer coisa.
 * Só partes de texto: anexo aqui não tem uso e queimaria token.
 */
const textPartSchema = z.object({
  type: z.literal("text"),
  text: z.string().max(CHAT_MAX_CHARS_PER_MESSAGE),
});

const messageSchema = z.object({
  id: z.string().max(100).optional(),
  role: z.enum(["user", "assistant"]),
  parts: z.array(textPartSchema).min(1).max(20),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(CHAT_MAX_MESSAGES),
  pagePath: z.string().max(200).optional(),
  calculatorSnapshot: z.unknown().optional(),
});

function jsonError(message: string, status: number, headers?: HeadersInit) {
  return Response.json({ error: message }, { status, headers });
}

/**
 * Aceita apenas requisição da mesma origem que atendeu o request.
 *
 * Compara o Origin com o host da propria requisicao, em vez de manter uma
 * lista fixa de dominios: assim funciona em localhost (qualquer porta), em
 * preview da Vercel, no apex e em qualquer dominio futuro, sem precisar
 * editar codigo — e sem o risco de derrubar o chat em silencio com um 403.
 *
 * O que isso barra: outro site usar o endpoint pelo navegador, porque o
 * Origin e definido pelo navegador e nao pode ser forjado por uma pagina de
 * terceiro. Um script fora do navegador ainda consegue mandar o header na
 * mao — para esse caso quem responde e o rate limit.
 */
function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (host && originHost === host) return true;

  try {
    return originHost === new URL(getSiteUrl()).host;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return jsonError("Assistente indisponível. Configure DEEPSEEK_API_KEY.", 503);
  }

  if (!isAllowedOrigin(req)) {
    return jsonError("Origem não permitida", 403);
  }

  const ip = getClientIp(req);
  const limit = rateLimit(`chat:${ip}`, CHAT_RATE_LIMIT, CHAT_RATE_WINDOW_MS);
  if (!limit.ok) {
    return jsonError("Muitas mensagens em pouco tempo. Tente de novo em instantes.", 429, {
      "Retry-After": String(limit.retryAfter),
    });
  }

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return jsonError("Requisição muito grande", 413);
  }

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(raw);
  } catch {
    return jsonError("Requisição inválida", 400);
  }

  const parsed = bodySchema.safeParse(parsedJson);
  if (!parsed.success) {
    return jsonError("Requisição inválida", 400);
  }

  const { messages, pagePath, calculatorSnapshot } = parsed.data;

  const totalChars = messages.reduce(
    (sum, m) => sum + m.parts.reduce((s, p) => s + p.text.length, 0),
    0
  );
  if (totalChars > CHAT_MAX_TOTAL_CHARS) {
    return jsonError("Conversa muito longa. Recarregue a página para começar outra.", 400);
  }

  const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });
  const modelId = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro";

  const calculatorContext = calculatorSnapshot
    ? buildCalculatorContextBlock(calculatorSnapshot as CalculatorSnapshot)
    : undefined;

  const result = streamText({
    model: deepseek(modelId),
    system: buildAssistantSystemPrompt(pagePath, calculatorContext),
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
