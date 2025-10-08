import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Retrieve all user's video progress
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
        const limit = parseInt(searchParams.get('limit') || '10');
        const includeCompleted =
            searchParams.get('includeCompleted') === 'true';

        // Get user's progress for all videos
        const progressRecords = await prisma.userProgress.findMany({
            where: {
                userId: session.user.id,
                contentType: 'VIDEO',
                ...(includeCompleted ? {} : { completed: false }),
            },
            include: {
                video: {
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
                },
            },
            orderBy: {
                lastWatched: 'desc',
            },
            take: limit,
        });

        // Format the response
        const formattedProgress = progressRecords.map((record) => ({
            videoId: record.videoId,
            progressSeconds: record.progressSeconds,
            completed: record.completed,
            lastWatched: record.lastWatched,
            progressPercentage: record.video?.duration
                ? Math.round(
                      (record.progressSeconds / record.video.duration) * 100
                  )
                : 0,
            video: {
                id: record.video?.id,
                title: record.video?.title,
                thumbnailUrl: record.video?.thumbnailUrl,
                duration: record.video?.duration,
                creator: record.video?.creator?.displayName,
                show: record.video?.show?.name,
            },
        }));

        return NextResponse.json({
            progress: formattedProgress,
            total: formattedProgress.length,
        });
    } catch (error) {
        console.error('Error retrieving user progress:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
