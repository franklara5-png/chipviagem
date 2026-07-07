import { Header } from "./header";
import { Footer } from "./footer";
import { Suspense } from "react";
import { RefCookieHandler } from "@/components/ref-cookie-handler";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { AiChatWidget } from "@/components/ai-chat-widget";
import { PageAssistProvider } from "@/components/page-assist-context";

export async function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageAssistProvider>
      <Suspense fallback={null}>
        <RefCookieHandler />
      </Suspense>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <AiChatWidget />
      <WhatsAppFloat />
    </PageAssistProvider>
  );
}
