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

        // Check if user is a creator or super admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { creator: true },
        });

        if (!user || !user.creator) {
            return NextResponse.json(
                { error: 'Creator profile not found' },
                { status: 404 }
            );
        }

        if (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Get available content for scheduling (DRAFT and PUBLISHED status)
        // DRAFT content can be scheduled, PUBLISHED content can be rescheduled
        const [availableVideos, availableBlogs] = await Promise.all([
            prisma.video.findMany({
                where: {
                    creatorId: user.creator.id,
                    status: {
                        in: ['DRAFT', 'PUBLISHED'],
                    },
                    // Only include content that isn't already scheduled
                    scheduledContent: null,
                },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    thumbnailUrl: true,
                    status: true,
                    createdAt: true,
                    showName: true,
                    tags: true,
                    topic: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.blog.findMany({
                where: {
                    creatorId: user.creator.id,
                    status: {
                        in: ['DRAFT', 'PUBLISHED'],
                    },
                    // Only include content that isn't already scheduled
                    scheduledContent: null,
                },
                select: {
                    id: true,
                    title: true,
                    excerpt: true,
                    featuredImage: true,
                    status: true,
                    createdAt: true,
                    readTime: true,
                    tags: true,
                    topic: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);

        const response = NextResponse.json({
            success: true,
            availableContent: {
                videos: availableVideos,
                blogs: availableBlogs,
            },
        });
        
        // Prevent caching to ensure fresh data
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        
        return response;
    } catch (error) {
        console.error('Available content fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch available content' },
            { status: 500 }
        );
    }
}