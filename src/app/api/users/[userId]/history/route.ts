import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
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

        // Users can only access their own history
        if (session.user.id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Get user's viewing history
        const history = await prisma.userProgress.findMany({
            where: {
                userId: userId,
                contentType: 'VIDEO',
            },
            include: {
                video: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        thumbnailUrl: true,
                        duration: true,
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
            },
            orderBy: {
                lastWatched: 'desc',
            },
        });

        // Filter out any entries where video might be null (defensive programming)
        const validHistory = history.filter((item) => item.video !== null);

        return NextResponse.json(validHistory);
    } catch (error) {
        console.error('Error fetching viewing history:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
