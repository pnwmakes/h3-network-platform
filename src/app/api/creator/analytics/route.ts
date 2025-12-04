import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user ||
            (session.user.role !== 'CREATOR' &&
                session.user.role !== 'SUPER_ADMIN')
        ) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the creator's ID
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            include: { creator: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        if (!user.creator && session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Creator profile not found' },
                { status: 404 }
            );
        }

        const creatorId = user?.creator?.id;

        // Get real analytics data from database
        const [videos, blogs, videoStats, blogStats] = await Promise.all([
            // Get all videos for this creator
            prisma.video.findMany({
                where: creatorId ? { creatorId } : {},
                select: {
                    id: true,
                    title: true,
                    thumbnailUrl: true,
                    viewCount: true,
                    likeCount: true,
                    publishedAt: true,
                    createdAt: true,
                    _count: {
                        select: {
                            likes: true,
                        },
                    },
                },
                orderBy: { viewCount: 'desc' },
                take: 10,
            }),
            // Get all blogs for this creator
            prisma.blog.findMany({
                where: creatorId ? { creatorId } : {},
                select: {
                    id: true,
                    title: true,
                    featuredImage: true,
                    viewCount: true,
                    likeCount: true,
                    publishedAt: true,
                    createdAt: true,
                    _count: {
                        select: {
                            likes: true,
                        },
                    },
                },
                orderBy: { viewCount: 'desc' },
                take: 10,
            }),
            // Aggregate video stats
            prisma.video.aggregate({
                where: creatorId ? { creatorId } : {},
                _sum: {
                    viewCount: true,
                    likeCount: true,
                },
                _count: true,
            }),
            // Aggregate blog stats
            prisma.blog.aggregate({
                where: creatorId ? { creatorId } : {},
                _sum: {
                    viewCount: true,
                    likeCount: true,
                },
                _count: true,
            }),
        ]);

        // Calculate totals
        const totalViews =
            (videoStats._sum.viewCount || 0) + (blogStats._sum.viewCount || 0);
        const totalLikes =
            (videoStats._sum.likeCount || 0) + (blogStats._sum.likeCount || 0);
        const totalContent = videoStats._count + blogStats._count;

        // Calculate engagement rate (likes / views * 100)
        const engagementRate =
            totalViews > 0
                ? Number(((totalLikes / totalViews) * 100).toFixed(1))
                : 0;

        // Get views over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentVideos = await prisma.video.findMany({
            where: {
                ...(creatorId && { creatorId }),
                publishedAt: { gte: thirtyDaysAgo },
            },
            select: {
                publishedAt: true,
                viewCount: true,
            },
        });

        const recentBlogs = await prisma.blog.findMany({
            where: {
                ...(creatorId && { creatorId }),
                publishedAt: { gte: thirtyDaysAgo },
            },
            select: {
                publishedAt: true,
                viewCount: true,
            },
        });

        // Group views by date
        const viewsByDate = new Map<string, number>();
        [...recentVideos, ...recentBlogs].forEach((item) => {
            if (item.publishedAt) {
                const date = item.publishedAt.toISOString().split('T')[0];
                viewsByDate.set(
                    date,
                    (viewsByDate.get(date) || 0) + (item.viewCount || 0)
                );
            }
        });

        // Create 30-day array
        const viewsOverTime = Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            const dateStr = date.toISOString().split('T')[0];
            return {
                date: dateStr,
                views: viewsByDate.get(dateStr) || 0,
                engagement: 0,
            };
        });

        // Last 7 days
        const last7Days = viewsOverTime.slice(-7).map((day) => ({
            date: day.date,
            count: day.views,
        }));

        // Format content performance
        const topVideos = videos.slice(0, 5).map((video) => ({
            id: video.id,
            title: video.title,
            type: 'video' as const,
            publishedAt:
                video.publishedAt?.toISOString() ||
                video.createdAt.toISOString(),
            views: video.viewCount,
            engagement:
                video.viewCount > 0
                    ? Number(
                          (
                              (video._count.likes / video.viewCount) *
                              100
                          ).toFixed(1)
                      )
                    : 0,
            likes: video.likeCount,
            comments: 0,
            shares: 0,
            avgWatchTime: 0,
            thumbnail: video.thumbnailUrl || '/api/placeholder/300/200',
        }));

        const topBlogs = blogs.slice(0, 3).map((blog) => ({
            id: blog.id,
            title: blog.title,
            type: 'blog' as const,
            publishedAt:
                blog.publishedAt?.toISOString() || blog.createdAt.toISOString(),
            views: blog.viewCount,
            engagement:
                blog.viewCount > 0
                    ? Number(
                          ((blog._count.likes / blog.viewCount) * 100).toFixed(
                              1
                          )
                      )
                    : 0,
            likes: blog.likeCount,
            comments: 0,
            shares: 0,
            avgWatchTime: 0,
            thumbnail: blog.featuredImage || '/api/placeholder/300/200',
        }));

        // Top content combined
        const topContent = [...topVideos, ...topBlogs]
            .sort((a, b) => b.views - a.views)
            .slice(0, 10)
            .map((item) => ({
                id: item.id,
                title: item.title,
                type: item.type,
                views: item.views,
                engagement: item.engagement / 100,
                thumbnail: item.thumbnail,
            }));

        const analytics = {
            overview: {
                totalViews,
                totalLikes,
                totalComments: 0,
                totalShares: 0,
                averageWatchTime: '0:00',
                avgViewDuration: 0,
                engagementRate,
                subscriberGrowth: 0,
                contentCount: totalContent,
            },
            timeRange: {
                views: last7Days,
                engagement: last7Days.map((day) => ({
                    date: day.date,
                    rate: engagementRate,
                })),
                contentPublished: last7Days.map((day) => {
                    const publishedCount = [
                        ...recentVideos,
                        ...recentBlogs,
                    ].filter(
                        (item) =>
                            item.publishedAt?.toISOString().split('T')[0] ===
                            day.date
                    ).length;
                    return {
                        date: day.date,
                        count: publishedCount,
                    };
                }),
            },
            contentPerformance: {
                videos: topVideos.slice(0, 2),
                blogs: topBlogs.slice(0, 1),
            },
            performance: {
                topContent,
                viewsOverTime,
            },
            audienceInsights: {
                demographics: {
                    ageGroups: [
                        { range: '18-24', percentage: 15 },
                        { range: '25-34', percentage: 35 },
                        { range: '35-44', percentage: 28 },
                        { range: '45-54', percentage: 15 },
                        { range: '55+', percentage: 7 },
                    ],
                    locations: [
                        { country: 'United States', percentage: 78 },
                        { country: 'Canada', percentage: 12 },
                        { country: 'United Kingdom', percentage: 6 },
                        { country: 'Australia', percentage: 4 },
                    ],
                    interests: [
                        { topic: 'Criminal Justice Reform', percentage: 32 },
                        { topic: 'Addiction Recovery', percentage: 28 },
                        { topic: 'Mental Health', percentage: 18 },
                        { topic: 'Community Support', percentage: 15 },
                        { topic: 'Legal Advocacy', percentage: 7 },
                    ],
                },
                behavior: {
                    peakHours: [
                        { hour: 0, activity: 0.023 },
                        { hour: 1, activity: 0.018 },
                        { hour: 2, activity: 0.015 },
                        { hour: 3, activity: 0.012 },
                        { hour: 4, activity: 0.014 },
                        { hour: 5, activity: 0.019 },
                        { hour: 6, activity: 0.031 },
                        { hour: 7, activity: 0.048 },
                        { hour: 8, activity: 0.067 },
                        { hour: 9, activity: 0.083 },
                        { hour: 10, activity: 0.091 },
                        { hour: 11, activity: 0.098 },
                        { hour: 12, activity: 0.105 },
                        { hour: 13, activity: 0.112 },
                        { hour: 14, activity: 0.108 },
                        { hour: 15, activity: 0.115 },
                        { hour: 16, activity: 0.123 },
                        { hour: 17, activity: 0.118 },
                        { hour: 18, activity: 0.134 },
                        { hour: 19, activity: 0.142 },
                        { hour: 20, activity: 0.138 },
                        { hour: 21, activity: 0.125 },
                        { hour: 22, activity: 0.089 },
                        { hour: 23, activity: 0.056 },
                    ],
                    deviceTypes: [
                        { type: 'Desktop', percentage: 45 },
                        { type: 'Mobile', percentage: 38 },
                        { type: 'Tablet', percentage: 17 },
                    ],
                },
            },
            goals: {
                monthly: {
                    target: 10000,
                    current: totalViews,
                    period: new Date().toISOString().slice(0, 7),
                },
                quarterly: {
                    target: 25000,
                    current: totalViews,
                    period: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
                },
            },
        };

        return NextResponse.json({ success: true, analytics });
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
