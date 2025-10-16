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
            content,
            excerpt,
            topic,
            tags,
            contentTopics,
            readTime,
            featuredImage,
        } = body;

        // Validation
        if (!title?.trim()) {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        if (!content?.trim()) {
            return NextResponse.json(
                { error: 'Content is required' },
                { status: 400 }
            );
        }

        // Generate excerpt if not provided
        const finalExcerpt =
            excerpt?.trim() || content.substring(0, 200) + '...';

        // Create blog
        const blog = await prisma.blog.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                excerpt: finalExcerpt,
                status: ContentStatus.DRAFT, // Always DRAFT for approval workflow
                topic: (topic as ContentTopic) || ContentTopic.GENERAL,
                creatorId: creatorProfile!.id,

                // Content metadata
                tags: tags || [],
                contentTopics: contentTopics || [],
                readTime: readTime || 5,
                featuredImage: featuredImage || null,

                // Default values
                viewCount: 0,
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
            blog,
            message: 'Blog created successfully and submitted for approval',
        });
    } catch (error) {
        console.error('Blog creation error:', error);
        return NextResponse.json(
            { error: 'Failed to create blog' },
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
                blogs: [],
            });
        }

        // Get all blogs for this creator
        const blogs = await prisma.blog.findMany({
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

        const response = NextResponse.json({
            success: true,
            blogs,
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
        console.error('Blogs fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}
