import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

export const viewport: Viewport = {
  themeColor: "#2b0b1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "Veloura - Écrin de souhaits & attentions",
  description: "Wishlist cadeaux intime et raffinée. Ajoutez vos envies en quelques secondes, organisez vos occasions et gardez la mémoire des cadeaux offerts.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={sans.variable}>{children}</body>
    </html>
  );
}
