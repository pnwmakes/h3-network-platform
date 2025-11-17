import { prisma } from '@/lib/prisma';

export async function getUserLikeStatus(
  contentId: string,
  contentType: 'video' | 'blog',
  userId?: string,
  sessionId?: string
) {
  try {
    const where = {
      ...(contentType === 'video' ? { videoId: contentId } : { blogId: contentId }),
      ...(userId ? { userId } : { sessionId }),
    };

    const like = await prisma.like.findFirst({
      where,
    });

    const likeCount = await prisma.like.count({
      where: contentType === 'video' ? { videoId: contentId } : { blogId: contentId },
    });

    return {
      isLiked: !!like,
      likeCount,
    };
  } catch (error) {
    console.warn('Database not available for like status:', error);
    return {
      isLiked: false,
      likeCount: 0,
    };
  }
}