export async function uploadWishPhoto(file: File | null): Promise<{
  url: string;
  blobPath: string | null;
} | null> {
  if (!file || file.size === 0) {
    return null;
  }

  const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  const MAX_BYTES = 4.5 * 1024 * 1024;

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Utilise une photo JPG, PNG, WEBP ou GIF.");
  }

  if (file.size > MAX_BYTES) {
    throw new Error("La photo doit rester sous 4,5 Mo.");
  }

  const fileName = `${Date.now()}-${(file.name || "photo.jpg")
    .replace(/[^a-zA-Z0-9.\-_]/g, "-")
    .toLowerCase()
    .slice(-80)}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
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
    throw new Error("Le stockage photo n'est pas encore branché. Ajoute BLOB_READ_WRITE_TOKEN.");
  }

  // Le fallback disque n'a de sens qu'en dev : en `next start`, public/ est
  // figé au build et un fichier écrit après coup ne serait jamais servi.
  if (process.env.NODE_ENV !== "development") {
    throw new Error("Le stockage photo n'est pas disponible sur cet environnement.");
  }

  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await import("node:path");
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });
  await writeFile(path.join(uploadsDir, fileName), Buffer.from(await file.arrayBuffer()));

  return {
    url: `/uploads/${fileName}`,
    blobPath: null
  };
}
