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
        const finalExcerpt = excerpt?.trim() || content.substring(0, 200) + '...';

        // Create blog
        const blog = await prisma.blog.create({
            data: {
                title: title.trim(),
                content: content.trim(),
                excerpt: finalExcerpt,
                status: ContentStatus.DRAFT, // Always DRAFT for approval workflow
                topic: (topic as ContentTopic) || ContentTopic.GENERAL,
                creatorId: user.creator.id,
                
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

        // Get all blogs for this creator
        const blogs = await prisma.blog.findMany({
            where: {
                creatorId: user.creator.id,
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
            blogs,
        });

    } catch (error) {
        console.error('Blogs fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blogs' },
            { status: 500 }
        );
    }
}