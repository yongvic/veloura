"use client";

import { useState } from "react";
import { signIn } from "@/app/auth-actions";
import { BrandMark } from "@/components/brand-mark";

export function ConnexionForm({
  invitation
}: {
  invitation: { email: string; inviterName: string; token: string } | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="auth-card shell-panel">
      <div className="auth-brand">
        <BrandMark size={48} />
        <div>
          <p className="auth-kicker">Veloura</p>
          <h1 className="auth-title">Connexion</h1>
        </div>
      </div>

      {invitation ? (
        <p className="auth-lead">
          {invitation.inviterName} t’invite. Connecte-toi avec{" "}
          <strong>{invitation.email}</strong> pour lier vos comptes.
        </p>
      ) : (
        <p className="auth-lead">Entre ton e-mail pour retrouver l’espace partagé.</p>
      )}

      <form action={onSubmit} className="auth-form">
        {invitation ? <input type="hidden" name="inviteToken" value={invitation.token} /> : null}

        {error ? (
          <div className="form-error-banner" role="alert">
            {error}
          </div>
        ) : null}

        <label className="form-field">
          <span className="form-label">E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="form-input"
            defaultValue={invitation?.email ?? ""}
            readOnly={Boolean(invitation)}
          />
        </label>

        <label className="form-field">
          <span className="form-label">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="form-input"
          />
        </label>

        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Connexion..." : invitation ? "Se connecter et rejoindre" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
