"use client";

export default function ErrorPage({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="auth-screen">
      <div className="auth-card shell-panel">
        <p className="auth-kicker">Veloura</p>
        <h1 className="auth-title">La page n’a pas pu s’afficher</h1>
        <p className="auth-lead">Un problème est survenu côté serveur. Recharge pour réessayer.</p>
        <button type="button" className="btn-primary w-full" onClick={() => reset()}>
          Recharger
        </button>
      </div>
    </div>
  );
}
