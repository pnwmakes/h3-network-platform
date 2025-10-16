import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        console.log('Auto-publish: Starting scheduled content check...');

        // Get current time
        const now = new Date();

        // Find all scheduled content that should be published
        const scheduledContent = await prisma.scheduledContent.findMany({
            where: {
                publishAt: {
                    lte: now,
                },
                status: 'PENDING',
            },
            include: {
                video: true,
                blog: true,
                creator: true,
            },
        });

        console.log(
            `Auto-publish: Found ${scheduledContent.length} items to publish`
        );

        const results = [];

        for (const item of scheduledContent) {
            try {
                let contentTitle = '';

                if (item.contentType === 'VIDEO' && item.video) {
                    // Update video status and publishedAt
                    await prisma.video.update({
                        where: { id: item.videoId! },
                        data: {
                            status: 'PUBLISHED',
                            publishedAt: now,
                        },
                    });

                    // Update scheduled content status
                    await prisma.scheduledContent.update({
                        where: { id: item.id },
                        data: {
                            status: 'PUBLISHED',
                            notes: `Auto-published at ${now.toISOString()}`,
                        },
                    });

                    contentTitle = item.video.title;
                    console.log(
                        `Auto-publish: Published video "${contentTitle}"`
                    );
                } else if (item.contentType === 'BLOG' && item.blog) {
                    // Update blog status and publishedAt
                    await prisma.blog.update({
                        where: { id: item.blogId! },
                        data: {
                            status: 'PUBLISHED',
                            publishedAt: now,
                        },
                    });

                    // Update scheduled content status
                    await prisma.scheduledContent.update({
                        where: { id: item.id },
                        data: {
                            status: 'PUBLISHED',
                            notes: `Auto-published at ${now.toISOString()}`,
                        },
                    });

                    contentTitle = item.blog.title;
                    console.log(
                        `Auto-publish: Published blog "${contentTitle}"`
                    );
                }

                results.push({
                    id: item.id,
                    contentType: item.contentType,
                    title: contentTitle,
                    status: 'PUBLISHED',
                    publishedAt: now,
                });
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Unknown error';

                // Mark as failed and log error
                await prisma.scheduledContent.update({
                    where: { id: item.id },
                    data: {
                        status: 'FAILED',
                        notes: `Auto-publish failed: ${errorMessage}`,
                    },
                });

                console.error(
                    `Auto-publish: Failed to publish content ${item.id}:`,
                    error
                );

                results.push({
                    id: item.id,
                    contentType: item.contentType,
                    status: 'FAILED',
                    error: errorMessage,
                    publishedAt: null,
                });
            }
        }

        console.log(
            `Auto-publish: Completed. Published ${
                results.filter((r) => r.status === 'PUBLISHED').length
            } items, failed ${
                results.filter((r) => r.status === 'FAILED').length
            } items`
        );

        return NextResponse.json({
            success: true,
            message: `Auto-publish completed. Processed ${results.length} items.`,
            results,
            timestamp: now.toISOString(),
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        console.error('Auto-publish: System error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Auto-publish system error',
                error: errorMessage,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Get system status and upcoming content
        const now = new Date();
        const nextHour = new Date(now.getTime() + 60 * 60 * 1000);

        // Get pending content for next hour
        const upcomingContent = await prisma.scheduledContent.findMany({
            where: {
                publishAt: {
                    gte: now,
                    lte: nextHour,
                },
                status: 'PENDING',
            },
            include: {
                video: true,
                blog: true,
                creator: true,
            },
            orderBy: {
                publishAt: 'asc',
            },
            take: 5,
        });

        // Get recently published content (last 24 hours)
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const recentlyPublished = await prisma.scheduledContent.findMany({
            where: {
                status: 'PUBLISHED',
                updatedAt: {
                    gte: yesterday,
                },
            },
            include: {
                video: true,
                blog: true,
                creator: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
            take: 10,
        });

        // Count pending items
        const totalPending = await prisma.scheduledContent.count({
            where: {
                status: 'PENDING',
                publishAt: {
                    gte: now,
                },
            },
        });

        // Transform data for response
        const transformContent = (items: typeof upcomingContent) =>
            items.map((item) => ({
                id: item.id,
                contentType: item.contentType,
                title: item.video?.title || item.blog?.title,
                publishAt: item.publishAt,
                status: item.status,
                creator: item.creator.displayName,
            }));

        return NextResponse.json(
            {
                success: true,
                data: {
                    upcomingContent: transformContent(upcomingContent),
                    recentlyPublished: transformContent(recentlyPublished),
                    totalPending,
                    systemStatus: 'operational',
                    lastCheck: now.toISOString(),
                },
            },
            {
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    Pragma: 'no-cache',
                    Expires: '0',
                },
            }
        );
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
        console.error('Auto-publish status error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to get auto-publish status',
                error: errorMessage,
            },
            { status: 500 }
        );
    }
}
