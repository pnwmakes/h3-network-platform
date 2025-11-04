import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const searchSchema = z.object({
    q: z.string().min(1).max(100),
    type: z
        .enum(['all', 'videos', 'creators', 'blogs'])
        .optional()
        .default('all'),
    topic: z
        .enum([
            'REENTRY',
            'ADDICTION',
            'INCARCERATION',
            'CRIMINAL_JUSTICE_REFORM',
            'GENERAL',
        ])
        .optional(),
    creator: z.string().optional(),
    tags: z.string().optional(), // Comma-separated tags
    sortBy: z
        .enum(['relevance', 'date', 'views', 'duration'])
        .optional()
        .default('relevance'),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(50).optional().default(20),
});

export const GET = withApiSecurity(async (request: NextRequest) => {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        const { q, type, topic, creator, tags, sortBy, page, limit } =
            searchSchema.parse(params);

        logger.info('Search API called', {
            query: q,
            type,
            topic: topic || undefined,
            creator: creator || undefined,
            tags: tags || undefined,
            sortBy,
            page,
            limit,
        });

        const skip = (page - 1) * limit;
        const searchTerms = q
            .toLowerCase()
            .split(' ')
            .filter((term) => term.length > 1);
        const tagArray = tags ? tags.split(',').map((tag) => tag.trim()) : [];

        // Build a simpler where clause
        const baseWhere = {
            status: 'PUBLISHED' as const,
            OR: [
                {
                    title: {
                        contains: q,
                        mode: 'insensitive' as const,
                    },
                },
                {
                    description: {
                        contains: q,
                        mode: 'insensitive' as const,
                    },
                },
                {
                    tags: {
                        hasSome: searchTerms,
                    },
                },
            ],
        };

        // Add optional filters
        const videoWhere = {
            ...baseWhere,
            ...(topic && { topic }),
            ...(creator && {
                creator: {
                    displayName: {
                        contains: creator,
                        mode: 'insensitive' as const,
                    },
                },
            }),
            ...(tagArray.length > 0 && {
                tags: {
                    hasSome: tagArray,
                },
            }),
        };

        // Build sort order
        let orderBy = {};
        switch (sortBy) {
            case 'date':
                orderBy = { publishedAt: 'desc' as const };
                break;
            case 'views':
                orderBy = { viewCount: 'desc' as const };
                break;
            case 'duration':
                orderBy = { duration: 'asc' as const };
                break;
            case 'relevance':
            default:
                orderBy = { viewCount: 'desc' as const };
                break;
        }

        const results = await Promise.all([
            // Videos search (if type is 'all' or 'videos')
            type === 'all' || type === 'videos'
                ? prisma.video.findMany({
                      where: videoWhere,
                      include: {
                          creator: {
                              select: {
                                  id: true,
                                  displayName: true,
                                  avatarUrl: true,
                                  bio: true,
                              },
                          },
                          show: {
                              select: {
                                  id: true,
                                  name: true,
                                  description: true,
                              },
                          },
                      },
                      orderBy,
                      skip,
                      take: limit,
                  })
                : Promise.resolve([]),

            // Creators search (if type is 'all' or 'creators')
            type === 'all' || type === 'creators'
                ? prisma.creator.findMany({
                      where: {
                          OR: [
                              {
                                  displayName: {
                                      contains: q,
                                      mode: 'insensitive' as const,
                                  },
                              },
                              {
                                  bio: {
                                      contains: q,
                                      mode: 'insensitive' as const,
                                  },
                              },
                          ],
                      },
                      include: {
                          _count: {
                              select: {
                                  videos: {
                                      where: {
                                          status: 'PUBLISHED',
                                      },
                                  },
                              },
                          },
                      },
                      skip: type === 'creators' ? skip : 0,
                      take: type === 'creators' ? limit : 5,
                  })
                : Promise.resolve([]),

            // Get total counts for pagination
            type === 'all' || type === 'videos'
                ? prisma.video.count({
                      where: videoWhere,
                  })
                : Promise.resolve(0),

            type === 'all' || type === 'creators'
                ? prisma.creator.count({
                      where: {
                          OR: [
                              {
                                  displayName: {
                                      contains: q,
                                      mode: 'insensitive' as const,
                                  },
                              },
                              {
                                  bio: {
                                      contains: q,
                                      mode: 'insensitive' as const,
                                  },
                              },
                          ],
                      },
                  })
                : Promise.resolve(0),
        ]);

        const [videos, creators, videoCount, creatorCount] = results;

        // Get popular tags for suggestions
        const popularTags = await prisma.video.findMany({
            where: {
                status: 'PUBLISHED',
                tags: {
                    isEmpty: false,
                },
            },
            select: {
                tags: true,
            },
            take: 100,
        });

        // Flatten and count tag frequency
        const tagFrequency: { [key: string]: number } = {};
        popularTags.forEach((video) => {
            video.tags.forEach((tag) => {
                tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
            });
        });

        const suggestedTags = Object.entries(tagFrequency)
            .filter(
                ([tag]) =>
                    tag.toLowerCase().includes(q.toLowerCase()) ||
                    searchTerms.some((term) => tag.toLowerCase().includes(term))
            )
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([tag]) => tag);

        const response = {
            query: q,
            type,
            filters: {
                topic,
                creator,
                tags: tagArray,
                sortBy,
            },
            pagination: {
                page,
                limit,
                total: videoCount + creatorCount,
                totalPages: Math.ceil((videoCount + creatorCount) / limit),
            },
            results: {
                videos: {
                    items: videos,
                    count: videoCount,
                },
                creators: {
                    items: creators,
                    count: creatorCount,
                },
            },
            suggestions: {
                tags: suggestedTags,
            },
        };

        return NextResponse.json(response);
    } catch (error) {
        logger.error('Search error', {
            error: error instanceof Error ? error.message : String(error),
            endpoint: '/api/search',
        });

        if (error instanceof z.ZodError) {
            return createErrorResponse(
                'Invalid search parameters',
                400,
                error.issues
            );
        }

        return createErrorResponse('Search failed', 500);
    }
});
