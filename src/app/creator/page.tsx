import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { CreatorDashboardStats } from '@/components/creator/dashboard-stats';
import { RecentContent } from '@/components/creator/recent-content';
import { UpcomingSchedule } from '@/components/creator/upcoming-schedule';
import { QuickActions } from '@/components/creator/quick-actions';

export default async function CreatorDashboard() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return null;
    }

    // Get creator profile
    const creator = await prisma.creator.findFirst({
        where: {
            user: {
                id: session.user.id,
            },
        },
        include: {
            videos: {
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: {
                    show: true,
                },
            },
            blogs: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
        },
    });

    if (!creator) {
        return (
            <div className='text-center py-12'>
                <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                    Creator Profile Not Found
                </h1>
                <p className='text-gray-600'>
                    Your creator profile hasn&apos;t been set up yet. Please
                    contact an administrator.
                </p>
            </div>
        );
    }

    // Get dashboard stats
    const stats = await prisma.creator.findUnique({
        where: { id: creator.id },
        include: {
            _count: {
                select: {
                    videos: true,
                    blogs: true,
                },
            },
        },
    });

    const totalViews = await prisma.video.aggregate({
        where: { creatorId: creator.id },
        _sum: {
            viewCount: true,
        },
    });

    const dashboardStats = {
        totalVideos: stats?._count.videos || 0,
        totalBlogs: stats?._count.blogs || 0,
        totalViews: totalViews._sum.viewCount || 0,
        subscriberCount: 0, // TODO: Implement subscriber system
    };

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='border-b border-gray-200 pb-5'>
                <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                    Creator Dashboard
                </h1>
                <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                    Welcome back, {creator.displayName}! Manage your content,
                    schedule uploads, and track your impact.
                </p>
            </div>

            {/* Quick Actions */}
            <QuickActions />

            {/* Stats */}
            <CreatorDashboardStats stats={dashboardStats} />

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Recent Content */}
                <RecentContent videos={creator.videos} blogs={creator.blogs} />

                {/* Upcoming Schedule */}
                <UpcomingSchedule />
            </div>
        </div>
    );
}
