"use client";

import { useState, useTransition } from "react";
import { adminDeleteUser, adminResetPassword, adminUnlinkCouple } from "@/app/admin-actions";
import { IconCopy, IconKey } from "@/components/icons";

type ActionResult = { error?: string; ok?: boolean; tempPassword?: string };

/**
 * Actions admin sur un compte : confirmations explicites avant toute
 * destruction, et réinitialisation de mot de passe avec affichage unique.
 */
export function AdminUserActions({
  userId,
  userName,
  hasPartner
}: {
  userId: string;
  userName: string;
  hasPartner: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function run(action: (formData: FormData) => Promise<ActionResult>, confirmMessage: string) {
    if (!window.confirm(confirmMessage)) return;
    setError(null);
    setTempPassword(null);
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("userId", userId);
        const result = await action(formData);
        if (result?.error) {
          setError(result.error);
        } else if (result?.tempPassword) {
          setTempPassword(result.tempPassword);
        }
      } catch {
        setError("Action impossible pour le moment. Réessaie.");
      }
    });
  }

  async function copyTempPassword() {
    if (!tempPassword) return;
    try {
      await navigator.clipboard.writeText(tempPassword);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="admin-user-actions">
      <div className="admin-user-actions__buttons">
        {hasPartner ? (
          <button
            type="button"
            className="btn-ghost"
            disabled={isPending}
            onClick={() =>
              run(
                adminUnlinkCouple,
                `Délier ${userName} de son partenaire ? Les deux comptes restent, le lien couple est rompu.`
              )
            }
          >
            Délier
          </button>
        ) : null}
        <button
          type="button"
          className="btn-secondary btn-secondary--sm"
          disabled={isPending}
          onClick={() =>
            run(
              adminResetPassword,
              `Réinitialiser le mot de passe de ${userName} ? Un mot de passe temporaire sera généré.`
            )
          }
        >
          <IconKey size={14} /> Réinitialiser MDP
        </button>
        <button
          type="button"
          className="btn-danger btn-secondary--sm"
          disabled={isPending}
          onClick={() =>
            run(
              adminDeleteUser,
              `SUPPRIMER définitivement ${userName} ?\n\nToutes ses envies, souvenirs et invitations seront effacés. Cette action est irréversible.`
            )
          }
        >
          Supprimer
        </button>
      </div>

      {error ? (
        <p className="form-error-banner" role="alert">
          <span>{error}</span>
        </p>
      ) : null}

      {tempPassword ? (
        <p className="admin-temp-password" role="status">
          Mot de passe temporaire pour {userName} (affiché une seule fois) :{" "}
          <code>{tempPassword}</code>
          <button type="button" className="btn-ghost btn-secondary--sm" onClick={copyTempPassword}>
            <IconCopy size={13} /> {copied ? "Copié !" : "Copier"}
          </button>
        </p>
      ) : null}
    </div>
  );
}
