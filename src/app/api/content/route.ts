import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ContentTopic } from '@prisma/client';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
    try {
        // Force fresh database connection
        await prisma.$connect();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type'); // 'video', 'blog', or undefined for all
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '12');
        const page = parseInt(searchParams.get('page') || '1');
        const search = searchParams.get('search');
        const cacheBuster = searchParams.get('_'); // Cache busting parameter

        console.log(
            'Content API called with cache buster:',
            cacheBuster,
            'at',
            new Date().toISOString()
        );

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

        console.log('Content API query conditions:', {
            ...whereConditions,
            publishedAt: { lte: whereConditions.publishedAt.lte.toISOString() }
        });

        // Force fresh database queries
        await prisma.$disconnect();
        await prisma.$connect();

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

        console.log('Query results:', {
            videosFound: videos.length,
            blogsFound: blogs.length,
            videoIds: videos.map((v) => v.id),
            blogDetails: blogs.map((b) => ({
                id: b.id,
                title: b.title,
                status: b.status,
                publishedAt: b.publishedAt?.toISOString(),
                updatedAt: b.updatedAt?.toISOString(),
            })),
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
        console.error('Error fetching content:', error);
        return NextResponse.json(
            { error: 'Failed to fetch content' },
            { status: 500 }
        );
    }
}
