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

        // Get the blog
        const blog = await prisma.blog.findUnique({
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

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // Check ownership (creators can only edit their own content, super admins can edit any)
        if (user.role === 'CREATOR' && blog.creator.id !== user.creator?.id) {
            return NextResponse.json(
                { error: 'You can only edit your own content' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            blog,
        });
    } catch (error) {
        console.error('Blog fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog' },
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

        // Get the blog to check ownership
        const existingBlog = await prisma.blog.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true },
                },
            },
        });

        if (!existingBlog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // Check ownership (creators can only edit their own content, super admins can edit any)
        if (
            user.role === 'CREATOR' &&
            existingBlog.creator.id !== user.creator?.id
        ) {
            return NextResponse.json(
                { error: 'You can only edit your own content' },
                { status: 403 }
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
        const finalExcerpt =
            excerpt?.trim() || content.substring(0, 200) + '...';

        // For published content that gets edited, revert to DRAFT for re-approval
        // For DRAFT content, keep as DRAFT
        const newStatus =
            existingBlog.status === 'PUBLISHED' ? 'DRAFT' : existingBlog.status;

        // Keep the existing status when updating (don't revert published content to draft)
        const updatedBlog = await prisma.blog.update({
            where: { id },
            data: {
                title: title.trim(),
                content: content.trim(),
                excerpt: finalExcerpt,
                topic: (topic as ContentTopic) || ContentTopic.GENERAL,
                status: newStatus as ContentStatus,

                // Content metadata
                tags: tags || [],
                contentTopics: contentTopics || [],
                readTime: readTime || 5,
                featuredImage: featuredImage || null,

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
            blog: updatedBlog,
            message:
                existingBlog.status === 'PUBLISHED'
                    ? 'Blog updated and resubmitted for approval'
                    : 'Blog updated successfully',
        });
    } catch (error) {
        console.error('Blog update error:', error);
        return NextResponse.json(
            { error: 'Failed to update blog' },
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

        // Get the blog to check ownership
        const blog = await prisma.blog.findUnique({
            where: { id },
            include: {
                creator: {
                    select: { id: true },
                },
            },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        // Check ownership (creators can only delete their own content, super admins can delete any)
        if (user.role === 'CREATOR' && blog.creator.id !== user.creator?.id) {
            return NextResponse.json(
                { error: 'You can only delete your own content' },
                { status: 403 }
            );
        }

        // Delete the blog
        await prisma.blog.delete({
            where: { id },
        });

        return NextResponse.json({
            success: true,
            message: 'Blog deleted successfully',
        });
    } catch (error) {
        console.error('Blog delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete blog' },
            { status: 500 }
        );
    }
}
