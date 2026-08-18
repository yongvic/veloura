"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";

import { uploadWishPhoto } from "@/lib/blob";
import { hasDatabase } from "@/lib/env";
import { prisma } from "@/lib/prisma";

async function getDefaultRecipient() {
  return prisma.user.findFirst({
    where: { role: "RECIPIENT" },
    select: { id: true }
  });
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/wishes");
  revalidatePath("/history");
  revalidatePath("/occasions");
  revalidatePath("/preferences");
}

export async function createWish(formData: FormData) {
  if (!hasDatabase()) {
    return { error: "La base Neon n'est pas encore connectee." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (!title) {
    return { error: "Ajoute un titre pour cette envie." };
  }

  const recipient = await getDefaultRecipient();
  if (!recipient) {
    return { error: "Aucun profil destinataire n'a ete trouve." };
  }

  const priceValue = String(formData.get("priceFcfa") ?? "").trim();
  const occasionId = String(formData.get("occasionId") ?? "").trim();
  const photo = formData.get("photo");
  const file = photo instanceof File ? photo : null;

  let uploaded;
  try {
    uploaded = await uploadWishPhoto(file, String(formData.get("imageUrl") ?? "").trim() || null);
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
      priceFcfa: priceValue ? Number(priceValue) : null,
      recipientId: recipient.id,
      occasionId: occasionId || null
    }
  });

  revalidateAll();
  return { ok: true };
}

export async function reserveWish(formData: FormData) {
  if (!hasDatabase()) {
    return { error: "La base Neon n'est pas encore connectee." };
  }

  const wishId = String(formData.get("wishId") ?? "");
  if (!wishId) {
    return { error: "Envie introuvable." };
  }

  const gifter = await prisma.user.findFirst({
    where: { role: "GIFTER" },
    select: { id: true }
  });

  await prisma.wish.update({
    where: { id: wishId },
    data: {
      status: "RESERVED",
      reservedById: gifter?.id ?? null
    }
  });

  revalidateAll();
  return { ok: true };
}

export async function markGifted(formData: FormData) {
  if (!hasDatabase()) {
    return { error: "La base Neon n'est pas encore connectee." };
  }

  const wishId = String(formData.get("wishId") ?? "");
  if (!wishId) {
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
        reaction: reaction || "A adore"
      },
      create: {
        wishId,
        giftedAt,
        note: note || null,
        reaction: reaction || "A adore"
      }
    })
  ]);

  revalidateAll();
  return { ok: true };
}

export async function deleteWish(formData: FormData) {
  if (!hasDatabase()) {
    return { error: "La base Neon n'est pas encore connectee." };
  }

  const wishId = String(formData.get("wishId") ?? "");
  if (!wishId) {
    return { error: "Envie introuvable." };
  }

  const wish = await prisma.wish.findUnique({
    where: { id: wishId },
    select: { imageBlobPath: true, imageUrl: true }
  });

  await prisma.wish.delete({ where: { id: wishId } });

  if (wish?.imageBlobPath && process.env.BLOB_READ_WRITE_TOKEN) {
    await del(wish.imageUrl ?? wish.imageBlobPath, {
      token: process.env.BLOB_READ_WRITE_TOKEN
    }).catch(() => undefined);
  }

  revalidateAll();
  return { ok: true };
}
