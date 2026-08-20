"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signUp } from "@/app/auth-actions";
import { BrandMark } from "@/components/brand-mark";
import { IconGift, IconHeart } from "@/components/icons";
import { PwaInstallButton } from "@/components/pwa-install-button";

export function InscriptionForm({
  invitation
}: {
  invitation: { email: string; inviterName: string; token: string; existingAccount: boolean } | null;
}) {
  const [state, formAction, pending] = useActionState(signUp, null);
  const [role, setRole] = useState<"RECIPIENT" | "GIFTER">("RECIPIENT");
  const loginHref = invitation ? `/connexion?invite=${invitation.token}` : "/connexion";

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
          <Link href={loginHref} className="btn-primary w-full">
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
              Crée ton compte, puis envoie une invitation à l’autre personne.
            </p>
          )}

          <form action={formAction} className="auth-form">
            {invitation ? <input type="hidden" name="inviteToken" value={invitation.token} /> : null}

            {state?.error ? (
              <div className="form-error-banner" role="alert">
                {state.error}
              </div>
            ) : null}

            <label className="form-field">
              <span className="form-label">Prénom</span>
              <input name="name" required minLength={2} autoComplete="given-name" className="form-input" />
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
              <fieldset className="role-picker">
                <legend className="role-picker__legend">Qui es-tu dans cet espace ?</legend>

                <label className={`role-card ${role === "RECIPIENT" ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="RECIPIENT"
                    checked={role === "RECIPIENT"}
                    onChange={() => setRole("RECIPIENT")}
                  />
                  <span className="role-card__icon">
                    <IconHeart size={18} />
                  </span>
                  <span className="role-card__copy">
                    <strong>Je note mes envies</strong>
                    <small>C’est ma liste cadeaux. J’ajoute ce que je souhaite.</small>
                  </span>
                </label>

                <label className={`role-card ${role === "GIFTER" ? "is-selected" : ""}`}>
                  <input
                    type="radio"
                    name="role"
                    value="GIFTER"
                    checked={role === "GIFTER"}
                    onChange={() => setRole("GIFTER")}
                  />
                  <span className="role-card__icon">
                    <IconGift size={18} />
                  </span>
                  <span className="role-card__copy">
                    <strong>Je prépare les cadeaux</strong>
                    <small>Je consulte la liste, je réserve, j’offre.</small>
                  </span>
                </label>
              </fieldset>
            ) : null}

            <button type="submit" className="btn-primary w-full" disabled={pending}>
              {pending ? "Création..." : invitation ? "Rejoindre" : "Créer mon compte"}
            </button>

            <PwaInstallButton className="btn-secondary w-full" label="Installer l'application" />
          </form>
        </>
      )}

      <p className="auth-switch">
        Déjà un compte ? <Link href={loginHref}>Se connecter</Link>
      </p>
    </div>
  );
}
