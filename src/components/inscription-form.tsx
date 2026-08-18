"use client";

import { useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/auth-actions";
import { BrandMark } from "@/components/brand-mark";

export function InscriptionForm({
  invitation
}: {
  invitation: { email: string; inviterName: string; token: string; existingAccount: boolean } | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await signUp(formData);
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
          <h1 className="auth-title">{invitation ? "Rejoindre l’espace" : "Créer un espace"}</h1>
        </div>
      </div>

      {invitation?.existingAccount ? (
        <>
          <p className="auth-lead">
            {invitation.inviterName} t’invite. Un compte existe déjà pour{" "}
            <strong>{invitation.email}</strong>. Connecte-toi pour lier vos espaces.
          </p>
          <Link href={`/connexion?invite=${invitation.token}`} className="btn-primary w-full">
            Se connecter pour rejoindre
          </Link>
        </>
      ) : (
        <>
          {invitation ? (
            <p className="auth-lead">
              {invitation.inviterName} t’invite à relier vos deux comptes. L’inscription se fait avec{" "}
              <strong>{invitation.email}</strong>.
            </p>
          ) : (
            <p className="auth-lead">
              Crée ton compte, puis envoie une invitation à l’autre personne pour lier vos espaces.
            </p>
          )}

      <form action={onSubmit} className="auth-form">
        {invitation ? <input type="hidden" name="inviteToken" value={invitation.token} /> : null}

        {error ? (
          <div className="form-error-banner" role="alert">
            {error}
          </div>
        ) : null}

        <label className="form-field">
          <span className="form-label">Prénom</span>
          <input name="name" required minLength={2} autoComplete="name" className="form-input" />
        </label>

        <label className="form-field">
          <span className="form-label">E-mail</span>
          <input
            name="email"
            type="email"
            required
            defaultValue={invitation?.email ?? ""}
            readOnly={Boolean(invitation)}
            autoComplete="email"
            className="form-input"
          />
        </label>

        <label className="form-field">
          <span className="form-label">Mot de passe</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="form-input"
          />
        </label>

        {!invitation ? (
          <fieldset className="role-fieldset">
            <legend className="form-label">Ton rôle</legend>
            <label className="role-option">
              <input type="radio" name="role" value="RECIPIENT" defaultChecked />
              <span>
                <strong>Je note mes envies</strong>
                <small>C’est ma liste cadeaux</small>
              </span>
            </label>
            <label className="role-option">
              <input type="radio" name="role" value="GIFTER" />
              <span>
                <strong>Je prépare les cadeaux</strong>
                <small>Je consulte et je réserve</small>
              </span>
            </label>
          </fieldset>
        ) : null}

        <button type="submit" className="btn-primary w-full" disabled={pending}>
          {pending ? "Création..." : invitation ? "Rejoindre" : "Créer mon compte"}
        </button>
      </form>
        </>
      )}
    </div>
  );
}
