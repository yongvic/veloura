# Veloura

Veloura est une wishlist cadeaux en `Next.js`, pensée mobile-first. Deux comptes se lient par invitation : l'un note les envies, l'autre réserve et offre.

## Stack

- `Next.js` App Router
- `Prisma`
- `Neon Postgres`
- `Vercel Blob` pour les photos
- deployable gratuitement sur `Vercel`

## Variables d'environnement

Copie `.env.example` vers `.env.local`:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST.neon.tech/neondb?sslmode=require"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
AUTH_SECRET="une-clé-secrète-d-au-moins-16-caractères"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-me-please"
```

- `DATABASE_URL`: connexion Neon (pooled si disponible)
- `DIRECT_URL`: connexion Neon directe pour les migrations Prisma
- `BLOB_READ_WRITE_TOKEN`: token Vercel Blob pour stocker les photos
- `AUTH_SECRET`: signature des sessions
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: crée le compte admin au premier login ou à la première inscription

## Démarrage local

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Ouvre `/inscription` pour créer le premier compte, puis envoie une invitation. L'admin se connecte sur `/connexion` avec `ADMIN_EMAIL`.

## Photos

Chaque envie peut recevoir une photo via un upload fichier. En production, le fichier part sur `Vercel Blob`. En local, sans token Blob, la photo est enregistrée dans `public/uploads`.

## Deploy Vercel

Ajoute les variables ci-dessus dans le projet Vercel. Le build lance `prisma migrate deploy` puis `next build`.
