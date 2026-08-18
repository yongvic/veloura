"use server";

import { revalidatePath } from "next/cache";
import { hasDatabase } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/guard";

export async function adminDeleteUser(formData: FormData) {
  if (!hasDatabase()) return;
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  if (!userId) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, partnerId: true }
  });
  if (!user) return;
  if (user.role === "ADMIN") return;

  if (user.partnerId) {
    await prisma.user.update({
      where: { id: user.partnerId },
      data: { partnerId: null }
    });
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin");
}

export async function adminUnlinkCouple(formData: FormData) {
  if (!hasDatabase()) return;
  await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, partnerId: true }
  });
  if (!user?.partnerId) return;

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { partnerId: null } }),
    prisma.user.update({ where: { id: user.partnerId }, data: { partnerId: null } })
  ]);

  revalidatePath("/admin");
}
