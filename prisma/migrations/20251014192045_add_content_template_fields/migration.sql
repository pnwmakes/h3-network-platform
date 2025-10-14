-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "contentTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "guestBios" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "guestContributors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "readTime" INTEGER,
ADD COLUMN     "sponsorMessages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sponsorNames" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "contentTopics" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "guestBios" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "guestNames" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "showName" TEXT,
ADD COLUMN     "sponsorMessages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sponsorNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
