import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for progress updates
const progressSchema = z.object({
    videoId: z.string().cuid(),
    progressSeconds: z.number().min(0),
    completed: z.boolean().optional(),
});

// GET - Retrieve user's progress for a specific video
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const videoId = searchParams.get('videoId');

        if (!videoId) {
            return NextResponse.json(
                { error: 'Video ID is required' },
                { status: 400 }
            );
        }

        // Get user's progress for this video
        const progress = await prisma.userProgress.findUnique({
            where: {
                userId_videoId: {
                    userId: session.user.id,
                    videoId: videoId,
                },
            },
            include: {
                video: {
                    select: {
                        duration: true,
                        title: true,
                    },
                },
            },
        });

        if (!progress) {
            return NextResponse.json({
                progressSeconds: 0,
                completed: false,
                exists: false,
            });
        }

        return NextResponse.json({
            progressSeconds: progress.progressSeconds,
            completed: progress.completed,
            lastWatched: progress.lastWatched,
            exists: true,
            video: progress.video,
        });
    } catch (error) {
        console.error('Error retrieving progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST - Update user's progress for a video
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input
        const result = progressSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: result.error.issues },
                { status: 400 }
            );
        }

        const { videoId, progressSeconds, completed } = result.data;

        // Verify video exists
        const video = await prisma.video.findUnique({
            where: { id: videoId },
            select: { id: true, duration: true },
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Determine if completed based on progress or explicit flag
        const isCompleted =
            completed ||
            (video.duration && progressSeconds >= video.duration * 0.9) ||
            false;

        // Update or create progress record
        const progress = await prisma.userProgress.upsert({
            where: {
                userId_videoId: {
                    userId: session.user.id,
                    videoId: videoId,
                },
            },
            update: {
                progressSeconds,
                completed: isCompleted,
                lastWatched: new Date(),
            },
            create: {
                userId: session.user.id,
                videoId: videoId,
                progressSeconds,
                completed: isCompleted,
                contentType: 'VIDEO',
                lastWatched: new Date(),
            },
        });

        // Update video view count if this is a new view (first progress update)
        if (progressSeconds === 0 || !progress) {
            await prisma.video.update({
                where: { id: videoId },
                data: {
                    viewCount: {
                        increment: 1,
                    },
                },
            });
        }

        return NextResponse.json({
            success: true,
            progress: {
                progressSeconds: progress.progressSeconds,
                completed: progress.completed,
                lastWatched: progress.lastWatched,
            },
        });
    } catch (error) {
        console.error('Error updating progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
