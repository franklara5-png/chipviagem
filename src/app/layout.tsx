import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSeoMetadata, PRODUCTION_SITE_URL } from "@/lib/seo";
import { Analytics } from "@/components/analytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
