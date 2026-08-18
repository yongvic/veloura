import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 4.5 * 1024 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "-").toLowerCase().slice(-80);
}

export type UploadedPhoto = {
  url: string;
  blobPath: string | null;
};

export async function uploadWishPhoto(
  file: File | null,
  fallbackUrl: string | null
): Promise<UploadedPhoto | null> {
  const cleanedUrl = fallbackUrl?.trim() || null;

  if (!file || file.size === 0) {
    return cleanedUrl ? { url: cleanedUrl, blobPath: null } : null;
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Utilise une photo JPG, PNG, WEBP ou GIF.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("La photo doit rester sous 4,5 Mo.");
  }

  const fileName = `${Date.now()}-${sanitizeFileName(file.name || "photo.jpg")}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`wishes/${fileName}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: true
    });

    return {
      url: blob.url,
      blobPath: blob.pathname
    };
  }

  if (process.env.VERCEL) {
    throw new Error("Le stockage photo n'est pas encore branche. Ajoute BLOB_READ_WRITE_TOKEN.");
  }

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()));

  return {
    url: `/uploads/${fileName}`,
    blobPath: null
  };
}
