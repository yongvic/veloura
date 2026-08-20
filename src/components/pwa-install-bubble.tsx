"use client";

import { useEffect, useState } from "react";
import { IconSparkle, IconX } from "@/components/icons";
import {
  getDeferredInstallPrompt,
  isIosDevice,
  isPwaStandalone,
  promptNativeInstall,
  startPwaInstallCapture,
  subscribePwaInstall
} from "@/lib/pwa-install";

const DISMISS_KEY = "veloura-pwa-bubble-dismissed";
const DISMISS_DAYS = 14;

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

function rememberDismiss() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

/**
 * Bulle flottante « Installer » — fermable.
 * Chrome/Android : clic = dialogue natif.
 * iOS : clic = consignes Partager → Écran d'accueil.
 */
export function PwaInstallBubble() {
  const [canPrompt, setCanPrompt] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    startPwaInstallCapture();

    if (isPwaStandalone() || wasDismissedRecently()) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!isPwaStandalone() && !wasDismissedRecently()) {
        setCanPrompt(Boolean(getDeferredInstallPrompt()));
        setVisible(true);
      }
    }, 1200);

    const unsubscribe = subscribePwaInstall(() => {
      if (isPwaStandalone()) {
        setVisible(false);
        return;
      }
      setCanPrompt(Boolean(getDeferredInstallPrompt()));
    });

    return () => {
      window.clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  function dismiss() {
    rememberDismiss();
    setVisible(false);
    setShowIosHelp(false);
  }

  async function handleInstall() {
    if (isIosDevice() || !canPrompt) {
      setShowIosHelp(true);
      return;
    }

    setBusy(true);
    const outcome = await promptNativeInstall();
    setBusy(false);

    if (outcome === "accepted" || isPwaStandalone()) {
      rememberDismiss();
      setVisible(false);
      return;
    }

    // Prompt consommé sans acceptation : on retire la bulle pour cette session.
    if (outcome !== "unavailable") {
      rememberDismiss();
      setVisible(false);
    }
  }

  if (!visible) return null;

  return (
    <>
      <div className="pwa-bubble" role="dialog" aria-label="Installer Veloura">
        <button
          type="button"
          className="pwa-bubble__close"
          onClick={dismiss}
          aria-label="Fermer"
        >
          <IconX size={14} />
        </button>

        <button
          type="button"
          className="pwa-bubble__main"
          onClick={handleInstall}
          disabled={busy}
        >
          <span className="pwa-bubble__icon" aria-hidden="true">
            <IconSparkle size={18} />
          </span>
          <span className="pwa-bubble__copy">
            <strong>{busy ? "Installation..." : "Installer Veloura"}</strong>
            <small>Sur ton écran d&apos;accueil</small>
          </span>
        </button>
      </div>

      {showIosHelp ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Comment installer Veloura"
          onClick={(event) => {
            if (event.target === event.currentTarget) setShowIosHelp(false);
          }}
        >
          <div className="modal-card modal-card--sm">
            <div className="modal-card__header">
              <div className="modal-card__identity">
                <div className="modal-card__icon-badge">
                  <IconSparkle size={18} />
                </div>
                <div>
                  <span className="modal-card__subtitle">Application</span>
                  <h2 className="modal-card__title">Installer Veloura</h2>
                </div>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowIosHelp(false)}
                aria-label="Fermer"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="composer-form-inner">
              {isIosDevice() ? (
                <ol className="pwa-install-steps">
                  <li>
                    Appuie sur le bouton <strong>Partager</strong> en bas de Safari.
                  </li>
                  <li>
                    Choisis <strong>Sur l&apos;écran d&apos;accueil</strong>, puis{" "}
                    <strong>Ajouter</strong>.
                  </li>
                </ol>
              ) : (
                <p className="modal-body-text">
                  Ouvre le menu du navigateur et choisis{" "}
                  <strong>Installer l&apos;application</strong> ou{" "}
                  <strong>Ajouter à l&apos;écran d&apos;accueil</strong>.
                </p>
              )}

              <div className="modal-card__footer">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={dismiss}
                >
                  Ne plus afficher
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowIosHelp(false)}
                >
                  Compris
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
