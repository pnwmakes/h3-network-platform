import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        return NextResponse.json({
            ...blog,
            viewCount: blog.viewCount + 1,
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog post' },
            { status: 500 }
        );
    }
}
