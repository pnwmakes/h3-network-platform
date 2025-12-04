import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ creatorId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized - Please sign in to follow creators' },
                { status: 401 }
            );
        }

        const { creatorId } = await params;

        // Check if creator exists
        const creator = await prisma.creator.findUnique({
            where: { id: creatorId },
        });

        if (!creator) {
            return NextResponse.json(
                { error: 'Creator not found' },
                { status: 404 }
            );
        }

        // Check if already following
        const existingFollow = await prisma.creatorFollower.findUnique({
            where: {
                userId_creatorId: {
                    userId: session.user.id,
                    creatorId,
                },
            },
        });

        if (existingFollow) {
            return NextResponse.json(
                { error: 'Already following this creator' },
                { status: 400 }
            );
        }

        // Create follow
        await prisma.creatorFollower.create({
            data: {
                userId: session.user.id,
                creatorId,
            },
        });

        // Get updated follower count
        const followerCount = await prisma.creatorFollower.count({
            where: { creatorId },
        });

        return NextResponse.json({
            success: true,
            following: true,
            followerCount,
        });
    } catch (error) {
        console.error('Follow creator error:', error);
        return NextResponse.json(
            { error: 'Failed to follow creator' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ creatorId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { creatorId } = await params;

        // Delete follow
        await prisma.creatorFollower.delete({
            where: {
                userId_creatorId: {
                    userId: session.user.id,
                    creatorId,
                },
            },
        });

        // Get updated follower count
        const followerCount = await prisma.creatorFollower.count({
            where: { creatorId },
        });

        return NextResponse.json({
            success: true,
            following: false,
            followerCount,
        });
    } catch (error) {
        console.error('Unfollow creator error:', error);
        return NextResponse.json(
            { error: 'Failed to unfollow creator' },
            { status: 500 }
        );
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ creatorId: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { creatorId } = await params;

        const followerCount = await prisma.creatorFollower.count({
            where: { creatorId },
        });

        let isFollowing = false;
        if (session?.user?.id) {
            const follow = await prisma.creatorFollower.findUnique({
                where: {
                    userId_creatorId: {
                        userId: session.user.id,
                        creatorId,
                    },
                },
            });
            isFollowing = !!follow;
        }

        return NextResponse.json({
            followerCount,
            isFollowing,
        });
    } catch (error) {
        console.error('Get follow status error:', error);
        return NextResponse.json(
            { error: 'Failed to get follow status' },
            { status: 500 }
        );
    }
}
