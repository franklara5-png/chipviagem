"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, Send, X, Loader2, Sparkles } from "lucide-react";
import { usePageAssist } from "@/components/page-assist-context";
import type { CalculatorSnapshot } from "@/lib/calculator-context";

function getMessageText(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

export function AiChatWidget() {
  const pathname = usePathname();
  const pageAssist = usePageAssist();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const pathnameRef = useRef(pathname);
  const calculatorRef = useRef<CalculatorSnapshot | null>(null);
  pathnameRef.current = pathname;
  calculatorRef.current = pageAssist?.calculator ?? null;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages,
            pagePath: pathnameRef.current,
            calculatorSnapshot: calculatorRef.current ?? undefined,
          },
        }),
      }),
    []
  );

  const { messages, sendMessage, status, error, stop } = useChat({ transport });

  const isLoading = status === "submitted" || status === "streaming";
  const hasCalculator = !!pageAssist?.calculator;

  useEffect(() => {
    if (!pageAssist?.openChatRequest) return;
    setOpen(true);
    if (pageAssist.calculator && messages.length === 0) {
      void sendMessage({
        text: `Explique meu resultado de ${pageAssist.calculator.estimatedGb} GB e qual plano você recomenda para ${pageAssist.calculator.days} dias de viagem.`,
      });
    }
  }, [pageAssist?.openChatRequest, pageAssist?.calculator, messages.length, sendMessage]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }, [messages, open, isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setOpen(true);
    await sendMessage({ text });
  }

  return (
    <>
      {open && (
        <div
          className="fixed bottom-24 left-5 z-50 flex w-[min(100vw-2.5rem,380px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          role="dialog"
          aria-label="Assistente ChipViagem"
        >
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
            <div>
              <p className="font-semibold">Assistente ChipViagem</p>
              <p className="text-xs text-sky-100">
                DeepSeek V4 Pro
                {hasCalculator ? " · vê sua calculadora" : " · eSIM e viagem"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 hover:bg-white/10"
              aria-label="Fechar chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex max-h-80 min-h-48 flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-slate-500">
                {hasCalculator ? (
                  <>
                    Vi que você calculou cerca de{" "}
                    <strong>{pageAssist?.calculator?.estimatedGb} GB</strong> para{" "}
                    {pageAssist?.calculator?.days} dias. Pergunte qual plano escolher ou como
                    economizar dados.
                  </>
                ) : (
                  <>
                    Olá! Posso ajudar com planos de eSIM, quanto de internet contratar, instalação
                    e dúvidas sobre viagem.
                  </>
                )}
              </p>
            )}

            {messages.map((message) => {
              const text = getMessageText(message);
              if (!text) return null;
              const isUser = message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm ${
                    isUser
                      ? "ml-auto bg-primary text-white"
                      : "mr-auto bg-slate-100 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{text}</p>
                </div>
              );
            })}

            {isLoading && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Digitando…
              </div>
            )}

            {error && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error.message.includes("503")
                  ? "Assistente temporariamente indisponível."
                  : "Não foi possível responder. Tente novamente."}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-100 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                hasCalculator ? "Qual plano combina com meu perfil?" : "Digite sua dúvida…"
              }
              disabled={isLoading}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={() => stop()}
                className="rounded-lg bg-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Parar
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-white hover:bg-orange-600 disabled:opacity-50"
                aria-label="Enviar mensagem"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Fechar assistente" : "Abrir assistente virtual"}
        className="fixed bottom-5 left-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:scale-105 hover:bg-primary-dark hover:shadow-xl"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}

export function AiChatCalculatorButton() {
  const pageAssist = usePageAssist();
  if (!pageAssist) return null;

  return (
    <button
      type="button"
      onClick={() => pageAssist.requestOpenChat()}
      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-primary/30 bg-white px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/5"
    >
      <Sparkles className="h-4 w-4" />
      Tirar dúvidas com a IA sobre este resultado
    </button>
  );
}
