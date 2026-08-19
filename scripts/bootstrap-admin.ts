/**
 * Bootstrap admin manuel : `npm run bootstrap:admin`.
 * Crée le compte admin (ou applique la rotation de ADMIN_PASSWORD)
 * sans démarrer l'application. Idempotent.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(file: string) {
  const path = resolve(file);
  if (!existsSync(path)) return;

  for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

async function main() {
  const { ensureAdminUser } = await import("../src/lib/guard");
  await ensureAdminUser();
  console.log("Compte admin vérifié/créé pour", process.env.ADMIN_EMAIL ?? "(ADMIN_EMAIL non défini)");
}

main().catch((error) => {
  console.error("Bootstrap admin échoué :", error);
  process.exit(1);
});
