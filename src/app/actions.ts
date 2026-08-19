"use server";

import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { uploadWishPhoto } from "@/lib/blob";
import { hasDatabase } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { requireCouple } from "@/lib/guard";
import {
  canDeleteWish,
  canEditWish,
  canMarkGifted,
  TRANSITION_ERRORS
} from "@/lib/wish-transitions";
import {
  clampText,
  parseCategory,
  parsePriceFcfa,
  parseProductUrl,
  parseTagList,
  parseWishPriority,
  slugify
} from "@/lib/validation";

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/wishes");
  revalidatePath("/wishes/[id]", "page");
  revalidatePath("/history");
  revalidatePath("/occasions");
  revalidatePath("/preferences");
}

async function findCoupleWish(wishId: string, recipientId: string) {
  return prisma.wish.findFirst({
    where: { id: wishId, recipientId },
    select: {
      id: true,
      status: true,
      reservedById: true,
      imageUrl: true,
      imageBlobPath: true
    }
  });
}

async function deleteBlobBestEffort(imageUrl: string | null, imageBlobPath: string | null) {
  if (!imageBlobPath || !process.env.BLOB_READ_WRITE_TOKEN) return;
  await del(imageUrl ?? imageBlobPath, {
    token: process.env.BLOB_READ_WRITE_TOKEN
  }).catch((error) => console.error("blob delete", error));
}

async function assertOwnedOccasion(occasionId: string, recipientId: string) {
  const occasion = await prisma.occasion.findFirst({
    where: { id: occasionId, ownerId: recipientId },
    select: { id: true }
  });
  return occasion !== null;
}

type WishFormResult = { error?: string; ok?: boolean };

function readWishForm(formData: FormData):
  | { error: string }
  | {
      title: string;
      description: string | null;
      productUrl: string | null;
      priceFcfa: number | null;
      category: string;
      priority: ReturnType<typeof parseWishPriority>;
      occasionId: string | null;
      file: File | null;
    } {
  const title = clampText(formData.get("title"), 120);
  if (!title) {
    return { error: "Ajoute un titre pour cette envie." };
  }

  const productUrl = parseProductUrl(formData.get("productUrl"));
  if ("error" in productUrl) return { error: productUrl.error };

  const priceFcfa = parsePriceFcfa(formData.get("priceFcfa"));
  if ("error" in priceFcfa) return { error: priceFcfa.error };

  const photo = formData.get("photo");

  return {
    title,
    description: clampText(formData.get("description"), 2000) || null,
    productUrl: productUrl.url,
    priceFcfa: priceFcfa.price,
    category: parseCategory(formData.get("category")),
    priority: parseWishPriority(formData.get("priority")),
    occasionId: clampText(formData.get("occasionId"), 64) || null,
    file: photo instanceof File ? photo : null
  };
}

export async function createWish(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "RECIPIENT") {
    return { error: "Seule la personne qui note ses envies peut en ajouter." };
  }

  const parsed = readWishForm(formData);
  if ("error" in parsed) return parsed;

  if (parsed.occasionId && !(await assertOwnedOccasion(parsed.occasionId, recipientId))) {
    return { error: "Cette occasion n'appartient pas à votre espace." };
  }

  let uploaded;
  try {
    uploaded = await uploadWishPhoto(parsed.file);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impossible d'enregistrer la photo." };
  }

  try {
    await prisma.wish.create({
      data: {
        title: parsed.title,
        description: parsed.description,
        imageUrl: uploaded?.url ?? null,
        imageBlobPath: uploaded?.blobPath ?? null,
        productUrl: parsed.productUrl,
        priceFcfa: parsed.priceFcfa,
        category: parsed.category,
        priority: parsed.priority,
        recipientId,
        occasionId: parsed.occasionId
      }
    });
  } catch (error) {
    console.error("createWish", error);
    await deleteBlobBestEffort(uploaded?.url ?? null, uploaded?.blobPath ?? null);
    return { error: "Impossible d'enregistrer cette envie. Réessaie." };
  }

  revalidateAll();
  return { ok: true };
}

