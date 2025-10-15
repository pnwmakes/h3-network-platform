import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;

        const video = await prisma.video.findUnique({
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
                show: {
                    select: {
                        name: true,
                        description: true,
                    },
                },
            },
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Increment view count
        await prisma.video.update({
            where: { id },
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
        console.error('Error fetching video:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video' },
            { status: 500 }
        );
    }
}
