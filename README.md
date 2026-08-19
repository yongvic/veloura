# Veloura

Veloura est une wishlist cadeaux en `Next.js`, pensée mobile-first. Deux comptes se lient par invitation : l'un note les envies, l'autre réserve et offre — sans jamais gâcher la surprise (les réservations sont invisibles pour celle qui reçoit).

## Stack

- `Next.js` App Router
- `Prisma`
- `Neon Postgres`
- `Vercel Blob` pour les photos
- `Vitest` pour les tests
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
APP_ORIGIN="https://ton-domaine.tld"   # optionnel
```

- `DATABASE_URL`: connexion Postgres (pooled si disponible)
- `DIRECT_URL`: connexion directe pour les migrations Prisma
- `BLOB_READ_WRITE_TOKEN`: token Vercel Blob pour stocker les photos
- `AUTH_SECRET`: signature des sessions (obligatoire en production — le serveur refuse de démarrer sans)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD`: compte admin créé/réparé au boot (instrumentation), via `npm run bootstrap:admin`, ou quand l'admin se connecte. Changer `ADMIN_PASSWORD` applique la rotation au prochain bootstrap.
- `APP_ORIGIN`: origine publique pour les liens d'invitation (sinon en-tête Host)

## Démarrage local

```bash
npm install
npx prisma migrate deploy
npm run dev
```

Ouvre `/inscription` pour créer le premier compte, puis partage le lien d'invitation. L'admin se connecte sur `/connexion` avec `ADMIN_EMAIL`.

## Qualité

```bash
npm run lint   # ESLint strict (--max-warnings=0)
npm test       # Vitest : machine à états, validation, rate-limit, auth
npx tsc --noEmit
```

## Photos

Chaque envie peut recevoir une photo. Le fichier est compressé côté client (1600px max, JPEG) puis part sur `Vercel Blob` en production. En local dev sans token Blob, la photo est enregistrée dans `public/uploads` (non servi par `next start`).

## Invitations

Pas d'envoi d'e-mail : `createInvitation` génère un lien à transmettre soi-même à la personne (message, WhatsApp…). Le texte de la page `/inviter` reflète ce fonctionnement.

## Migrations

Voir `prisma/migrations/README.md` : la migration `20260818140000_auth_pairs_admin` contient des `DELETE FROM` (nettoyage de démo historique). Ne jamais rejouer les migrations sur une base restaurée sans `prisma migrate resolve`.

## Deploy Vercel

Ajoute les variables ci-dessus dans le projet Vercel. Le build lance `prisma migrate deploy` puis `next build`. En production, la configuration est validée au démarrage (`DATABASE_URL`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`) : une variable manquante empêche le boot plutôt que de dégrader silencieusement.
