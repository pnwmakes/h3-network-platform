import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentStatus, ContentTopic } from '@prisma/client';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if user is a creator or super admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { creator: true },
        });

        if (!user || (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Get the video
        const video = await prisma.video.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                    },
                },
            },
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Check ownership (creators can only edit their own content, super admins can edit any)
        if (user.role === 'CREATOR' && video.creator.id !== user.creator?.id) {
            return NextResponse.json(
                { error: 'You can only edit your own content' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            video,
        });
    } catch (error) {
        console.error('Video fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch video' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if user is a creator or super admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { creator: true },
        });

        if (!user || (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Get the video to check ownership
        const existingVideo = await prisma.video.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true },
                },
            },
        });

        if (!existingVideo) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Check ownership (creators can only edit their own content, super admins can edit any)
        if (user.role === 'CREATOR' && existingVideo.creator.id !== user.creator?.id) {
            return NextResponse.json(
                { error: 'You can only edit your own content' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            youtubeUrl,
            youtubeId,
            topic,
            showName,
            seasonNumber,
            episodeNumber,
            tags,
            contentTopics,
            guestNames,
            guestBios,
            sponsorNames,
            sponsorMessages,
            thumbnailUrl,
        } = body;

        // Validation
        if (!title?.trim()) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        if (!youtubeUrl?.trim() || !youtubeId?.trim()) {
            return NextResponse.json(
                { error: 'Valid YouTube URL is required' },
                { status: 400 }
            );
        }

        // Check if another video with this YouTube ID exists
        if (youtubeId !== existingVideo.youtubeId) {
            const duplicateVideo = await prisma.video.findFirst({
                where: { 
                    youtubeId,
                    id: { not: id }
                },
            });

            if (duplicateVideo) {
                return NextResponse.json(
                    { error: 'A video with this YouTube URL already exists' },
                    { status: 409 }
                );
            }
        }

        // Generate thumbnail URL from YouTube if not provided
        const finalThumbnailUrl =
            thumbnailUrl ||
            `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

        // Update video - if published content is edited, it goes back to DRAFT for re-approval
        const newStatus = existingVideo.status === 'PUBLISHED' ? 'DRAFT' : existingVideo.status;

        const updatedVideo = await prisma.video.update({
            where: { id },
            data: {
                title: title.trim(),
                description: description?.trim() || '',
                youtubeId,
                youtubeUrl,
                thumbnailUrl: finalThumbnailUrl,
                topic: (topic as ContentTopic) || ContentTopic.GENERAL,
                status: newStatus as ContentStatus,

                // Show information
                showName: showName?.trim() || '',
                seasonNumber: seasonNumber || null,
                episodeNumber: episodeNumber || null,

                // Content metadata
                tags: tags || [],
                contentTopics: contentTopics || [],
                guestNames: guestNames || [],
                guestBios: guestBios || [],
                sponsorNames: sponsorNames || [],
                sponsorMessages: sponsorMessages || [],

                updatedAt: new Date(),
            },
            include: {
                creator: {
                    select: {
                        displayName: true,
                        user: {
                            select: { name: true, email: true },
                        },
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            video: updatedVideo,
            message: existingVideo.status === 'PUBLISHED' 
                ? 'Video updated and resubmitted for approval'
                : 'Video updated successfully',
        });
    } catch (error) {
        console.error('Video update error:', error);
        return NextResponse.json(
            { error: 'Failed to update video' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if user is a creator or super admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { creator: true },
        });

        if (!user || (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN')) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Get the video to check ownership
        const video = await prisma.video.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true },
                },
            },
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        // Check ownership (creators can only delete their own content, super admins can delete any)
        if (user.role === 'CREATOR' && video.creator.id !== user.creator?.id) {
            return NextResponse.json(
                { error: 'You can only delete your own content' },
                { status: 403 }
            );
        }

        // Delete the video
        await prisma.video.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Video deleted successfully',
        });
    } catch (error) {
        console.error('Video delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete video' },
            { status: 500 }
        );
    }
}