import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ contentId: string; type: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { contentId, type } = await params;

        if (!['video', 'blog'].includes(type)) {
            return NextResponse.json(
                { error: 'Invalid content type' },
                { status: 400 }
            );
        }

        // Check if content exists and get creator info
        let content;
        if (type === 'video') {
            content = await prisma.video.findUnique({
                where: { id: contentId },
                include: {
                    creator: {
                        select: { id: true },
                    },
                },
            });
        } else {
            content = await prisma.blog.findUnique({
                where: { id: contentId },
                include: {
                    creator: {
                        select: { id: true },
                    },
                },
            });
        }

        if (!content) {
            return NextResponse.json(
                { error: 'Content not found' },
                { status: 404 }
            );
        }

        // Check permissions: creator can delete own content, super admin can delete any content
        const isCreator = session.user.id === content.creator.id;
        const isSuperAdmin = session.user.role === 'SUPER_ADMIN';

        if (!isCreator && !isSuperAdmin) {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // Delete the content
        if (type === 'video') {
            await prisma.video.delete({
                where: { id: contentId },
            });
        } else {
            await prisma.blog.delete({
                where: { id: contentId },
            });
        }

        return NextResponse.json({
            success: true,
            message: `${
                type.charAt(0).toUpperCase() + type.slice(1)
            } deleted successfully`,
            contentId,
            type,
        });
    } catch (error) {
        console.error('Content delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete content' },
            { status: 500 }
        );
    }
}
