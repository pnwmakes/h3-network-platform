import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
    applyRateLimit,
    validateApiRequest,
    createErrorResponse,
} from '@/lib/security';
import { logger } from '@/lib/logger';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // Apply security checks manually since withApiSecurity doesn't support route params
    const rateLimitResponse = await applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const validation = validateApiRequest(request);
    if (!validation.isValid) {
        return createErrorResponse(validation.error || 'Invalid request', 400);
    }

    let videoId = 'unknown';
    try {
        const { id } = await params;
        videoId = id;

        logger.info('Video access', { videoId });

        const video = await prisma.video.findUnique({
            where: {
                id: videoId,
                status: 'PUBLISHED',
                publishedAt: {
                    lte: new Date(),
                },
            },
            include: {
                creator: {
                    select: {
                        displayName: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
                show: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
            },
        });

        if (!video) {
            logger.warn('Video not found', { videoId });
            return createErrorResponse('Video not found', 404);
        }

        // Increment view count
        await prisma.video.update({
            where: { id: videoId },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json({
            ...video,
            viewCount: video.viewCount + 1,
        });
    } catch (error) {
        logger.error('Error fetching video', {
            error: error instanceof Error ? error.message : String(error),
            videoId,
            endpoint: '/api/videos/[id]',
        });
        return createErrorResponse('Failed to fetch video', 500);
    }
}
