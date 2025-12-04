-- CreateTable
CREATE TABLE "CreatorFollower" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreatorFollower_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatorFollower_creatorId_idx" ON "CreatorFollower"("creatorId");

-- CreateIndex
CREATE INDEX "CreatorFollower_userId_idx" ON "CreatorFollower"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorFollower_userId_creatorId_key" ON "CreatorFollower"("userId", "creatorId");

-- AddForeignKey
ALTER TABLE "CreatorFollower" ADD CONSTRAINT "CreatorFollower_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorFollower" ADD CONSTRAINT "CreatorFollower_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;
