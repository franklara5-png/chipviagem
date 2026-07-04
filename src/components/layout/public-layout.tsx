import { Header } from "./header";
import { Footer } from "./footer";
import { Suspense } from "react";
import { RefCookieHandler } from "@/components/ref-cookie-handler";

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <RefCookieHandler />
      </Suspense>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
