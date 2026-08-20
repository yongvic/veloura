import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { PwaInstallBubble } from "@/components/pwa-install-bubble";
import { PwaRegister } from "@/components/pwa-register";

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
  viewportFit: "cover",
  colorScheme: "dark light"
};

export const metadata: Metadata = {
  applicationName: "Veloura",
  title: "Veloura - Écrin de souhaits & attentions",
  description:
    "Wishlist cadeaux intime et raffinée. Ajoutez vos envies en quelques secondes, organisez vos occasions et gardez la mémoire des cadeaux offerts.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Veloura"
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  },
  other: {
    "mobile-web-app-capable": "yes"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={sans.variable}>
        <a href="#main-content" className="skip-link">
          Aller au contenu principal
        </a>
        {children}
        <PwaRegister />
        <PwaInstallBubble />
      </body>
    </html>
  );
}
