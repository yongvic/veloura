"use client";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <body>
        <div style={{ padding: "2rem 1rem", fontFamily: "sans-serif", maxWidth: 420, margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5rem" }}>La page n’a pas pu s’afficher</h1>
          <p>Un problème est survenu. Recharge pour réessayer.</p>
          <button type="button" onClick={() => reset()}>
            Recharger
          </button>
        </div>
      </body>
    </html>
  );
}
