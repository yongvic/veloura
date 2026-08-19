import { getDashboardData } from "@/lib/data";
import { requireCouple } from "@/lib/guard";
import type { AppRole, DashboardData, WishSummary } from "@/lib/types";

/**
 * Protection de la surprise : le RECIPIENT ne doit jamais voir qu'une
 * envie est réservée. On masque côté serveur, avant tout rendu, pour
 * qu'aucun composant ne puisse fuiter le statut ou le nom du réservant.
 */
function maskReservation(wish: WishSummary): WishSummary {
  return { ...wish, status: "ACTIVE", reservedByName: null };
}

export function maskReservationsForRecipient(data: DashboardData): DashboardData {
  return {
    ...data,
    activeWishes: [...data.activeWishes, ...data.reservedWishes.map(maskReservation)],
    reservedWishes: []
  };
}

export async function getCoupleDashboard() {
  const { session, user, recipientId } = await requireCouple();
  const currentRole = user.role as AppRole;
  const raw = await getDashboardData(recipientId);
  const data = currentRole === "RECIPIENT" ? maskReservationsForRecipient(raw) : raw;

  return { session, user, recipientId, currentRole, data };
}
