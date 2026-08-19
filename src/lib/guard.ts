import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, verifyPassword, type SessionUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/env";

const DEFAULT_OCCASIONS = [
  { name: "Anniversaire", slug: "anniversaire", description: "Son moment phare de l'année" },
  { name: "Noël", slug: "noel", description: "Les cadeaux qui font chaud au cœur" },
  { name: "Saint-Valentin", slug: "saint-valentin", description: "Les attentions romantiques" },
  { name: "Surprise", slug: "surprise", description: "Sans date spéciale, juste pour faire plaisir" }
];

/**
 * Bootstrap/réparation du compte admin. Idempotent. Si ADMIN_PASSWORD a
 * changé depuis la création, le hash est régénéré (rotation effective).
 * Appelé au démarrage (instrumentation) et via `npm run bootstrap:admin`,
 * jamais dans le hot path d'une requête utilisateur.
 */
export async function ensureAdminUser() {
  if (!hasDatabase()) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const passwordStillValid = await verifyPassword(password, existing.passwordHash);
    if (existing.role !== "ADMIN" || !passwordStillValid) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: "ADMIN",
          partnerId: null,
          ...(passwordStillValid ? {} : { passwordHash: await hashPassword(password) })
        }
      });
    }
    return;
  }

  await prisma.user.create({
    data: {
      email,
      name: "Admin",
      role: "ADMIN",
      passwordHash: await hashPassword(password)
    }
  });
}

export async function ensureDefaultOccasions(recipientId: string) {
  const count = await prisma.occasion.count({ where: { ownerId: recipientId } });
  if (count > 0) return;

  await prisma.occasion.createMany({
    data: DEFAULT_OCCASIONS.map((occasion) => ({
      ...occasion,
      ownerId: recipientId
    }))
  });
}

/**
 * Garde de session stricte : le JWT seul ne suffit pas. L'utilisateur
 * doit encore exister en base, et le rôle retourné est celui de la base
 * (un JWT de 30 jours peut être périmé après une promotion/rétrogradation).
 */
export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/connexion");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true }
  });
  if (!dbUser) redirect("/connexion");

  return { ...session, role: dbUser.role };
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireUser();
  if (session.role !== "ADMIN") redirect("/");
  return session;
}

export async function requireCouple() {
  const session = await getSession();
  if (!session) redirect("/connexion");
  if (session.role === "ADMIN") redirect("/admin");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      partnerId: true,
      partner: { select: { id: true, name: true, email: true, role: true } }
    }
  });

  if (!user) {
    redirect("/connexion");
  }

  if (!user.partnerId || !user.partner) {
    redirect("/inviter");
  }

  const recipientId = user.role === "RECIPIENT" ? user.id : user.partner.id;

  return { session, user, recipientId };
}
