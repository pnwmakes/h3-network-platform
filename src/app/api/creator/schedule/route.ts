import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentType, ScheduleStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
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

        const body = await request.json();
        const { contentType, contentId, publishAt, notes } = body;

        // Validation
        if (!contentType || !contentId || !publishAt) {
            return NextResponse.json(
                {
                    error: 'Content type, content ID, and publish date are required',
                },
                { status: 400 }
            );
        }

        const publishDate = new Date(publishAt);
        if (publishDate <= new Date()) {
            return NextResponse.json(
                { error: 'Publish date must be in the future' },
                { status: 400 }
            );
        }

        // Verify content exists and belongs to this creator
        let content;
        if (contentType === 'VIDEO') {
            content = await prisma.video.findFirst({
                where: {
                    id: contentId,
                    creatorId: user.creator.id,
                },
            });
        } else if (contentType === 'BLOG') {
            content = await prisma.blog.findFirst({
                where: {
                    id: contentId,
                    creatorId: user.creator.id,
                },
            });
        }

        if (!content) {
            return NextResponse.json(
                { error: 'Content not found or access denied' },
                { status: 404 }
            );
        }

        // Check if content is already scheduled
        const existingSchedule = await prisma.scheduledContent.findFirst({
            where: {
                OR: [
                    {
                        videoId:
                            contentType === 'VIDEO' ? contentId : undefined,
                    },
                    { blogId: contentType === 'BLOG' ? contentId : undefined },
                ],
            },
        });

        if (existingSchedule) {
            return NextResponse.json(
                { error: 'Content is already scheduled' },
                { status: 409 }
            );
        }

        // Create scheduled content entry
        const scheduledContent = await prisma.scheduledContent.create({
            data: {
                contentType: contentType as ContentType,
                videoId: contentType === 'VIDEO' ? contentId : null,
                blogId: contentType === 'BLOG' ? contentId : null,
                publishAt: publishDate,
                creatorId: user.creator.id,
                notes: notes || null,
                status: ScheduleStatus.PENDING,
            },
            include: {
                video:
                    contentType === 'VIDEO'
                        ? {
                              select: {
                                  title: true,
                                  thumbnailUrl: true,
                              },
                          }
                        : undefined,
                blog:
                    contentType === 'BLOG'
                        ? {
                              select: {
                                  title: true,
                                  featuredImage: true,
                              },
                          }
                        : undefined,
            },
        });

        // Update the content's status and scheduledAt
        if (contentType === 'VIDEO') {
            await prisma.video.update({
                where: { id: contentId },
                data: {
                    status: 'SCHEDULED',
                    scheduledAt: publishDate,
                },
            });
        } else {
            await prisma.blog.update({
                where: { id: contentId },
                data: {
                    status: 'SCHEDULED',
                    scheduledAt: publishDate,
                },
            });
        }

        return NextResponse.json({
            success: true,
            scheduledContent,
            message: 'Content scheduled successfully',
        });
    } catch (error) {
        console.error('Content scheduling error:', error);
        return NextResponse.json(
            { error: 'Failed to schedule content' },
            { status: 500 }
        );
    }
}

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

        // Get all scheduled content for this creator
        const scheduledContent = await prisma.scheduledContent.findMany({
            where: {
                creatorId: user.creator.id,
                status: {
                    in: ['PENDING', 'FAILED'], // Only show pending and failed schedules
                },
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
            orderBy: {
                publishAt: 'asc',
            },
        });

        const response = NextResponse.json({
            success: true,
            scheduledContent,
        });

        // Prevent caching to ensure fresh data
        response.headers.set(
            'Cache-Control',
            'no-store, no-cache, must-revalidate, proxy-revalidate'
        );
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');

        return response;
    } catch (error) {
        console.error('Scheduled content fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch scheduled content' },
            { status: 500 }
        );
    }
}
