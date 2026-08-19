/**
 * Hook de démarrage Next.js : validation franche de la config en prod,
 * puis bootstrap admin idempotent. Sort les deux du hot path des requêtes.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { assertProductionEnv } = await import("@/lib/env");
  assertProductionEnv();

  try {
    const { ensureAdminUser } = await import("@/lib/guard");
    await ensureAdminUser();
  } catch (error) {
    // Le login admin réessaie (ensureAdminIfRelevant) — ne pas empêcher
    // le démarrage pour une base momentanément injoignable.
    console.error("bootstrap admin", error);
  }
}
