import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const unsubscribeSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = unsubscribeSchema.parse(body);

        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: validatedData.email }
        });

        if (!subscriber) {
            return NextResponse.json({
                success: false,
                error: 'Email not found in subscriber list'
            }, { status: 404 });
        }

        if (!subscriber.isActive) {
            return NextResponse.json({
                success: true,
                message: 'Already unsubscribed from newsletter'
            });
        }

        // Mark as unsubscribed
        await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            }
        });

        logger.info('Newsletter subscriber unsubscribed', {
            email: validatedData.email,
            subscriberId: subscriber.id
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed from newsletter'
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                success: false,
                error: 'Invalid email address',
                details: error.issues
            }, { status: 400 });
        }

        logger.error('Newsletter unsubscribe error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json({
            success: false,
            error: 'Failed to unsubscribe from newsletter'
        }, { status: 500 });
    }
}

// GET route for unsubscribe via URL token (for email links)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');
        // TODO: Implement secure token validation for production

        if (!email) {
            return NextResponse.json({
                success: false,
                error: 'Email parameter required'
            }, { status: 400 });
        }

        // For now, simple email-based unsubscribe
        // In production, you'd want to use secure tokens
        const subscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: email }
        });

        if (!subscriber) {
            return NextResponse.json({
                success: false,
                error: 'Email not found in subscriber list'
            }, { status: 404 });
        }

        if (!subscriber.isActive) {
            return NextResponse.json({
                success: true,
                message: 'Already unsubscribed from newsletter'
            });
        }

        // Mark as unsubscribed
        await prisma.newsletterSubscriber.update({
            where: { id: subscriber.id },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            }
        });

        logger.info('Newsletter subscriber unsubscribed via URL', {
            email: email,
            subscriberId: subscriber.id
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully unsubscribed from newsletter'
        });

    } catch (error) {
        logger.error('Newsletter unsubscribe URL error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json({
            success: false,
            error: 'Failed to unsubscribe from newsletter'
        }, { status: 500 });
    }
}