"use client";

import { useEffect } from "react";
import { startPwaInstallCapture } from "@/lib/pwa-install";

/**
 * Enregistre le service worker Veloura en production et capture
 * l'événement d'installation dès le chargement de la page.
 */
export function PwaRegister() {
  useEffect(() => {
    startPwaInstallCapture();

    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none"
        });
        registration.update().catch(() => undefined);
      } catch (error) {
        console.error("pwa register", error);
      }
    };

    void register();
  }, []);

  return null;
}
