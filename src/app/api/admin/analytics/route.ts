import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get date range from query params (default to last 30 days)
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30';
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(range));

        // Platform overview stats
        const [
            totalUsers,
            totalVideos,
            totalBlogs,
            totalCreators,
            newUsersThisMonth,
            newVideosThisMonth,
            newBlogsThisMonth,
            activeUsersToday,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.video.count(),
            prisma.blog.count(),
            prisma.user.count({ where: { role: 'CREATOR' } }),
            prisma.user.count({
                where: {
                    createdAt: { gte: startDate },
                },
            }),
            prisma.video.count({
                where: {
                    createdAt: { gte: startDate },
                },
            }),
            prisma.blog.count({
                where: {
                    createdAt: { gte: startDate },
                },
            }),
            // Use recent user progress activity as proxy for active users
            prisma.userProgress.count({
                where: {
                    lastWatched: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
                    },
                },
            }),
        ]);

        const totalContent = totalVideos + totalBlogs;
        const newContentThisMonth = newVideosThisMonth + newBlogsThisMonth;

        // Top performing content - combine videos and blogs
        const [topVideos, topBlogs] = await Promise.all([
            prisma.video.findMany({
                take: 3,
                orderBy: { viewCount: 'desc' },
                select: {
                    id: true,
                    title: true,
                    viewCount: true,
                    likeCount: true,
                    creator: {
                        select: {
                            displayName: true,
                        },
                    },
                },
            }),
            prisma.blog.findMany({
                take: 2,
                orderBy: { viewCount: 'desc' },
                select: {
                    id: true,
                    title: true,
                    viewCount: true,
                    likeCount: true,
                    creator: {
                        select: {
                            displayName: true,
                        },
                    },
                },
            }),
        ]);

        // Combine and format top content
        const topContent = [
            ...topVideos.map((video) => ({
                id: video.id,
                title: video.title,
                views: video.viewCount,
                likes: video.likeCount,
                type: 'video',
                creator: { name: video.creator.displayName },
            })),
            ...topBlogs.map((blog) => ({
                id: blog.id,
                title: blog.title,
                views: blog.viewCount,
                likes: blog.likeCount,
                type: 'blog',
                creator: { name: blog.creator.displayName },
            })),
        ].sort((a, b) => b.views - a.views);

        // User growth over time (last 12 months)
        const userGrowth = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const startOfMonth = new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );
            const endOfMonth = new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            );

            const count = await prisma.user.count({
                where: {
                    createdAt: {
                        gte: startOfMonth,
                        lte: endOfMonth,
                    },
                },
            });

            userGrowth.push({
                month: date.toLocaleDateString('en-US', { month: 'short' }),
                users: count,
            });
        }

        // Content performance by topic (replacing category)
        const [videosByTopic, blogsByTopic] = await Promise.all([
            prisma.video.groupBy({
                by: ['topic'],
                _count: {
                    id: true,
                },
                _avg: {
                    viewCount: true,
                    likeCount: true,
                },
            }),
            prisma.blog.groupBy({
                by: ['topic'],
                _count: {
                    id: true,
                },
                _avg: {
                    viewCount: true,
                    likeCount: true,
                },
            }),
        ]);

        // Combine content by topic
        const topicMap = new Map();

        videosByTopic.forEach((item) => {
            const topic = item.topic || 'GENERAL';
            if (!topicMap.has(topic)) {
                topicMap.set(topic, { count: 0, avgViews: 0, avgLikes: 0 });
            }
            const existing = topicMap.get(topic);
            existing.count += item._count.id;
            existing.avgViews =
                (existing.avgViews + (item._avg.viewCount || 0)) / 2;
            existing.avgLikes =
                (existing.avgLikes + (item._avg.likeCount || 0)) / 2;
        });

        blogsByTopic.forEach((item) => {
            const topic = item.topic || 'GENERAL';
            if (!topicMap.has(topic)) {
                topicMap.set(topic, { count: 0, avgViews: 0, avgLikes: 0 });
            }
            const existing = topicMap.get(topic);
            existing.count += item._count.id;
            existing.avgViews =
                (existing.avgViews + (item._avg.viewCount || 0)) / 2;
            existing.avgLikes =
                (existing.avgLikes + (item._avg.likeCount || 0)) / 2;
        });

        const contentByCategory = Array.from(topicMap.entries()).map(
            ([topic, data]) => ({
                category: topic,
                count: data.count,
                avgViews: Math.round(data.avgViews),
                avgLikes: Math.round(data.avgLikes),
            })
        );

        // Recent activity
        const recentUsers = await prisma.user.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                role: true,
            },
        });

        // Get recent content from both videos and blogs
        const [recentVideos, recentBlogs] = await Promise.all([
            prisma.video.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    creator: {
                        select: {
                            displayName: true,
                        },
                    },
                },
            }),
            prisma.blog.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    createdAt: true,
                    creator: {
                        select: {
                            displayName: true,
                        },
                    },
                },
            }),
        ]);

        // Combine and sort recent content
        const recentContent = [
            ...recentVideos.map((video) => ({
                id: video.id,
                title: video.title,
                status: video.status,
                createdAt: video.createdAt,
                type: 'video',
                creator: { name: video.creator.displayName },
            })),
            ...recentBlogs.map((blog) => ({
                id: blog.id,
                title: blog.title,
                status: blog.status,
                createdAt: blog.createdAt,
                type: 'blog',
                creator: { name: blog.creator.displayName },
            })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            )
            .slice(0, 10);

        // Engagement stats
        const [videoStats, blogStats] = await Promise.all([
            prisma.video.aggregate({
                _sum: {
                    viewCount: true,
                    likeCount: true,
                },
            }),
            prisma.blog.aggregate({
                _sum: {
                    viewCount: true,
                    likeCount: true,
                },
            }),
        ]);

        const totalViews =
            (videoStats._sum.viewCount || 0) + (blogStats._sum.viewCount || 0);
        const totalLikes =
            (videoStats._sum.likeCount || 0) + (blogStats._sum.likeCount || 0);

        const avgEngagementRate =
            totalLikes && totalViews
                ? ((totalLikes / totalViews) * 100).toFixed(2)
                : '0';

        // Goals and targets (mock data - implement based on your business logic)
        const goals = [
            {
                name: 'Monthly Active Users',
                current: activeUsersToday * 30, // Rough estimate
                target: 10000,
                progress: Math.min(
                    ((activeUsersToday * 30) / 10000) * 100,
                    100
                ),
            },
            {
                name: 'Content Creation',
                current: newContentThisMonth,
                target: 500,
                progress: Math.min((newContentThisMonth / 500) * 100, 100),
            },
            {
                name: 'User Growth',
                current: newUsersThisMonth,
                target: 1000,
                progress: Math.min((newUsersThisMonth / 1000) * 100, 100),
            },
        ];

        const analyticsData = {
            overview: {
                totalUsers,
                totalContent,
                totalCreators,
                totalRevenue: 0, // Implement revenue tracking if needed
                newUsersThisMonth,
                newContentThisMonth,
                activeUsersToday,
                totalViews: totalViews || 0,
                totalLikes: totalLikes || 0,
                avgEngagementRate: parseFloat(avgEngagementRate),
            },
            topContent,
            userGrowth,
            contentByCategory,
            recentActivity: {
                users: recentUsers,
                content: recentContent,
            },
            goals,
        };

        return NextResponse.json(analyticsData);
    } catch (error) {
        console.error('Analytics API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics data' },
            { status: 500 }
        );
    }
}
