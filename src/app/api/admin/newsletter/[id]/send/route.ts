import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { emailService } from '@/lib/email-service';

// POST /api/admin/newsletter/[id]/send - Send newsletter
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: newsletterId } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Authentication required',
                },
                { status: 401 }
            );
        }

        // Check if user is admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true },
        });

        if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Admin access required',
                },
                { status: 403 }
            );
        }

        // Get newsletter
        const newsletter = await prisma.newsletter.findUnique({
            where: { id: newsletterId },
            include: {
                sends: {
                    select: { id: true },
                },
            },
        });

        if (!newsletter) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Newsletter not found',
                },
                { status: 404 }
            );
        }

        // Check if already sent
        if (newsletter.status === 'SENT' || newsletter.sentAt) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Newsletter already sent',
                },
                { status: 400 }
            );
        }

        // Check if newsletter is ready to send
        if (newsletter.status === 'SENDING') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Newsletter is currently being sent',
                },
                { status: 400 }
            );
        }

        // Send newsletter campaign using email service
        const result = await emailService.sendNewsletterCampaign(newsletterId);

        if (!result.success && result.sentCount === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Failed to send newsletter to any recipients',
                },
                { status: 500 }
            );
        }

        // Get updated newsletter data
        const updatedNewsletter = await prisma.newsletter.findUnique({
            where: { id: newsletterId },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        sends: true,
                    },
                },
            },
        });

        logger.info('Newsletter campaign completed', {
            userId: session.user.id,
            newsletterId: newsletter.id,
            totalSubscribers: result.totalSubscribers.toString(),
            sentCount: result.sentCount.toString(),
            failedCount: result.failedCount.toString(),
            type: newsletter.type,
            title: newsletter.title,
        });

        return NextResponse.json({
            success: true,
            message: `Newsletter sent to ${result.sentCount} of ${
                result.totalSubscribers
            } subscribers${
                result.failedCount > 0 ? ` (${result.failedCount} failed)` : ''
            }`,
            newsletter: updatedNewsletter,
            recipientCount: result.sentCount,
            totalSubscribers: result.totalSubscribers,
            failedCount: result.failedCount,
        });
    } catch (error) {
        // If there was an error, update newsletter status to FAILED
        try {
            const { id: newsletterId } = await params;
            await prisma.newsletter.update({
                where: { id: newsletterId },
                data: { status: 'FAILED' },
            });
        } catch {
            // Ignore update errors
        }

        logger.error('Newsletter send error', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to send newsletter',
            },
            { status: 500 }
        );
    }
}
