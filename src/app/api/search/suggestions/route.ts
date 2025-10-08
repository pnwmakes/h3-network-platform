import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const suggestionsSchema = z.object({
    q: z.string().min(1).max(100),
    limit: z.coerce.number().min(1).max(20).optional().default(10),
});

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        const { q, limit } = suggestionsSchema.parse(params);

        const query = q.toLowerCase().trim();

        // Get video title suggestions
        const videoSuggestions = await prisma.video.findMany({
            where: {
                status: 'PUBLISHED',
                title: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                title: true,
                thumbnailUrl: true,
                viewCount: true,
                creator: {
                    select: {
                        displayName: true,
                    },
                },
            },
            orderBy: {
                viewCount: 'desc',
            },
            take: Math.ceil(limit * 0.6), // 60% for videos
        });

        // Get creator suggestions
        const creatorSuggestions = await prisma.creator.findMany({
            where: {
                displayName: {
                    contains: query,
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
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
            orderBy: {
                videos: {
                    _count: 'desc',
                },
            },
            take: Math.ceil(limit * 0.3), // 30% for creators
        });

        // Get popular tags that match query
        const tagSuggestions = await prisma.video.findMany({
            where: {
                status: 'PUBLISHED',
                tags: {
                    hasSome: await getMatchingTags(query),
                },
            },
            select: {
                tags: true,
            },
            take: 50,
        });

        // Process tags to find matches and count frequency
        const tagFrequency: { [key: string]: number } = {};
        tagSuggestions.forEach((video) => {
            video.tags.forEach((tag) => {
                if (tag.toLowerCase().includes(query)) {
                    tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
                }
            });
        });

        const popularTags = Object.entries(tagFrequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, Math.ceil(limit * 0.1)) // 10% for tags
            .map(([tag]) => ({ tag, count: tagFrequency[tag] }));

        // Format response
        const suggestions = {
            query: q,
            videos: videoSuggestions.map((video) => ({
                id: video.id,
                title: video.title,
                type: 'video' as const,
                thumbnailUrl: video.thumbnailUrl,
                subtitle: `by ${video.creator.displayName} • ${video.viewCount} views`,
                url: `/videos/${video.id}`,
            })),
            creators: creatorSuggestions.map((creator) => ({
                id: creator.id,
                title: creator.displayName,
                type: 'creator' as const,
                avatarUrl: creator.avatarUrl,
                subtitle: `${creator._count.videos} video${
                    creator._count.videos !== 1 ? 's' : ''
                }`,
                url: `/search?creator=${encodeURIComponent(
                    creator.displayName
                )}`,
            })),
            tags: popularTags.map(({ tag, count }) => ({
                id: tag,
                title: `#${tag}`,
                type: 'tag' as const,
                subtitle: `${count} video${count !== 1 ? 's' : ''}`,
                url: `/search?tags=${encodeURIComponent(tag)}`,
            })),
            quickSearches: [
                {
                    id: 'search-all',
                    title: `Search for "${q}"`,
                    type: 'search' as const,
                    subtitle: 'See all results',
                    url: `/search?q=${encodeURIComponent(q)}`,
                },
            ],
        };

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Suggestions error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid parameters', details: error.issues },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to get suggestions' },
            { status: 500 }
        );
    }
}

// Helper function to get tags that match the query
async function getMatchingTags(query: string): Promise<string[]> {
    const allTags = await prisma.video.findMany({
        where: {
            status: 'PUBLISHED',
            tags: {
                isEmpty: false,
            },
        },
        select: {
            tags: true,
        },
        take: 200,
    });

    const uniqueTags = new Set<string>();
    allTags.forEach((video) => {
        video.tags.forEach((tag) => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
                uniqueTags.add(tag);
            }
        });
    });

    return Array.from(uniqueTags).slice(0, 20);
}
