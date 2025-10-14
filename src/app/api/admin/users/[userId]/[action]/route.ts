import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string; action: string }> }
) {
    const resolvedParams = await params;
    const { userId, action } = resolvedParams;

    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        // Prevent admin from deactivating themselves
        if (userId === session.user.id && action === 'deactivate') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Cannot deactivate your own account',
                },
                { status: 400 }
            );
        }

        let result;

        switch (action) {
            case 'activate':
                result = await prisma.creator.update({
                    where: { userId },
                    data: { isActive: true },
                });
                break;

            case 'deactivate':
                result = await prisma.creator.update({
                    where: { userId },
                    data: { isActive: false },
                });
                break;

            default:
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Invalid action',
                    },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            message: `User ${action}d successfully`,
            creator: result,
        });
    } catch (error) {
        console.error(`User ${action} error:`, error);
        return NextResponse.json(
            {
                success: false,
                error: `Failed to ${action} user`,
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string; action: string }> }
) {
    const resolvedParams = await params;
    const { userId, action } = resolvedParams;

    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        if (action !== 'delete') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid action for DELETE method',
                },
                { status: 400 }
            );
        }

        // Prevent admin from deleting themselves
        if (userId === session.user.id) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Cannot delete your own account',
                },
                { status: 400 }
            );
        }

        // Delete user (cascade will handle related records)
        await prisma.user.delete({
            where: { id: userId },
        });

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        console.error('User delete error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to delete user',
            },
            { status: 500 }
        );
    }
}
