"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/app/auth-actions";
import { BrandMark } from "@/components/brand-mark";
import { PwaInstallButton } from "@/components/pwa-install-button";

export function ConnexionForm({
  invitation
}: {
  invitation: { email: string; inviterName: string; token: string } | null;
}) {
  const [state, formAction, pending] = useActionState(signIn, null);
  const signupHref = invitation ? `/inscription?invite=${invitation.token}` : "/inscription";

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
        <p className="auth-lead">Entre ton e-mail et ton mot de passe.</p>
      )}

      <form action={formAction} className="auth-form">
        {invitation ? <input type="hidden" name="inviteToken" value={invitation.token} /> : null}

        {state?.error ? (
          <div className="form-error-banner" role="alert">
            {state.error}
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

        <PwaInstallButton className="btn-secondary w-full" label="Installer l'application" />
      </form>

      <p className="auth-switch">
        Pas encore de compte ? <Link href={signupHref}>Créer un espace</Link>
      </p>
    </div>
  );
}