export async function updateWish(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "RECIPIENT") {
    return { error: "Seule la personne qui note ses envies peut les modifier." };
  }

  const wishId = clampText(formData.get("wishId"), 64);
  const wish = wishId ? await findCoupleWish(wishId, recipientId) : null;
  if (!wish) {
    return { error: "Envie introuvable." };
  }
  if (!canEditWish(wish.status)) {
    return { error: TRANSITION_ERRORS.edit };
  }

  const parsed = readWishForm(formData);
  if ("error" in parsed) return parsed;

  if (parsed.occasionId && !(await assertOwnedOccasion(parsed.occasionId, recipientId))) {
    return { error: "Cette occasion n'appartient pas à votre espace." };
  }

  let uploaded;
  try {
    uploaded = await uploadWishPhoto(parsed.file);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Impossible d'enregistrer la photo." };
  }

  try {
    await prisma.wish.update({
      where: { id: wish.id },
      data: {
        title: parsed.title,
        description: parsed.description,
        productUrl: parsed.productUrl,
        priceFcfa: parsed.priceFcfa,
        category: parsed.category,
        priority: parsed.priority,
        occasionId: parsed.occasionId,
        ...(uploaded
          ? { imageUrl: uploaded.url, imageBlobPath: uploaded.blobPath }
          : {})
      }
    });
  } catch (error) {
    console.error("updateWish", error);
    await deleteBlobBestEffort(uploaded?.url ?? null, uploaded?.blobPath ?? null);
    return { error: "Impossible de modifier cette envie. Réessaie." };
  }

  if (uploaded) {
    await deleteBlobBestEffort(wish.imageUrl, wish.imageBlobPath);
  }

  revalidateAll();
  return { ok: true };
}

export async function reserveWish(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "GIFTER") {
    return { error: "Seul celui qui offre peut réserver un cadeau." };
  }

  const wishId = clampText(formData.get("wishId"), 64);
  const wish = wishId ? await findCoupleWish(wishId, recipientId) : null;
  if (!wish) {
    return { error: "Envie introuvable." };
  }

  // Transition atomique et conditionnelle : deux onglets, deux clics ou une
  // page périmée ne peuvent pas faire sortir une envie de l'état GIFTED ni
  // écraser une réservation existante.
  const updated = await prisma.wish.updateMany({
    where: { id: wish.id, recipientId, status: "ACTIVE" },
    data: { status: "RESERVED", reservedById: session.userId }
  });
  if (updated.count === 0) {
    return { error: TRANSITION_ERRORS.reserve };
  }

  revalidateAll();
  return { ok: true };
}

export async function unreserveWish(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "GIFTER") {
    return { error: "Seul celui qui offre peut annuler une réservation." };
  }

  const wishId = clampText(formData.get("wishId"), 64);
  const wish = wishId ? await findCoupleWish(wishId, recipientId) : null;
  if (!wish) {
    return { error: "Envie introuvable." };
  }

  const updated = await prisma.wish.updateMany({
    where: {
      id: wish.id,
      recipientId,
      status: "RESERVED",
      reservedById: session.userId
    },
    data: { status: "ACTIVE", reservedById: null }
  });
  if (updated.count === 0) {
    return { error: TRANSITION_ERRORS.unreserve };
  }

  revalidateAll();
  return { ok: true };
}

class TransitionRefused extends Error {}

export async function markGifted(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "GIFTER") {
    return { error: "Seul celui qui offre peut marquer un cadeau comme offert." };
  }

  const wishId = clampText(formData.get("wishId"), 64);
  const wish = wishId ? await findCoupleWish(wishId, recipientId) : null;
  if (!wish) {
    return { error: "Envie introuvable." };
  }
  if (!canMarkGifted(wish.status)) {
    return { error: TRANSITION_ERRORS.gift };
  }

  const note = clampText(formData.get("note"), 1000);
  const reaction = clampText(formData.get("reaction"), 80);
  const giftedAt = new Date();

  try {
    await prisma.$transaction(async (tx) => {
      // Garde atomique à l'intérieur de la transaction : si deux clics
      // concurrents arrivent, un seul passe le statut à GIFTED.
      const transitioned = await tx.wish.updateMany({
        where: { id: wish.id, recipientId, status: { in: ["ACTIVE", "RESERVED"] } },
        data: { status: "GIFTED", giftedAt }
      });
      if (transitioned.count === 0) {
        throw new TransitionRefused();
      }
      await tx.giftHistory.create({
        data: {
          wishId: wish.id,
          giftedAt,
          note: note || null,
          reaction: reaction || "A adoré"
        }
      });
    });
  } catch (error) {
    if (error instanceof TransitionRefused) {
      return { error: TRANSITION_ERRORS.gift };
    }
    console.error("markGifted", error);
    return { error: "Impossible d'enregistrer ce souvenir. Réessaie." };
  }

  revalidateAll();
  return { ok: true };
}

