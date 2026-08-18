-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'CANCELLED');

-- Remove seeded demo records so auth can start from a clean couple space
DELETE FROM "GiftHistory";
DELETE FROM "Wish";
DELETE FROM "PreferenceProfile";
DELETE FROM "Occasion";
DELETE FROM "User";

-- AlterTable User
ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT NOT NULL;
ALTER TABLE "User" ADD COLUMN "partnerId" TEXT;

CREATE UNIQUE INDEX "User_partnerId_key" ON "User"("partnerId");

ALTER TABLE "User" ADD CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable Occasion: occasions belong to the recipient of a couple
ALTER TABLE "Occasion" DROP CONSTRAINT IF EXISTS "Occasion_slug_key";
DROP INDEX IF EXISTS "Occasion_slug_key";

ALTER TABLE "Occasion" ADD COLUMN "ownerId" TEXT NOT NULL;

CREATE UNIQUE INDEX "Occasion_ownerId_slug_key" ON "Occasion"("ownerId", "slug");

ALTER TABLE "Occasion" ADD CONSTRAINT "Occasion_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable Invitation
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");
CREATE INDEX "Invitation_email_status_idx" ON "Invitation"("email", "status");

ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
