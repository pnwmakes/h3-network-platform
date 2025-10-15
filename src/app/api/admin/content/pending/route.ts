import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is super admin
        if (session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Get all content with DRAFT status (pending approval)
        const [pendingVideos, pendingBlogs] = await Promise.all([
            prisma.video.findMany({
                where: {
                    status: 'DRAFT',
                },
                include: {
                    creator: {
                        select: {
                            displayName: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            }),
            prisma.blog.findMany({
                where: {
                    status: 'DRAFT',
                },
                include: {
                    creator: {
                        select: {
                            displayName: true,
                            user: {
                                select: {
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'asc' },
            }),
        ]);

        // Transform videos to common format
        const videos = pendingVideos.map((video) => ({
            id: video.id,
            type: 'VIDEO' as const,
            title: video.title,
            description: video.description,
            status: video.status,
            createdAt: video.createdAt.toISOString(),
            youtubeUrl: video.youtubeUrl,
            youtubeId: video.youtubeId,
            creator: video.creator,
            showName: video.showName,
            seasonNumber: video.seasonNumber,
            episodeNumber: video.episodeNumber,
            contentTopics: video.contentTopics,
            guestNames: video.guestNames,
            guestBios: video.guestBios,
            sponsorNames: video.sponsorNames,
            sponsorMessages: video.sponsorMessages,
        }));

        // Transform blogs to common format
        const blogs = pendingBlogs.map((blog) => ({
            id: blog.id,
            type: 'BLOG' as const,
            title: blog.title,
            description: blog.excerpt || blog.content?.substring(0, 200) || '',
            content: blog.content,
            status: blog.status,
            createdAt: blog.createdAt.toISOString(),
            creator: blog.creator,
            contentTopics: blog.contentTopics,
            guestNames: blog.guestContributors,
            guestBios: blog.guestBios,
            sponsorNames: blog.sponsorNames,
            sponsorMessages: blog.sponsorMessages,
        }));

        // Combine and sort by creation date
        const allContent = [...videos, ...blogs].sort(
            (a, b) =>
                new Date(a.createdAt).getTime() -
                new Date(b.createdAt).getTime()
        );

        return NextResponse.json({
            success: true,
            content: allContent,
            stats: {
                totalPending: allContent.length,
                pendingVideos: videos.length,
                pendingBlogs: blogs.length,
            },
        });
    } catch (error) {
        console.error('Content moderation fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
