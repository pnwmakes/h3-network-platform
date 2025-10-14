import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        // Get current date for monthly calculations
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Fetch all stats in parallel
        const [
            totalUsers,
            totalCreators,
            activeCreators,
            totalVideos,
            totalBlogs,
            pendingContent,
            registrationsThisMonth,
            monthlyViews,
        ] = await Promise.all([
            // Total users
            prisma.user.count(),

            // Total creators
            prisma.user.count({
                where: { role: 'CREATOR' },
            }),

            // Active creators (those with profiles)
            prisma.creator.count({
                where: { isActive: true },
            }),

            // Total videos
            prisma.video.count(),

            // Total blogs
            prisma.blog.count(),

            // Pending content (videos and blogs with DRAFT status)
            Promise.all([
                prisma.video.count({
                    where: { status: 'DRAFT' },
                }),
                prisma.blog.count({
                    where: { status: 'DRAFT' },
                }),
            ]).then(([videos, blogs]) => videos + blogs),

            // Registrations this month
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: firstDayOfMonth,
                    },
                },
            }),

            // Monthly views (sum of video view counts for this month)
            prisma.video
                .aggregate({
                    _sum: {
                        viewCount: true,
                    },
                    where: {
                        publishedAt: {
                            gte: firstDayOfMonth,
                        },
                    },
                })
                .then((result) => result._sum.viewCount || 0),
        ]);

        const stats = {
            totalUsers,
            totalCreators,
            activeCreators,
            totalVideos,
            totalBlogs,
            pendingContent,
            registrationsThisMonth,
            monthlyViews,
        };

        return NextResponse.json({
            success: true,
            stats,
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch admin statistics',
            },
            { status: 500 }
        );
    }
}
