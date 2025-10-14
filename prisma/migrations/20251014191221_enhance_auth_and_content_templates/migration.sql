-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContentTopic" ADD VALUE 'CRIMINAL_JUSTICE';
ALTER TYPE "ContentTopic" ADD VALUE 'RECOVERY';
ALTER TYPE "ContentTopic" ADD VALUE 'FAMILY';
ALTER TYPE "ContentTopic" ADD VALUE 'RELATIONSHIPS';
ALTER TYPE "ContentTopic" ADD VALUE 'LAW';
ALTER TYPE "ContentTopic" ADD VALUE 'GAME';
ALTER TYPE "ContentTopic" ADD VALUE 'REHABILITATION';
ALTER TYPE "ContentTopic" ADD VALUE 'NON_PROFIT';
ALTER TYPE "ContentTopic" ADD VALUE 'READING';
ALTER TYPE "ContentTopic" ADD VALUE 'POLITICS';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "horizontalImage" TEXT,
ADD COLUMN     "hostLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "sponsorLogo" TEXT,
ADD COLUMN     "sponsorUrl" TEXT,
ADD COLUMN     "squareImages" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Creator" ADD COLUMN     "funnyFact" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "episodeNumber" INTEGER,
ADD COLUMN     "guestLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "guestName" TEXT,
ADD COLUMN     "hostLinks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "scheduledAt" TIMESTAMP(3),
ADD COLUMN     "seasonNumber" INTEGER,
ADD COLUMN     "showNotes" TEXT,
ADD COLUMN     "sponsorLogo" TEXT,
ADD COLUMN     "sponsorUrl" TEXT;

-- CreateTable
CREATE TABLE "GuestViewingLimit" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestViewingLimit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GuestViewingLimit_sessionId_key" ON "GuestViewingLimit"("sessionId");
