import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (
            !session?.user ||
            (session.user.role !== 'CREATOR' &&
                session.user.role !== 'SUPER_ADMIN')
        ) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { action, contentIds, contentType, data } = await request.json();

        if (!action || !contentIds || !Array.isArray(contentIds)) {
            return NextResponse.json(
                { error: 'Invalid request data' },
                { status: 400 }
            );
        }

        let result;

        switch (action) {
            case 'publish':
                if (contentType === 'video') {
                    result = await prisma.video.updateMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                        data: { status: 'PUBLISHED', publishedAt: new Date() },
                    });
                } else if (contentType === 'blog') {
                    result = await prisma.blog.updateMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                        data: { status: 'PUBLISHED', publishedAt: new Date() },
                    });
                }
                break;

            case 'unpublish':
                if (contentType === 'video') {
                    result = await prisma.video.updateMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                        data: { status: 'DRAFT' },
                    });
                } else if (contentType === 'blog') {
                    result = await prisma.blog.updateMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                        data: { status: 'DRAFT' },
                    });
                }
                break;

            case 'archive':
                if (contentType === 'video') {
                    result = await prisma.video.updateMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                        data: { status: 'ARCHIVED' },
                    });
                } else if (contentType === 'blog') {
                    result = await prisma.blog.updateMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                        data: { status: 'ARCHIVED' },
                    });
                }
                break;

            case 'delete':
                if (contentType === 'video') {
                    result = await prisma.video.deleteMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                    });
                } else if (contentType === 'blog') {
                    result = await prisma.blog.deleteMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                    });
                }
                break;

            case 'bulk-edit':
                if (!data) {
                    return NextResponse.json(
                        { error: 'Bulk edit data required' },
                        { status: 400 }
                    );
                }

                if (contentType === 'video') {
                    result = await prisma.video.updateMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                        data: {
                            ...(data.tags && { tags: data.tags }),
                            ...(data.category && { category: data.category }),
                            ...(data.featured !== undefined && {
                                featured: data.featured,
                            }),
                        },
                    });
                } else if (contentType === 'blog') {
                    result = await prisma.blog.updateMany({
                        where: {
                            id: { in: contentIds },
                            creatorId:
                                session.user.role === 'SUPER_ADMIN'
                                    ? undefined
                                    : session.user.id,
                        },
                        data: {
                            ...(data.tags && { tags: data.tags }),
                            ...(data.category && { category: data.category }),
                            ...(data.featured !== undefined && {
                                featured: data.featured,
                            }),
                        },
                    });
                }
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid action' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            message: `Successfully ${action}ed ${result?.count || 0} items`,
            count: result?.count || 0,
        });
    } catch (error) {
        console.error('Bulk operation error:', error);
        return NextResponse.json(
            { error: 'Failed to perform bulk operation' },
            { status: 500 }
        );
    }
}
