import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, type SessionUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/env";

const DEFAULT_OCCASIONS = [
  { name: "Anniversaire", slug: "anniversaire", description: "Son moment phare de l'année" },
  { name: "Noël", slug: "noel", description: "Les cadeaux qui font chaud au cœur" },
  { name: "Saint-Valentin", slug: "saint-valentin", description: "Les attentions romantiques" },
  { name: "Surprise", slug: "surprise", description: "Sans date spéciale, juste pour faire plaisir" }
];

export async function ensureAdminUser() {
  if (!hasDatabase()) return;
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 8) return;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { id: existing.id },
        data: { role: "ADMIN", partnerId: null }
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

export async function requireUser(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/connexion");
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await requireUser();
  if (session.role !== "ADMIN") redirect("/");
  return session;
}

export type CoupleUser = {
  id: string;
  name: string;
  email: string;
  role: "RECIPIENT" | "GIFTER" | "ADMIN";
  partnerId: string | null;
  partner: { id: string; name: string; email: string; role: "RECIPIENT" | "GIFTER" | "ADMIN" } | null;
};

export async function requireCouple() {
  const session = await requireUser();
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
  if (user.role === "RECIPIENT") {
    await ensureDefaultOccasions(user.id);
  } else {
    await ensureDefaultOccasions(recipientId);
  }

  return { session, user, recipientId };
}

export function getRecipientId(user: CoupleUser) {
  if (user.role === "RECIPIENT") return user.id;
  return user.partnerId as string;
}
