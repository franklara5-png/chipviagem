import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { buildAssistantSystemPrompt, CHAT_MAX_MESSAGES } from "@/lib/ai-assistant";
import { buildCalculatorContextBlock, type CalculatorSnapshot } from "@/lib/calculator-context";

export const maxDuration = 30;

export async function POST(req: Request) {
  if (!process.env.DEEPSEEK_API_KEY) {
    return Response.json(
      { error: "Assistente indisponível. Configure DEEPSEEK_API_KEY." },
      { status: 503 }
    );
  }

  let body: { messages?: UIMessage[]; pagePath?: string; calculatorSnapshot?: CalculatorSnapshot };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Requisição inválida" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (messages.length === 0) {
    return Response.json({ error: "Nenhuma mensagem" }, { status: 400 });
  }

  if (messages.length > CHAT_MAX_MESSAGES) {
    return Response.json({ error: "Limite de mensagens atingido nesta conversa" }, { status: 400 });
  }

  const deepseek = createDeepSeek({
    apiKey: process.env.DEEPSEEK_API_KEY,
  });

  const modelId = process.env.DEEPSEEK_MODEL ?? "deepseek-v4-pro";

  const calculatorContext = body.calculatorSnapshot
    ? buildCalculatorContextBlock(body.calculatorSnapshot)
    : undefined;

  const result = streamText({
    model: deepseek(modelId),
    system: buildAssistantSystemPrompt(body.pagePath, calculatorContext),
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
