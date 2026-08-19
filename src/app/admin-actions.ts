"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { hashPassword } from "@/lib/auth";
import { hasDatabase } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

type AdminResult = { error?: string; ok?: boolean; tempPassword?: string };

export async function adminDeleteUser(formData: FormData): Promise<AdminResult> {
  if (!hasDatabase()) return { error: "La base n'est pas encore connectée." };
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "Compte introuvable." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, partnerId: true }
  });
  if (!user) return { error: "Compte introuvable." };
  if (user.role === "ADMIN") return { error: "Impossible de supprimer un compte admin." };

  const wishImages = await prisma.wish.findMany({
    where: { recipientId: userId },
    select: { imageUrl: true, imageBlobPath: true }
  });

  await prisma.$transaction(async (tx) => {
    if (user.partnerId) {
      await tx.user.updateMany({
        where: { id: user.partnerId, partnerId: userId },
        data: { partnerId: null }
      });
    }
    await tx.user.delete({ where: { id: userId } });
  });

  // Purge best-effort des photos après suppression du compte.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const paths = wishImages
      .map((image) => image.imageUrl ?? image.imageBlobPath)
      .filter((value): value is string => Boolean(value));
    await Promise.all(
      paths.map((path) =>
        del(path, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch((error) =>
          console.error("admin blob delete", error)
        )
      )
    );
  }

  revalidatePath("/admin");
  return { ok: true };
}

export async function adminUnlinkCouple(formData: FormData): Promise<AdminResult> {
  if (!hasDatabase()) return { error: "La base n'est pas encore connectée." };
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, partnerId: true }
  });
  if (!user?.partnerId) return { error: "Ce compte n'est lié à personne." };

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { partnerId: null } }),
    prisma.user.updateMany({
      where: { id: user.partnerId, partnerId: user.id },
      data: { partnerId: null }
    })
  ]);

  revalidatePath("/admin");
  return { ok: true };
}

/**
 * Réinitialisation par l'admin : génère un mot de passe temporaire
 * affiché une seule fois côté admin (jamais stocké en clair).
 */
export async function adminResetPassword(formData: FormData): Promise<AdminResult> {
  if (!hasDatabase()) return { error: "La base n'est pas encore connectée." };
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return { error: "Compte introuvable." };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  });
  if (!user) return { error: "Compte introuvable." };
  if (user.role === "ADMIN") {
    return { error: "Le mot de passe admin se change via ADMIN_PASSWORD + bootstrap." };
  }

  const tempPassword = randomBytes(9).toString("base64url");
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(tempPassword) }
  });

  revalidatePath("/admin");
  return { ok: true, tempPassword };
}
