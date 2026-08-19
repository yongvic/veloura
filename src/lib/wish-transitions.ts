import type { WishStatus } from "@/lib/types";

/**
 * Machine à états des envies — source de vérité unique.
 *
 *   ACTIVE ──reserve──▶ RESERVED ──gift──▶ GIFTED
 *     │                    │
 *     │◀──unreserve────────┘
 *     └──────gift (direct, sans réservation)──▶ GIFTED
 *
 * GIFTED est terminal : le souvenir attaché ne doit jamais être
 * réécrit, détruit ou ramené dans la liste active.
 */

export function canReserve(status: WishStatus): boolean {
  return status === "ACTIVE";
}

export function canUnreserve(status: WishStatus): boolean {
  return status === "RESERVED";
}

export function canMarkGifted(status: WishStatus): boolean {
  return status === "ACTIVE" || status === "RESERVED";
}

export function canDeleteWish(status: WishStatus): boolean {
  return status !== "GIFTED";
}

export function canEditWish(status: WishStatus): boolean {
  return status !== "GIFTED";
}

export const TRANSITION_ERRORS = {
  reserve: "Cette envie n'est plus disponible (déjà réservée ou offerte).",
  unreserve: "Cette envie n'est pas réservée par toi.",
  gift: "Cette envie est déjà marquée comme offerte.",
  delete: "Une envie déjà offerte ne se supprime pas : elle fait partie de vos souvenirs.",
  edit: "Une envie déjà offerte ne se modifie plus."
} as const;
