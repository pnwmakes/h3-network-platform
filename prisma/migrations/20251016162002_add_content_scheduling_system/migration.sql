-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('PENDING', 'PUBLISHED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "ScheduledContent" (
    "id" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "videoId" TEXT,
    "blogId" TEXT,
    "publishAt" TIMESTAMP(3) NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "creatorId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ScheduledContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledContent_videoId_key" ON "ScheduledContent"("videoId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledContent_blogId_key" ON "ScheduledContent"("blogId");

-- AddForeignKey
ALTER TABLE "ScheduledContent" ADD CONSTRAINT "ScheduledContent_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Creator"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledContent" ADD CONSTRAINT "ScheduledContent_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledContent" ADD CONSTRAINT "ScheduledContent_blogId_fkey" FOREIGN KEY ("blogId") REFERENCES "Blog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
