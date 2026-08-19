"use client";

/**
 * Date formatée dans le fuseau du navigateur (et non en UTC serveur).
 * suppressHydrationWarning : le HTML serveur (UTC) peut différer du
 * rendu client d'un jour autour de minuit — c'est voulu.
 */
export function LocalDate({ value }: { value: Date | string | null | undefined }) {
  if (!value) {
    return <span>Date flexible</span>;
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return (
    <span suppressHydrationWarning>
      {new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(date)}
    </span>
  );
}
