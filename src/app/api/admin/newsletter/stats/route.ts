import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// GET /api/admin/newsletter/stats - Get newsletter statistics
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication required',
                },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Admin access required',
                },
                { status: 403 }
            );
        }

        // Get subscriber statistics
        const [
            totalSubscribers,
            activeSubscribers,
            recentSubscribers,
            newsletterCounts,
            recentNewsletters,
            subscriberPreferences,
        ] = await Promise.all([
            // Total subscribers
            prisma.newsletterSubscriber.count(),

            // Active subscribers
            prisma.newsletterSubscriber.count({
                where: { isActive: true },
            }),

            // Recent subscribers (last 30 days)
            prisma.newsletterSubscriber.count({
                where: {
                    subscribedAt: {
                        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    },
                    isActive: true,
                },
            }),

            // Newsletter counts by status
            prisma.newsletter.groupBy({
                by: ['status'],
                _count: { id: true },
            }),

            // Recent newsletters (last 10)
            prisma.newsletter.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                    recipientCount: true,
                    sentAt: true,
                    createdAt: true,
                    createdBy: {
                        select: {
                            name: true,
                            email: true,
                        },
                    },
                },
            }),

            // Subscriber preferences breakdown
            prisma.newsletterPreferences.groupBy({
                by: [
                    'specialEvents',
                    'majorUpdates',
                    'monthlyNewsletter',
                    'newContentNotify',
                ],
                _count: { id: true },
                where: {
                    subscriber: {
                        isActive: true,
                    },
                },
            }),
        ]);

        // Calculate newsletter statistics
        const newsletterStats = {
            total: 0,
            draft: 0,
            scheduled: 0,
            sent: 0,
            failed: 0,
        };

        newsletterCounts.forEach((stat) => {
            newsletterStats.total += stat._count.id;
            if (stat.status === 'DRAFT') newsletterStats.draft = stat._count.id;
            if (stat.status === 'SCHEDULED')
                newsletterStats.scheduled = stat._count.id;
            if (stat.status === 'SENT') newsletterStats.sent = stat._count.id;
            if (stat.status === 'FAILED')
                newsletterStats.failed = stat._count.id;
        });

        // Calculate preference percentages
        const preferenceStats = {
            specialEvents: 0,
            majorUpdates: 0,
            monthlyNewsletter: 0,
            newContentNotify: 0,
        };

        if (activeSubscribers > 0) {
            const specialEventsCount = subscriberPreferences
                .filter((p) => p.specialEvents)
                .reduce((sum, p) => sum + p._count.id, 0);
            const majorUpdatesCount = subscriberPreferences
                .filter((p) => p.majorUpdates)
                .reduce((sum, p) => sum + p._count.id, 0);
            const monthlyNewsletterCount = subscriberPreferences
                .filter((p) => p.monthlyNewsletter)
                .reduce((sum, p) => sum + p._count.id, 0);
            const newContentNotifyCount = subscriberPreferences
                .filter((p) => p.newContentNotify)
                .reduce((sum, p) => sum + p._count.id, 0);

            preferenceStats.specialEvents = Math.round(
                (specialEventsCount / activeSubscribers) * 100
            );
            preferenceStats.majorUpdates = Math.round(
                (majorUpdatesCount / activeSubscribers) * 100
            );
            preferenceStats.monthlyNewsletter = Math.round(
                (monthlyNewsletterCount / activeSubscribers) * 100
            );
            preferenceStats.newContentNotify = Math.round(
                (newContentNotifyCount / activeSubscribers) * 100
            );
        }

        const stats = {
            subscribers: {
                total: totalSubscribers,
                active: activeSubscribers,
                inactive: totalSubscribers - activeSubscribers,
                recent: recentSubscribers,
                growthRate:
                    totalSubscribers > 0
                        ? Math.round(
                              (recentSubscribers / totalSubscribers) * 100
                          )
                        : 0,
            },
            newsletters: newsletterStats,
            preferences: preferenceStats,
            recentNewsletters,
        };

        logger.info('Newsletter stats retrieved', {
            userId: session.user.id,
            statsGenerated: true,
        });

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        logger.error('Newsletter stats error', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to retrieve newsletter statistics',
            },
            { status: 500 }
        );
    }
}
