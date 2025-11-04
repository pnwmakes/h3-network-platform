import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';
import { ContentTopic } from '@prisma/client';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = withApiSecurity(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'video', 'blog', or undefined for all
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '12');
        const page = parseInt(searchParams.get('page') || '1');
        const search = searchParams.get('search');
        const cacheBuster = searchParams.get('_'); // Cache busting parameter

        logger.info('Content API called', {
            cacheBuster: cacheBuster || undefined,
            type: type || undefined,
            category: category || undefined,
            limit,
            page,
            search: search || undefined,
            timestamp: new Date().toISOString(),
        });
        const skip = (page - 1) * limit;

        // Build where conditions
        const whereConditions = {
            status: 'PUBLISHED' as const,
            publishedAt: {
                lte: new Date(), // Only show content that's been published
            },
            ...(category &&
                category !== 'all' && {
                    topic: category.toUpperCase() as ContentTopic,
                }),
            ...(search && {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                    {
                        description: {
                            contains: search,
                            mode: 'insensitive' as const,
                        },
                    },
                    { tags: { hasSome: [search] } },
                ],
            }),
        };

        logger.debug('Content API query conditions', {
            type: type || undefined,
            category: category || undefined,
            search: search || undefined,
            limit,
            page,
        });

        const [videos, blogs] = await Promise.all([
            // Get videos if type is 'video' or undefined
            !type || type === 'video'
                ? prisma.video.findMany({
                      where: whereConditions,
                      include: {
                          creator: {
                              select: {
                                  displayName: true,
                                  avatarUrl: true,
                              },
                          },
                      },
                      orderBy: { publishedAt: 'desc' },
                      take: type === 'video' ? limit : Math.ceil(limit / 2),
                      skip: type === 'video' ? skip : 0,
                  })
                : [],

            // Get blogs if type is 'blog' or undefined
            !type || type === 'blog'
                ? prisma.blog.findMany({
                      where: whereConditions,
                      include: {
                          creator: {
                              select: {
                                  displayName: true,
                                  avatarUrl: true,
                              },
                          },
                      },
                      orderBy: { publishedAt: 'desc' },
                      take: type === 'blog' ? limit : Math.ceil(limit / 2),
                      skip: type === 'blog' ? skip : 0,
                  })
                : [],
        ]);

        logger.debug('Query results', {
            videosFound: videos.length,
            blogsFound: blogs.length,
            totalContent: videos.length + blogs.length,
        });

        // Combine and sort if getting both types
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let content: any[] = [];
        if (!type) {
            // Combine videos and blogs, then sort by publishedAt
            const combinedContent = [
                ...videos.map((v) => ({ ...v, type: 'video' })),
                ...blogs.map((b) => ({ ...b, type: 'blog' })),
            ];

            content = combinedContent
                .sort((a, b) => {
                    const aDate = new Date(
                        a.publishedAt || a.createdAt
                    ).getTime();
                    const bDate = new Date(
                        b.publishedAt || b.createdAt
                    ).getTime();
                    return bDate - aDate;
                })
                .slice(skip, skip + limit);
        } else if (type === 'video') {
            content = videos.map((v) => ({ ...v, type: 'video' }));
        } else if (type === 'blog') {
            content = blogs.map((b) => ({ ...b, type: 'blog' }));
        }

        // Get total counts for pagination
        const [totalVideos, totalBlogs] = await Promise.all([
            !type || type === 'video'
                ? prisma.video.count({ where: whereConditions })
                : 0,
            !type || type === 'blog'
                ? prisma.blog.count({ where: whereConditions })
                : 0,
        ]);

        const totalCount =
            type === 'video'
                ? totalVideos
                : type === 'blog'
                ? totalBlogs
                : totalVideos + totalBlogs;

        const hasMore = skip + content.length < totalCount;
        const totalPages = Math.ceil(totalCount / limit);

        const response = NextResponse.json({
            content,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasMore,
            },
            stats: {
                totalVideos,
                totalBlogs,
            },
        });

        // Disable browser caching
        response.headers.set(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
        );
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Last-Modified', new Date().toUTCString());
        response.headers.set('ETag', `"${Date.now()}"`);
        response.headers.set('Vary', '*');

        return response;
    } catch (error) {
        logger.error('Error fetching content', {
            error: error instanceof Error ? error.message : String(error),
            endpoint: '/api/content',
        });
        return createErrorResponse('Failed to fetch content', 500);
    }
});
