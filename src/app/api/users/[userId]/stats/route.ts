import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId } = await params;

        // Users can only access their own stats
        if (session.user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get user's viewing statistics
        const userProgress = await prisma.userProgress.findMany({
            where: {
                userId: userId,
                contentType: 'VIDEO',
            },
            include: {
                video: {
                    select: {
                        topic: true,
                        duration: true,
                    },
                },
            },
        });

        // Calculate stats
        const totalVideosWatched = userProgress.length;
        const completedVideos = userProgress.filter((p) => p.completed).length;

        // Calculate total watch time in minutes
        const totalWatchTime = Math.round(
            userProgress.reduce((total, progress) => {
                return total + progress.progressSeconds;
            }, 0) / 60
        );

        // Calculate this week's activity
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const thisWeekProgress = userProgress.filter(
            (p) => new Date(p.lastWatched) >= oneWeekAgo
        );

        const videosThisWeek = thisWeekProgress.length;
        const minutesThisWeek = Math.round(
            thisWeekProgress.reduce((total, progress) => {
                return total + progress.progressSeconds;
            }, 0) / 60
        );

        // Calculate current streak (simplified - days with activity)
        const uniqueDays = new Set(
            userProgress.map((p) => new Date(p.lastWatched).toDateString())
        );
        const currentStreak = uniqueDays.size;

        // Get favorite topics
        const topicCounts = userProgress.reduce((acc, progress) => {
            if (progress.video?.topic) {
                acc[progress.video.topic] =
                    (acc[progress.video.topic] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);

        const favoriteTopics = Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([topic]) => topic);

        // Get user join date
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { createdAt: true },
        });

        const joinDate = user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
              })
            : 'Unknown';

        const stats = {
            totalVideosWatched,
            totalWatchTime,
            completedVideos,
            currentStreak,
            joinDate,
            favoriteTopics,
            recentActivity: {
                videosThisWeek,
                minutesThisWeek,
            },
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
