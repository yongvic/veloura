"use client";

import { useActionState, useState } from "react";
import { createInvitation } from "@/app/auth-actions";
import { IconCopy, IconGift } from "@/components/icons";

export function InviteForm({ defaultEmail }: { defaultEmail?: string }) {
  const [copied, setCopied] = useState(false);
  const [state, action, pending] = useActionState(createInvitation, null);

  async function copyLink() {
    if (!state?.inviteUrl) return;
    await navigator.clipboard.writeText(state.inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <form action={action} className="auth-form">
      {state?.error ? (
        <div className="form-error-banner" role="alert">
          {state.error}
        </div>
      ) : null}

      <label className="form-field">
        <span className="form-label">E-mail de l’autre personne</span>
        <input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          placeholder="son.email@exemple.com"
          className="form-input"
        />
      </label>

      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Création du lien..." : "Créer l'invitation"}
      </button>

      {state?.inviteUrl ? (
        <div className="invite-link-box">
          <p className="invite-link-label">
            <IconGift size={16} /> Envoie ce lien. Si la personne n’a pas encore de compte, elle
            s’inscrit. Si elle est déjà inscrite, elle se connecte avec le même lien et vos
            comptes se lient.
          </p>
          <code className="invite-link-url">{state.inviteUrl}</code>
          <button type="button" className="btn-secondary w-full" onClick={copyLink}>
            <IconCopy size={16} />
            {copied ? "Lien copié" : "Copier le lien"}
          </button>
        </div>
      ) : null}
    </form>
  );
}
