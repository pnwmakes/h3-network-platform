import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { ContentTopic, ContentStatus } from '@prisma/client';

interface BulkVideoData {
    title: string;
    description: string;
    youtubeId: string;
    showId: string;
    tags: string[];
    topic: ContentTopic;
    scheduledFor?: string;
    creatorId: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session ||
            !['CREATOR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
        ) {
            logger.securityEvent(
                'Unauthorized bulk video upload attempt',
                'medium',
                {
                    userId: session?.user?.id,
                    userRole: session?.user?.role,
                    endpoint: '/api/creator/videos/bulk-upload',
                }
            );
            return createErrorResponse('Unauthorized', 401);
        }

        const body = await request.json();
        const { videos }: { videos: BulkVideoData[] } = body;

        if (!videos || !Array.isArray(videos) || videos.length === 0) {
            return createErrorResponse('Videos array is required', 400);
        }

        if (videos.length > 20) {
            return createErrorResponse(
                'Maximum 20 videos allowed per bulk upload',
                400
            );
        }

        // Verify the user owns the creator profile
        const creator = await prisma.creator.findFirst({
            where: {
                user: {
                    id: session.user.id,
                },
            },
        });

        if (!creator) {
            return createErrorResponse('Creator profile not found', 404);
        }

        // Validate each video
        for (let i = 0; i < videos.length; i++) {
            const video = videos[i];

            if (!video.title?.trim()) {
                return createErrorResponse(
                    `Video ${i + 1}: Title is required`,
                    400
                );
            }

            if (!video.youtubeId?.trim()) {
                return createErrorResponse(
                    `Video ${i + 1}: YouTube ID is required`,
                    400
                );
            }

            if (!video.showId) {
                return createErrorResponse(
                    `Video ${i + 1}: Show ID is required`,
                    400
                );
            }

            // Verify show exists and is active
            const show = await prisma.show.findUnique({
                where: { id: video.showId, isActive: true },
            });

            if (!show) {
                return createErrorResponse(
                    `Video ${i + 1}: Invalid show ID`,
                    400
                );
            }
        }

        const startTime = Date.now();
        const createdVideos = [];

        // Process each video
        for (const videoData of videos) {
            try {
                // Get video metadata from YouTube (in a real app, you'd call YouTube API here)
                const thumbnailUrl = `https://img.youtube.com/vi/${videoData.youtubeId}/maxresdefault.jpg`;
                const youtubeUrl = `https://www.youtube.com/watch?v=${videoData.youtubeId}`;

                const video = await prisma.video.create({
                    data: {
                        title: videoData.title.trim(),
                        description: videoData.description?.trim() || '',
                        youtubeId: videoData.youtubeId.trim(),
                        youtubeUrl,
                        thumbnailUrl,
                        duration: 0, // Would be set from YouTube API
                        topic: videoData.topic,
                        status: videoData.scheduledFor
                            ? ContentStatus.SCHEDULED
                            : ContentStatus.DRAFT,
                        scheduledAt: videoData.scheduledFor
                            ? new Date(videoData.scheduledFor)
                            : null,
                        tags: videoData.tags || [],
                        creatorId: creator.id,
                        showId: videoData.showId,
                        publishedAt: null, // Will be set when published
                        viewCount: 0,
                    },
                    include: {
                        creator: {
                            select: {
                                displayName: true,
                            },
                        },
                        show: {
                            select: {
                                name: true,
                            },
                        },
                    },
                });

                createdVideos.push(video);

                logger.info('Video created via bulk upload', {
                    videoId: video.id,
                    title: video.title,
                    creatorId: creator.id,
                    userId: session.user.id,
                });
            } catch (error) {
                logger.error('Error creating individual video in bulk upload', {
                    error:
                        error instanceof Error ? error.message : String(error),
                    videoTitle: videoData.title,
                    youtubeId: videoData.youtubeId,
                    userId: session.user.id,
                });

                // Continue with other videos, but log the error
                continue;
            }
        }

        const executionTime = Date.now() - startTime;

        logger.info('Bulk video upload completed', {
            userId: session.user.id,
            creatorId: creator.id,
            totalVideos: videos.length,
            successfulUploads: createdVideos.length,
            failedUploads: videos.length - createdVideos.length,
            executionTime,
        });

        return createSuccessResponse(
            {
                videos: createdVideos,
                summary: {
                    total: videos.length,
                    successful: createdVideos.length,
                    failed: videos.length - createdVideos.length,
                },
            },
            `Successfully uploaded ${createdVideos.length} of ${videos.length} videos`,
            { executionTime }
        );
    } catch (error) {
        logger.error('Bulk video upload error', {
            error: error instanceof Error ? error.message : String(error),
            userId: (await getServerSession(authOptions))?.user?.id,
        });

        return createErrorResponse('Failed to upload videos', 500);
    }
}
