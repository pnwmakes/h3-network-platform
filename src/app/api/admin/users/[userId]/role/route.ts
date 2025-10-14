import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
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

        const { role } = await request.json();
        const { userId } = await params;

        // Validate role
        if (!Object.values(UserRole).includes(role)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid role',
                },
                { status: 400 }
            );
        }

        // Prevent admin from changing their own role
        if (userId === session.user.id && role !== session.user.role) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Cannot change your own role',
                },
                { status: 400 }
            );
        }

        // Update user role
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        isActive: true,
                    },
                },
            },
        });

        return NextResponse.json({
            success: true,
            message: 'User role updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error('User role update error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update user role',
            },
            { status: 500 }
        );
    }
}
