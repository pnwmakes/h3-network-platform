import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';

async function handler(request: NextRequest) {
    try {
        // Extract contentId from URL path
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const contentId = pathParts[pathParts.length - 2]; // content/[id]/like
        const { searchParams } = new URL(request.url);
        const contentType = searchParams.get('type'); // 'video' or 'blog'

        if (!contentType || !['video', 'blog'].includes(contentType)) {
            return createErrorResponse('Invalid content type. Must be "video" or "blog"', 400);
        }

        const session = await getServerSession(authOptions);
        const method = request.method;

        // Generate session ID for guest users
        let sessionId = null;
        let ipAddress = null;
        
        if (!session?.user?.id) {
            // For guest users, use IP + User-Agent as session identifier
            const forwarded = request.headers.get('x-forwarded-for');
            ipAddress = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';
            const userAgent = request.headers.get('user-agent') || 'unknown';
            sessionId = Buffer.from(`${ipAddress}-${userAgent}`).toString('base64').slice(0, 32);
        }

        logger.info(`Like API called`, {
            contentId,
            contentType,
            method,
            userId: session?.user?.id,
            sessionId: !session?.user?.id ? (sessionId || 'unknown') : undefined,
            ipAddress: !session?.user?.id ? (ipAddress || 'unknown') : undefined,
        });

        if (method === 'POST') {
            // Add like
            try {
                // Check if content exists
                const content = contentType === 'video' 
                    ? await prisma.video.findUnique({ where: { id: contentId } })
                    : await prisma.blog.findUnique({ where: { id: contentId } });

                if (!content) {
                    return createErrorResponse('Content not found', 404);
                }

                // Check for existing like
                const existingLike = await prisma.like.findFirst({
                    where: {
                        ...(session?.user?.id ? { userId: session.user.id } : { sessionId }),
                        ...(contentType === 'video' ? { videoId: contentId } : { blogId: contentId }),
                    },
                });

                if (existingLike) {
                    return createErrorResponse('Content already liked', 409);
                }

                // For guest users, implement rate limiting by IP
                if (!session?.user?.id && ipAddress) {
                    const recentLikes = await prisma.like.count({
                        where: {
                            ipAddress,
                            createdAt: {
                                gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
                            },
                        },
                    });

                    if (recentLikes >= 20) { // 20 likes per hour for guests
                        return createErrorResponse('Rate limit exceeded. Please try again later.', 429);
                    }
                }

                // Create like and update count in transaction
                const result = await prisma.$transaction(async (tx) => {
                    // Create the like
                    const newLike = await tx.like.create({
                        data: {
                            userId: session?.user?.id || null,
                            sessionId: !session?.user?.id ? sessionId : null,
                            ipAddress: !session?.user?.id ? ipAddress : null,
                            ...(contentType === 'video' ? { videoId: contentId } : { blogId: contentId }),
                        },
                    });

                    // Update like count
                    const updatedContent = contentType === 'video'
                        ? await tx.video.update({
                            where: { id: contentId },
                            data: { likeCount: { increment: 1 } },
                            select: { likeCount: true },
                        })
                        : await tx.blog.update({
                            where: { id: contentId },
                            data: { likeCount: { increment: 1 } },
                            select: { likeCount: true },
                        });

                    return { like: newLike, likeCount: updatedContent.likeCount };
                });

                logger.info('Content liked successfully', {
                    contentId,
                    contentType,
                    userId: session?.user?.id,
                    sessionId: !session?.user?.id ? (sessionId || 'unknown') : undefined,
                    newLikeCount: result.likeCount,
                });

                return NextResponse.json({
                    success: true,
                    liked: true,
                    likeCount: result.likeCount,
                });

            } catch (error) {
                logger.error('Error creating like', {
                    error: error instanceof Error ? error.message : String(error),
                    contentId,
                    contentType,
                    userId: session?.user?.id,
                });
                return createErrorResponse('Failed to like content', 500);
            }

        } else if (method === 'DELETE') {
            // Remove like
            try {
                const existingLike = await prisma.like.findFirst({
                    where: {
                        ...(session?.user?.id ? { userId: session.user.id } : { sessionId }),
                        ...(contentType === 'video' ? { videoId: contentId } : { blogId: contentId }),
                    },
                });

                if (!existingLike) {
                    return createErrorResponse('Like not found', 404);
                }

                // Remove like and update count in transaction
                const result = await prisma.$transaction(async (tx) => {
                    // Delete the like
                    await tx.like.delete({
                        where: { id: existingLike.id },
                    });

                    // Update like count
                    const updatedContent = contentType === 'video'
                        ? await tx.video.update({
                            where: { id: contentId },
                            data: { likeCount: { decrement: 1 } },
                            select: { likeCount: true },
                        })
                        : await tx.blog.update({
                            where: { id: contentId },
                            data: { likeCount: { decrement: 1 } },
                            select: { likeCount: true },
                        });

                    return { likeCount: Math.max(0, updatedContent.likeCount) }; // Ensure non-negative
                });

                logger.info('Like removed successfully', {
                    contentId,
                    contentType,
                    userId: session?.user?.id,
                    sessionId: !session?.user?.id ? (sessionId || 'unknown') : undefined,
                    newLikeCount: result.likeCount,
                });

                return NextResponse.json({
                    success: true,
                    liked: false,
                    likeCount: result.likeCount,
                });

            } catch (error) {
                logger.error('Error removing like', {
                    error: error instanceof Error ? error.message : String(error),
                    contentId,
                    contentType,
                    userId: session?.user?.id,
                });
                return createErrorResponse('Failed to unlike content', 500);
            }

        } else if (method === 'GET') {
            // Get like status and count
            try {
                const content = contentType === 'video' 
                    ? await prisma.video.findUnique({ 
                        where: { id: contentId },
                        select: { likeCount: true }
                    })
                    : await prisma.blog.findUnique({ 
                        where: { id: contentId },
                        select: { likeCount: true }
                    });

                if (!content) {
                    return createErrorResponse('Content not found', 404);
                }

                // Check if current user/session has liked this content
                const userLike = await prisma.like.findFirst({
                    where: {
                        ...(session?.user?.id ? { userId: session.user.id } : { sessionId }),
                        ...(contentType === 'video' ? { videoId: contentId } : { blogId: contentId }),
                    },
                });

                return NextResponse.json({
                    success: true,
                    liked: !!userLike,
                    likeCount: content.likeCount,
                });

            } catch (error) {
                logger.error('Error fetching like status', {
                    error: error instanceof Error ? error.message : String(error),
                    contentId,
                    contentType,
                });
                return createErrorResponse('Failed to fetch like status', 500);
            }
        }

        return createErrorResponse('Method not allowed', 405);

    } catch (error) {
        logger.error('Like API error', {
            error: error instanceof Error ? error.message : String(error),
        });
        return createErrorResponse('Internal server error', 500);
    }
}

export const GET = withApiSecurity(handler);
export const POST = withApiSecurity(handler);
export const DELETE = withApiSecurity(handler);