"use client";

import { useEffect, useState } from "react";
import { IconSparkle, IconX } from "@/components/icons";

const DISMISS_KEY = "veloura-pwa-install-dismissed";
const DISMISS_DAYS = 14;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  const media = window.matchMedia("(display-mode: standalone)").matches;
  const iosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
  return media || iosStandalone;
}

function isIosSafari() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Android/.test(ua);
  return isIos && (isSafari || /Safari/.test(ua));
}

function wasDismissedRecently() {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const at = Number(raw);
    if (!Number.isFinite(at)) return false;
    return Date.now() - at < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Invite discrète à installer Veloura sur l'écran d'accueil.
 * Chrome/Android : bouton natif via beforeinstallprompt.
 * iOS Safari : consignes Partager → Sur l'écran d'accueil.
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHints, setIosHints] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isStandalone() || wasDismissedRecently()) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIosHints(false);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS n'émet pas beforeinstallprompt : on propose les consignes après un court délai.
    const timer = window.setTimeout(() => {
      if (!isStandalone() && !wasDismissedRecently() && isIosSafari()) {
        setIosHints(true);
        setVisible(true);
      }
    }, 1800);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore storage failures
    }
    setVisible(false);
    setDeferredPrompt(null);
  }

  async function install() {
    if (!deferredPrompt) return;
    setBusy(true);
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch {
      // L'utilisateur a pu annuler — on ferme simplement.
    } finally {
      setBusy(false);
      setDeferredPrompt(null);
      setVisible(false);
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch {
        // ignore
      }
    }
  }

  if (!visible) return null;

  return (
    <div className="pwa-install" role="dialog" aria-label="Installer Veloura" aria-live="polite">
      <div className="pwa-install__icon" aria-hidden="true">
        <IconSparkle size={18} />
      </div>
      <div className="pwa-install__copy">
        <strong className="pwa-install__title">Installer Veloura</strong>
        {iosHints ? (
          <p className="pwa-install__text">
            Sur iPhone : appuie sur <strong>Partager</strong>, puis{" "}
            <strong>Sur l&apos;écran d&apos;accueil</strong>.
          </p>
        ) : (
          <p className="pwa-install__text">
            Ajoute l&apos;app à ton écran d&apos;accueil pour y accéder plus vite, même hors navigateur.
          </p>
        )}
      </div>
      <div className="pwa-install__actions">
        {!iosHints ? (
          <button type="button" className="btn-primary btn-primary--sm" onClick={install} disabled={busy}>
            {busy ? "Ouverture..." : "Installer"}
          </button>
        ) : null}
        <button
          type="button"
          className="pwa-install__close"
          onClick={dismiss}
          aria-label="Fermer l'invitation d'installation"
        >
          <IconX size={16} />
        </button>
      </div>
    </div>
  );
}
