import type { WishPriority } from "@/lib/types";

/**
 * Constantes d'affichage partagées entre Server et Client Components.
 * Elles ne peuvent pas vivre dans un module "use client" : un Server
 * Component qui importe une valeur d'un module client reçoit une
 * référence client, pas l'objet — la valeur y est `undefined`.
 */
export const priorityConfig: Record<
  WishPriority,
  { label: string; tone: "primary" | "accent" | "gold" | "muted"; icon: string }
> = {
  MUST_HAVE: { label: "Indispensable", tone: "accent", icon: "★" },
  WOULD_LOVE: { label: "Coup de cœur", tone: "primary", icon: "♥" },
  LUXURY: { label: "Luxe & Rêve", tone: "gold", icon: "✦" },
  MAYBE_LATER: { label: "Plus tard", tone: "muted", icon: "•" }
};

export const reactionOptions = [
  "A adoré !",
  "Émue aux larmes",
  "Grand coup de cœur",
  "Porté/utilisé tout de suite",
  "Très heureuse",
  "Un souvenir inoubliable"
];
