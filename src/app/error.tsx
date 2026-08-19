"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Digest remonté côté client pour corréler avec les logs serveur.
    console.error("page error", error.digest ?? error.message);
  }, [error]);

  return (
    <div className="auth-screen">
      <div className="auth-card shell-panel">
        <p className="auth-kicker">Veloura</p>
        <h1 className="auth-title">La page n’a pas pu s’afficher</h1>
        <p className="auth-lead">
          Un problème est survenu côté serveur. Tes données sont en sécurité — recharge pour
          réessayer.
        </p>
        <button type="button" className="btn-primary w-full" onClick={() => reset()}>
          Recharger
        </button>
      </div>
    </div>
  );
}
