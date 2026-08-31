import type { Metadata } from "next";
import { Baloo_2, Manrope } from "next/font/google";
import "./globals.css";
import { getSeoMetadata, PRODUCTION_SITE_URL } from "@/lib/seo";
import { Analytics } from "@/components/analytics";
import { VisitTracker } from "@/components/layout/VisitTracker";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
});

// Código de verificação do Google Search Console (a string do meta tag).
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const metadata: Metadata = {
  ...getSeoMetadata(),
  metadataBase: new URL(PRODUCTION_SITE_URL),
  ...(googleVerification ? { verification: { google: googleVerification } } : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${manrope.variable} ${baloo.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
        <VisitTracker />
      </body>
    </html>
  );
}
