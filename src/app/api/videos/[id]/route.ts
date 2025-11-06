import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    applyRateLimit,
    validateApiRequest,
    createErrorResponse,
} from '@/lib/security';
import { logger } from '@/lib/logger';
import { cache, CacheUtils } from '@/lib/cache';
import {
    QueryOptimizer as QO,
    withQueryMonitoring,
} from '@/lib/query-optimizer';
import {
    createSuccessResponse,
    createNotFoundResponse,
    withCacheHeaders,
    withPerformanceHeaders,
} from '@/lib/api-response';

type VideoDetail = {
    id: string;
    title: string;
    description: string | null;
    youtubeId: string;
    thumbnailUrl: string | null;
    duration: number | null;
    publishedAt: Date | null;
    viewCount: number;
    likeCount: number;
    status: string;
    tags: string[];
    creator: {
        id: string;
        displayName: string;
        avatarUrl: string | null;
        bio: string | null;
    };
    show: {
        id: string;
        name: string;
        description: string | null;
    } | null;
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const startTime = Date.now();

    // Apply security checks manually since withApiSecurity doesn't support route params
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const validation = validateApiRequest(request);
    if (!validation.isValid) {
        return createErrorResponse(validation.error || 'Invalid request', 400);
    }

    let videoId = 'unknown';
    let cacheHit = false;

    try {
        const { id } = await params;
        videoId = id;

        logger.info('Video access', { videoId });

        // Try to get from cache first
        const cacheKey = CacheUtils.keys.video(videoId);
        let video: VideoDetail | null = await cache.get(cacheKey);

        if (video) {
            cacheHit = true;
            logger.debug('Video cache hit', { videoId });
        } else {
            // Query with optimized fields and monitor performance
            const queryFn = withQueryMonitoring('video-by-id', async () => {
                return await prisma.video.findUnique({
                    where: {
                        id: videoId,
                        ...QO.WHERE_CLAUSES.publishedVideos,
                    },
                    select: QO.SELECT_FIELDS.video.detail,
                });
            });

            video = await queryFn();

            if (video) {
                // Cache the video for 30 minutes
                await cache.set(cacheKey, video, CacheUtils.TTL.LONG);
                logger.debug('Video cached', { videoId });
            }
        }

        if (!video) {
            logger.warn('Video not found', { videoId });
            return createNotFoundResponse('Video');
        }

        // Increment view count asynchronously (don't wait for it)
        prisma.video
            .update({
                where: { id: videoId },
                data: {
                    viewCount: {
                        increment: 1,
                    },
                },
            })
            .catch((error) => {
                logger.error('Failed to increment view count', {
                    error: error.message,
                    videoId,
                });
            });

        const executionTime = Date.now() - startTime;
        const response = createSuccessResponse(
            {
                ...video,
                // Add computed fields
                url: `/videos/${video.id}`,
                embedUrl: `https://www.youtube.com/embed/${video.youtubeId}`,
                viewCount: video.viewCount + (cacheHit ? 0 : 1),
            },
            undefined,
            { executionTime }
        );

        // Add performance and cache headers
        const finalResponse = withPerformanceHeaders(
            withCacheHeaders(response, 'mediumCache'),
            executionTime,
            cacheHit
        );

        return finalResponse;
    } catch (error) {
        logger.error('Error fetching video', {
            error: error instanceof Error ? error.message : String(error),
            videoId,
            endpoint: '/api/videos/[id]',
            executionTime: Date.now() - startTime,
        });
        return createErrorResponse('Failed to fetch video', 500);
    }
}
