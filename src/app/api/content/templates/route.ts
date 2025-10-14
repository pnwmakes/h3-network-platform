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

        // Check if user is a creator
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

        const body = await request.json();
        const {
            type,
            title,
            description,
            showName,
            seasonNumber,
            episodeNumber,
            contentTopics,
            guestNames,
            guestBios,
            sponsorNames,
            sponsorMessages,
        } = body;

        if (type === 'VIDEO') {
            // Create video from template
            const video = await prisma.video.create({
                data: {
                    title,
                    description,
                    youtubeId: '', // Will be filled when YouTube video is uploaded
                    youtubeUrl: '', // Will be filled when YouTube video is uploaded
                    status: ContentStatus.DRAFT,
                    topic: ContentTopic.GENERAL,
                    creatorId: user.creator.id,
                    // Template fields
                    showName,
                    seasonNumber,
                    episodeNumber,
                    guestNames: guestNames || [],
                    guestBios: guestBios || [],
                    sponsorNames: sponsorNames || [],
                    sponsorMessages: sponsorMessages || [],
                    contentTopics: contentTopics || [],
                },
            });

            return NextResponse.json({
                success: true,
                content: video,
                type: 'video',
            });
        } else if (type === 'BLOG') {
            // Create blog from template
            const blog = await prisma.blog.create({
                data: {
                    title,
                    content: description || '', // Use description as initial content
                    excerpt: description?.substring(0, 200) || '',
                    status: ContentStatus.DRAFT,
                    topic: ContentTopic.GENERAL,
                    creatorId: user.creator.id,
                    // Template fields
                    guestContributors: guestNames || [],
                    guestBios: guestBios || [],
                    sponsorNames: sponsorNames || [],
                    sponsorMessages: sponsorMessages || [],
                    contentTopics: contentTopics || [],
                },
            });

            return NextResponse.json({
                success: true,
                content: blog,
                type: 'blog',
            });
        } else {
            return NextResponse.json(
                { error: 'Invalid content type' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Template creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
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

        // Get saved templates for the creator
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

        // Get recent content that can serve as templates
        const videos = await prisma.video.findMany({
            where: { creatorId: user.creator.id },
            select: {
                id: true,
                title: true,
                description: true,
                showName: true,
                seasonNumber: true,
                episodeNumber: true,
                contentTopics: true,
                guestNames: true,
                guestBios: true,
                sponsorNames: true,
                sponsorMessages: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        const blogs = await prisma.blog.findMany({
            where: { creatorId: user.creator.id },
            select: {
                id: true,
                title: true,
                content: true,
                excerpt: true,
                contentTopics: true,
                guestContributors: true,
                guestBios: true,
                sponsorNames: true,
                sponsorMessages: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });

        return NextResponse.json({
            success: true,
            templates: {
                videos,
                blogs,
            },
        });
    } catch (error) {
        console.error('Template fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
