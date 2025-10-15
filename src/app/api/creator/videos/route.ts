import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentStatus, ContentTopic } from '@prisma/client';

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

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Allow both CREATOR role users and SUPER_ADMIN users
        if (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // For SUPER_ADMINs without creator profiles, create a basic creator profile
        let creatorProfile = user.creator;
        if (user.role === 'SUPER_ADMIN' && !user.creator) {
            creatorProfile = await prisma.creator.create({
                data: {
                    userId: user.id,
                    displayName:
                        user.name || user.email?.split('@')[0] || 'Admin',
                    bio: 'H3 Network Admin and Content Creator',
                    isActive: true,
                    profileComplete: true,
                },
            });
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
            status = 'DRAFT', // Default to DRAFT for approval workflow
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

        // Check if video with this YouTube ID already exists
        const existingVideo = await prisma.video.findUnique({
            where: { youtubeId },
        });

        if (existingVideo) {
            return NextResponse.json(
                { error: 'A video with this YouTube URL already exists' },
                { status: 409 }
            );
        }

        // Generate thumbnail URL from YouTube if not provided
        const finalThumbnailUrl =
            thumbnailUrl ||
            `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

        // Create video
        const video = await prisma.video.create({
            data: {
                title: title.trim(),
                description: description?.trim() || '',
                youtubeId,
                youtubeUrl,
                thumbnailUrl: finalThumbnailUrl,
                status: status as ContentStatus,
                topic: (topic as ContentTopic) || ContentTopic.GENERAL,
                creatorId: creatorProfile!.id,

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

                // Default values
                viewCount: 0,
                duration: null, // Could be fetched from YouTube API in the future
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
            video,
            message: 'Video created successfully and submitted for approval',
        });
    } catch (error) {
        console.error('Video creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create video' },
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

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Allow both CREATOR role users and SUPER_ADMIN users
        if (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // If SUPER_ADMIN doesn't have a creator profile, return empty array
        if (user.role === 'SUPER_ADMIN' && !user.creator) {
            return NextResponse.json({
                success: true,
                videos: [],
            });
        }

        // Get all videos for this creator
        const videos = await prisma.video.findMany({
            where: {
                creatorId: user.creator!.id,
            },
            orderBy: { createdAt: 'desc' },
            include: {
                creator: {
                    select: {
                        displayName: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            videos,
        });
    } catch (error) {
        console.error('Videos fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch videos' },
            { status: 500 }
        );
    }
}
