"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { uploadWishPhoto } from "@/lib/blob";
import { hasDatabase } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireCouple } from "@/lib/guard";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/wishes");
  revalidatePath("/history");
  revalidatePath("/occasions");
  revalidatePath("/preferences");
}

async function assertWishAccess(wishId: string, recipientId: string) {
  const wish = await prisma.wish.findFirst({
    where: { id: wishId, recipientId },
    select: { id: true, status: true, reservedById: true }
  });
  return wish;
}

export async function createWish(formData: FormData) {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { recipientId } = await requireCouple();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "Ajoute un titre pour cette envie." };
  }

  const occasionId = String(formData.get("occasionId") ?? "").trim();
  const photo = formData.get("photo");
  const file = photo instanceof File ? photo : null;

  let uploaded;
  try {
    uploaded = await uploadWishPhoto(file);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impossible d'enregistrer la photo." };
  }

  await prisma.wish.create({
    data: {
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      imageUrl: uploaded?.url ?? null,
      imageBlobPath: uploaded?.blobPath ?? null,
      productUrl: String(formData.get("productUrl") ?? "").trim() || null,
      category: String(formData.get("category") ?? "Autre").trim() || "Autre",
      priority: (String(formData.get("priority") ?? "WOULD_LOVE").trim() as
        | "MUST_HAVE"
        | "WOULD_LOVE"
        | "MAYBE_LATER"
        | "LUXURY"),
      recipientId,
      occasionId: occasionId || null
    }
  });

  revalidateAll();
  return { ok: true };
}

export async function reserveWish(formData: FormData) {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "GIFTER") {
    return { error: "Seul celui qui offre peut réserver un cadeau." };
  }

  const wishId = String(formData.get("wishId") ?? "");
  const wish = wishId ? await assertWishAccess(wishId, recipientId) : null;
  if (!wish) {
    return { error: "Envie introuvable." };
  }

  await prisma.wish.update({
    where: { id: wishId },
    data: {
      status: "RESERVED",
      reservedById: session.userId
    }
  });

  revalidateAll();
  return { ok: true };
}

export async function markGifted(formData: FormData) {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "GIFTER") {
    return { error: "Seul celui qui offre peut marquer un cadeau comme offert." };
  }

  const wishId = String(formData.get("wishId") ?? "");
  const wish = wishId ? await assertWishAccess(wishId, recipientId) : null;
  if (!wish) {
    return { error: "Envie introuvable." };
  }

  const note = String(formData.get("note") ?? "").trim();
  const reaction = String(formData.get("reaction") ?? "").trim();
  const giftedAt = new Date();

  await prisma.$transaction([
    prisma.wish.update({
      where: { id: wishId },
      data: {
        status: "GIFTED",
        giftedAt
      }
    }),
    prisma.giftHistory.upsert({
      where: { wishId },
      update: {
        giftedAt,
        note: note || null,
        reaction: reaction || "A adoré"
      },
      create: {
        wishId,
        giftedAt,
        note: note || null,
        reaction: reaction || "A adoré"
      }
    })
  ]);

  revalidateAll();
  return { ok: true };
}

export async function deleteWish(formData: FormData) {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "RECIPIENT") {
    return { error: "Seule la personne qui note les envies peut en retirer une." };
  }

  const wishId = String(formData.get("wishId") ?? "");
  const wish = wishId
    ? await prisma.wish.findFirst({
        where: { id: wishId, recipientId },
        select: { imageBlobPath: true, imageUrl: true }
      })
    : null;

  if (!wish) {
    return { error: "Envie introuvable." };
  }

  await prisma.wish.delete({ where: { id: wishId } });

  if (wish.imageBlobPath && process.env.BLOB_READ_WRITE_TOKEN) {
    await del(wish.imageUrl ?? wish.imageBlobPath, {
      token: process.env.BLOB_READ_WRITE_TOKEN
    }).catch(() => undefined);
  }

  revalidateAll();
  return { ok: true };
}
