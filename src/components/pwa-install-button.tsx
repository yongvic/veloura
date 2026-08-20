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

/**
 * Bouton « Installer l'app ».
 * - Chrome / Android : un clic ouvre le dialogue natif d'installation.
 * - iOS : un clic affiche les 2 étapes obligatoires (Apple interdit l'install auto).
 * - Déjà installé : le bouton disparaît.
 */
export function PwaInstallButton({
  className = "btn-secondary btn-secondary--sm",
  label = "Installer l'app"
}: {
  className?: string;
  label?: string;
}) {
  const [canPrompt, setCanPrompt] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    startPwaInstallCapture();

    const sync = () => {
      if (isPwaStandalone()) {
        setHidden(true);
        return;
      }
      setCanPrompt(Boolean(getDeferredInstallPrompt()));
      setHidden(false);
    };

    sync();
    return subscribePwaInstall(sync);
  }, []);

  async function handleClick() {
    if (isIosDevice()) {
      setShowIosHelp(true);
      return;
    }

    if (!canPrompt) {
      setShowIosHelp(true);
      return;
    }

    setBusy(true);
    const outcome = await promptNativeInstall();
    setBusy(false);
    if (outcome === "accepted" || isPwaStandalone()) {
      setHidden(true);
    }
  }

  if (hidden) return null;

  return (
    <>
      <button type="button" className={className} onClick={handleClick} disabled={busy}>
        <IconSparkle size={15} />
        <span>{busy ? "Installation..." : label}</span>
      </button>

      {showIosHelp ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Installer Veloura"
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
                  Ton navigateur ne propose pas encore l&apos;installation directe. Ouvre le menu
                  du navigateur et choisis <strong>Installer l&apos;application</strong> ou{" "}
                  <strong>Ajouter à l&apos;écran d&apos;accueil</strong>.
                </p>
              )}

              <div className="modal-card__footer">
                <button type="button" className="btn-primary w-full" onClick={() => setShowIosHelp(false)}>
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
