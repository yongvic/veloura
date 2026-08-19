export function getDatabaseUrl() {
  return process.env.DATABASE_URL ?? "";
}

export function hasDatabase() {
  const url = getDatabaseUrl();
  if (!url.startsWith("postgres://") && !url.startsWith("postgresql://")) return false;
  return !url.includes("USER:PASSWORD") && !url.includes("your_");
}

/**
 * Secret de signature des sessions. En production, l'absence de secret
 * doit empêcher toute signature/vérification plutôt que de retomber
 * sur une valeur publique connue du repo.
 */
export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (secret && secret.length >= 16) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET manquant ou trop court (16+ caractères requis).");
  }
  return new TextEncoder().encode("veloura-dev-auth-secret");
}

/**
 * Échec franc au démarrage : en production, une config incomplète doit
 * empêcher le boot plutôt que de dégrader silencieusement l'app.
 */
export function assertProductionEnv() {
  if (process.env.NODE_ENV !== "production") return;

  const missing: string[] = [];
  if (!hasDatabase()) missing.push("DATABASE_URL");
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 16) missing.push("AUTH_SECRET (16+ caractères)");
  if (!process.env.BLOB_READ_WRITE_TOKEN) missing.push("BLOB_READ_WRITE_TOKEN");

  if (missing.length > 0) {
    throw new Error(`Configuration incomplète : ${missing.join(", ")}`);
  }
}
