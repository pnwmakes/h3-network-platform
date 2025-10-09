import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId } = await params;

        // Users can only access their own saved content
        if (session.user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get user's saved content
        const savedContent = await prisma.savedContent.findMany({
            where: {
                userId: userId,
            },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        duration: true,
                        viewCount: true,
                        publishedAt: true,
                        creator: {
                            select: {
                                displayName: true,
                            },
                        },
                        show: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                blog: {
                    select: {
                        id: true,
                        title: true,
                        excerpt: true,
                        featuredImage: true,
                        viewCount: true,
                        publishedAt: true,
                        creator: {
                            select: {
                                displayName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                savedAt: 'desc',
            },
        });

        return NextResponse.json(savedContent);
    } catch (error) {
        console.error('Error fetching saved content:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { userId } = await params;

        // Users can only save to their own account
        if (session.user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { videoId, blogId } = await request.json();

        // Must specify either video or blog ID
        if (!videoId && !blogId) {
            return NextResponse.json(
                { error: 'Must specify videoId or blogId' },
                { status: 400 }
            );
        }

        // Can't specify both
        if (videoId && blogId) {
            return NextResponse.json(
                { error: 'Cannot specify both videoId and blogId' },
                { status: 400 }
            );
        }

        // Check if content exists
        if (videoId) {
            const video = await prisma.video.findUnique({
                where: { id: videoId, status: 'PUBLISHED' },
            });
            if (!video) {
                return NextResponse.json(
                    { error: 'Video not found' },
                    { status: 404 }
                );
            }
        }

        if (blogId) {
            const blog = await prisma.blog.findUnique({
                where: { id: blogId, status: 'PUBLISHED' },
            });
            if (!blog) {
                return NextResponse.json(
                    { error: 'Blog not found' },
                    { status: 404 }
                );
            }
        }

        // Save the content
        const savedContent = await prisma.savedContent.create({
            data: {
                userId,
                videoId: videoId || null,
                blogId: blogId || null,
            },
        });

        return NextResponse.json(savedContent, { status: 201 });
    } catch (error) {
        console.error('Error saving content:', error);

        // Handle unique constraint violation (already saved)
        if (
            error instanceof Error &&
            error.message.includes('Unique constraint')
        ) {
            return NextResponse.json(
                { error: 'Content already saved' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
