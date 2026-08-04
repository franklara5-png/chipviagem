import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getSeoMetadata, PRODUCTION_SITE_URL } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  ...getSeoMetadata(),
  metadataBase: new URL(PRODUCTION_SITE_URL),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
