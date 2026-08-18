# Veloura

Veloura est une plateforme wishlist cadeaux en `Next.js`, pensee mobile-first, avec une interface premium, des budgets en `FCFA`, un mode discret de reservation et un historique des cadeaux deja offerts.

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
```

- `DATABASE_URL`: connexion Neon (pooled si disponible)
- `DIRECT_URL`: connexion Neon directe pour les migrations Prisma
- `BLOB_READ_WRITE_TOKEN`: token Vercel Blob pour stocker les photos

## Demarrage local

```bash
npm install
npx prisma migrate deploy
npm run prisma:seed
npm run dev
```

Sans `DATABASE_URL` Neon, l'app reste en mode demo lecture seule.

## Photos

Chaque envie peut recevoir une photo via un upload fichier. En production, le fichier part sur `Vercel Blob`. En local, sans token Blob, la photo est enregistree dans `public/uploads`.

## Deploy Vercel

Le `vercel.json` lance `prisma migrate deploy` avant le build. Ajoute les 3 variables ci-dessus dans le projet Vercel.
