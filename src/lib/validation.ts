import type { WishPriority } from "@/lib/types";

export const WISH_PRIORITIES: readonly WishPriority[] = [
  "MUST_HAVE",
  "WOULD_LOVE",
  "MAYBE_LATER",
  "LUXURY"
];

export const WISH_CATEGORIES = [
  "Mode",
  "Bijoux",
  "Beauté",
  "Maison",
  "Maroquinerie",
  "Voyage",
  "Tech",
  "Surprise"
] as const;

export const MAX_PRICE_FCFA = 100_000_000;

export function parseWishPriority(value: unknown): WishPriority {
  const raw = String(value ?? "").trim();
  return (WISH_PRIORITIES as readonly string[]).includes(raw)
    ? (raw as WishPriority)
    : "WOULD_LOVE";
}

export function parseCategory(value: unknown): string {
  const raw = String(value ?? "").trim();
  return (WISH_CATEGORIES as readonly string[]).includes(raw) ? raw : "Autre";
}

/**
 * N'accepte que les URLs http(s) absolues. Tout le reste (javascript:,
 * data:, schémas relatifs…) est rejeté pour éviter un lien piégé stocké
 * puis cliqué par le partenaire.
 */
export function parseProductUrl(
  value: unknown
): { url: string | null } | { error: string } {
  const raw = String(value ?? "").trim();
  if (!raw) return { url: null };
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { error: "Le lien boutique doit commencer par https:// (ou http://)." };
    }
    if (raw.length > 2000) return { error: "Le lien boutique est trop long." };
    return { url: parsed.toString() };
  } catch {
    return { error: "Le lien boutique n'est pas une URL valide." };
  }
}

export function parsePriceFcfa(
  value: unknown
): { price: number | null } | { error: string } {
  const raw = String(value ?? "").trim();
  if (!raw) return { price: null };
  const price = Number(raw);
  if (!Number.isFinite(price) || !Number.isInteger(price) || price < 0) {
    return { error: "Le prix doit être un nombre entier positif (en FCFA)." };
  }
  if (price > MAX_PRICE_FCFA) {
    return { error: "Le prix semble trop élevé. Vérifie le montant." };
  }
  return { price };
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Découpe une saisie libre (virgules ou retours à la ligne) en liste bornée. */
export function parseTagList(value: unknown, maxItems = 20, maxLength = 80): string[] {
  return String(value ?? "")
    .split(/[,\n]/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, maxItems)
    .map((entry) => entry.slice(0, maxLength));
}

export function clampText(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().slice(0, maxLength);
}
