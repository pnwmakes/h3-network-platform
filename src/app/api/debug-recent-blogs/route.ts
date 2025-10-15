import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get all recent blogs regardless of status
        const allBlogs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                publishedAt: true,
                createdAt: true,
                updatedAt: true,
                featuredImage: true,
                creator: {
                    select: {
                        displayName: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 15,
        });

        // Get published blogs (what should show on blogs page)
        const publishedBlogs = await prisma.blog.findMany({
            where: {
                status: 'PUBLISHED',
                publishedAt: {
                    lte: new Date(),
                },
            },
            select: {
                id: true,
                title: true,
                publishedAt: true,
                featuredImage: true,
                creator: {
                    select: {
                        displayName: true,
                    },
                },
            },
            orderBy: {
                publishedAt: 'desc',
            },
            take: 10,
        });

        return NextResponse.json({
            message: 'Blog status debug information',
            timestamp: new Date().toISOString(),
            allRecentBlogs: allBlogs.map((blog) => ({
                id: blog.id,
                title: blog.title,
                status: blog.status,
                creator: blog.creator.displayName,
                publishedAt: blog.publishedAt,
                createdAt: blog.createdAt,
                updatedAt: blog.updatedAt,
                hasFeaturedImage: !!blog.featuredImage,
                imageType: blog.featuredImage?.startsWith('data:')
                    ? 'data-url'
                    : blog.featuredImage?.startsWith('/uploads')
                    ? 'file'
                    : blog.featuredImage
                    ? 'external'
                    : 'none',
            })),
            publishedBlogsForListing: publishedBlogs.map((blog) => ({
                id: blog.id,
                title: blog.title,
                creator: blog.creator.displayName,
                publishedAt: blog.publishedAt,
                hasFeaturedImage: !!blog.featuredImage,
            })),
        });
    } catch (error) {
        console.error('Debug blogs error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch debug info',
                details:
                    error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
