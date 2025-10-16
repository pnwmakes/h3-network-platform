import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ScheduleStatus } from '@prisma/client';

interface ScheduleParams {
    id: string;
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<ScheduleParams> }
) {
    try {
        const { id } = await params;
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

        const body = await request.json();
        const { publishAt, notes, status } = body;

        // Find the scheduled content and verify ownership
        const scheduledContent = await prisma.scheduledContent.findFirst({
            where: {
                id,
                creatorId: user.creator.id,
            },
        });

        if (!scheduledContent) {
            return NextResponse.json(
                { error: 'Scheduled content not found' },
                { status: 404 }
            );
        }

        // Validate new publish date if provided
        if (publishAt) {
            const publishDate = new Date(publishAt);
            if (publishDate <= new Date()) {
                return NextResponse.json(
                    { error: 'Publish date must be in the future' },
                    { status: 400 }
                );
            }
        }

        // Update scheduled content
        const updatedSchedule = await prisma.scheduledContent.update({
            where: { id },
            data: {
                publishAt: publishAt ? new Date(publishAt) : undefined,
                notes: notes !== undefined ? notes : undefined,
                status: status ? (status as ScheduleStatus) : undefined,
                updatedAt: new Date(),
            },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        thumbnailUrl: true,
                        status: true,
                    },
                },
                blog: {
                    select: {
                        id: true,
                        title: true,
                        featuredImage: true,
                        status: true,
                    },
                },
            },
        });

        // Update the content's scheduledAt if publishAt changed
        if (publishAt) {
            const newPublishDate = new Date(publishAt);
            if (scheduledContent.videoId) {
                await prisma.video.update({
                    where: { id: scheduledContent.videoId },
                    data: { scheduledAt: newPublishDate },
                });
            } else if (scheduledContent.blogId) {
                await prisma.blog.update({
                    where: { id: scheduledContent.blogId },
                    data: { scheduledAt: newPublishDate },
                });
            }
        }

        return NextResponse.json({
            success: true,
            scheduledContent: updatedSchedule,
            message: 'Schedule updated successfully',
        });
    } catch (error) {
        console.error('Schedule update error:', error);
        return NextResponse.json(
            { error: 'Failed to update schedule' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<ScheduleParams> }
) {
    try {
        const { id } = await params;
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

        // Find the scheduled content and verify ownership
        const scheduledContent = await prisma.scheduledContent.findFirst({
            where: {
                id,
                creatorId: user.creator.id,
            },
        });

        if (!scheduledContent) {
            return NextResponse.json(
                { error: 'Scheduled content not found' },
                { status: 404 }
            );
        }

        // Remove the schedule
        await prisma.scheduledContent.delete({
            where: { id },
        });

        // Reset the content status back to DRAFT and remove scheduledAt
        if (scheduledContent.videoId) {
            await prisma.video.update({
                where: { id: scheduledContent.videoId },
                data: {
                    status: 'DRAFT',
                    scheduledAt: null,
                },
            });
        } else if (scheduledContent.blogId) {
            await prisma.blog.update({
                where: { id: scheduledContent.blogId },
                data: {
                    status: 'DRAFT',
                    scheduledAt: null,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Schedule cancelled successfully',
        });
    } catch (error) {
        console.error('Schedule deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel schedule' },
            { status: 500 }
        );
    }
}