export async function deleteWish(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "RECIPIENT") {
    return { error: "Seule la personne qui note les envies peut en retirer une." };
  }

  const wishId = clampText(formData.get("wishId"), 64);
  const wish = wishId ? await findCoupleWish(wishId, recipientId) : null;
  if (!wish) {
    return { error: "Envie introuvable." };
  }
  if (!canDeleteWish(wish.status)) {
    return { error: TRANSITION_ERRORS.delete };
  }

  await prisma.wish.delete({ where: { id: wish.id } });
  await deleteBlobBestEffort(wish.imageUrl, wish.imageBlobPath);

  revalidateAll();
  return { ok: true };
}

export async function savePreferences(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "RECIPIENT") {
    return { error: "Seule la personne dont c'est la liste peut renseigner ses goûts." };
  }

  const data = {
    favoriteColors: parseTagList(formData.get("favoriteColors")),
    favoriteBrands: parseTagList(formData.get("favoriteBrands")),
    favoriteStyles: parseTagList(formData.get("favoriteStyles")),
    sizes: parseTagList(formData.get("sizes")),
    avoidNotes: parseTagList(formData.get("avoidNotes"))
  };

  await prisma.preferenceProfile.upsert({
    where: { userId: recipientId },
    update: data,
    create: { userId: recipientId, ...data }
  });

  revalidateAll();
  return { ok: true };
}

export async function createOccasion(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "RECIPIENT") {
    return { error: "Seule la personne dont c'est la liste gère les occasions." };
  }

  const name = clampText(formData.get("name"), 60);
  if (!name || name.length < 2) {
    return { error: "Donne un nom à cette occasion." };
  }

  const slug = slugify(name);
  if (!slug) {
    return { error: "Ce nom d'occasion n'est pas utilisable." };
  }

  const eventDateRaw = clampText(formData.get("eventDate"), 10);
  const eventDate = eventDateRaw ? new Date(`${eventDateRaw}T12:00:00`) : null;
  if (eventDateRaw && Number.isNaN(eventDate?.getTime())) {
    return { error: "Cette date n'est pas valide." };
  }

  try {
    await prisma.occasion.create({
      data: {
        name,
        slug,
        eventDate,
        description: clampText(formData.get("description"), 280) || null,
        ownerId: recipientId
      }
    });
  } catch (error) {
    console.error("createOccasion", error);
    return { error: "Une occasion porte déjà ce nom." };
  }

  revalidateAll();
  return { ok: true };
}

export async function setOccasionDate(formData: FormData): Promise<WishFormResult> {
  if (!hasDatabase()) {
    return { error: "La base n'est pas encore connectée." };
  }

  const { session, recipientId } = await requireCouple();
  if (session.role !== "RECIPIENT") {
    return { error: "Seule la personne dont c'est la liste gère les occasions." };
  }

  const occasionId = clampText(formData.get("occasionId"), 64);
  const eventDateRaw = clampText(formData.get("eventDate"), 10);

  let eventDate: Date | null = null;
  if (eventDateRaw) {
    eventDate = new Date(`${eventDateRaw}T12:00:00`);
    if (Number.isNaN(eventDate.getTime())) {
      return { error: "Cette date n'est pas valide." };
    }
  }

  // Le where porte le ownerId : impossible de dater l'occasion d'un autre.
  const updated = await prisma.occasion.updateMany({
    where: { id: occasionId, ownerId: recipientId },
    data: { eventDate }
  });
  if (updated.count === 0) {
    return { error: "Occasion introuvable." };
  }

  revalidateAll();
  return { ok: true };
}
