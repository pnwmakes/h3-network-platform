import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentStatus } from '@prisma/client';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ contentId: string; action: string }> }
) {
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

        const { contentId, action } = await params;
        const body = await request.json();
        const { feedback } = body;

        if (!['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action' },
                { status: 400 }
            );
        }

        // First check if it's a video or blog
        const video = await prisma.video.findUnique({
            where: { id: contentId },
            include: {
                creator: {
                    include: {
                        user: {
                            select: { email: true, name: true },
                        },
                    },
                },
            },
        });

        const blog = await prisma.blog.findUnique({
            where: { id: contentId },
            include: {
                creator: {
                    include: {
                        user: {
                            select: { email: true, name: true },
                        },
                    },
                },
            },
        });

        if (!video && !blog) {
            return NextResponse.json(
                { error: 'Content not found' },
                { status: 404 }
            );
        }

        const content = video || blog;
        const contentType = video ? 'video' : 'blog';

        if (!content || content.status !== 'DRAFT') {
            return NextResponse.json(
                { error: 'Content is not pending approval' },
                { status: 400 }
            );
        }

        // Update content status
        const newStatus: ContentStatus =
            action === 'approve'
                ? ContentStatus.PUBLISHED
                : ContentStatus.ARCHIVED;
        const publishedAt = action === 'approve' ? new Date() : null;

        console.log(
            `${
                action === 'approve' ? 'Approving' : 'Rejecting'
            } ${contentType}:`,
            {
                contentId,
                newStatus,
                publishedAt: publishedAt?.toISOString(),
            }
        );

        if (contentType === 'video') {
            const updatedVideo = await prisma.video.update({
                where: { id: contentId },
                data: {
                    status: newStatus,
                    publishedAt: publishedAt,
                },
            });
            console.log('Updated video:', {
                id: updatedVideo.id,
                status: updatedVideo.status,
                publishedAt: updatedVideo.publishedAt?.toISOString(),
            });
        } else {
            const updatedBlog = await prisma.blog.update({
                where: { id: contentId },
                data: {
                    status: newStatus,
                    publishedAt: publishedAt,
                },
            });
            console.log('Updated blog:', {
                id: updatedBlog.id,
                status: updatedBlog.status,
                publishedAt: updatedBlog.publishedAt?.toISOString(),
            });
        }

        // TODO: In the future, we can add email notifications here
        // if (feedback) {
        //     await sendNotificationToCreator({
        //         email: content.creator.user.email,
        //         name: content.creator.user.name,
        //         contentTitle: content.title,
        //         action,
        //         feedback
        //     });
        // }

        console.log(`Content ${action}d:`, {
            contentId,
            contentType,
            action,
            feedback: feedback || 'No feedback provided',
        });

        return NextResponse.json({
            success: true,
            action,
            contentType,
            contentTitle: content.title,
            creatorName: content.creator.user.name,
        });
    } catch (error) {
        console.error('Content moderation action error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
