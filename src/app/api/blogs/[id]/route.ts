import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const blog = await prisma.blog.findUnique({
            where: {
                id,
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
            },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog post not found' },
                { status: 404 }
            );
        }

        // Increment view count
        await prisma.blog.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });

        const response = NextResponse.json({
            ...blog,
            viewCount: blog.viewCount + 1,
        });

        // Disable browser caching
        response.headers.set(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog post' },
            { status: 500 }
        );
    }
}
