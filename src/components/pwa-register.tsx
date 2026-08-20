"use client";

import { useEffect } from "react";

/**
 * Enregistre le service worker Veloura en production uniquement.
 * updateViaCache: 'none' force le navigateur à revalider sw.js à chaque visite.
 */
export function PwaRegister() {
  useEffect(() => {
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
