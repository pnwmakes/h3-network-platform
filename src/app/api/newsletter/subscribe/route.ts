import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const subscribeSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    preferences: z.object({
        specialEvents: z.boolean().optional().default(true),
        majorUpdates: z.boolean().optional().default(true),
        monthlyNewsletter: z.boolean().optional().default(true),
        newContentNotify: z.boolean().optional().default(false),
    }).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = subscribeSchema.parse(body);

        // Check if subscriber already exists
        const existingSubscriber = await prisma.newsletterSubscriber.findUnique({
            where: { email: validatedData.email },
            include: { preferences: true }
        });

        if (existingSubscriber) {
            // Reactivate if unsubscribed
            if (!existingSubscriber.isActive) {
                const updatedSubscriber = await prisma.newsletterSubscriber.update({
                    where: { id: existingSubscriber.id },
                    data: {
                        isActive: true,
                        unsubscribedAt: null,
                        name: validatedData.name || existingSubscriber.name,
                        preferences: validatedData.preferences ? {
                            upsert: {
                                create: validatedData.preferences,
                                update: validatedData.preferences,
                            }
                        } : undefined
                    },
                    include: { preferences: true }
                });

                logger.info('Newsletter subscriber reactivated', {
                    email: validatedData.email,
                    subscriberId: updatedSubscriber.id
                });

                return NextResponse.json({
                    success: true,
                    message: 'Successfully resubscribed to newsletter!',
                    subscriber: updatedSubscriber
                });
            }

            return NextResponse.json({
                success: true,
                message: 'Already subscribed to newsletter!',
                subscriber: existingSubscriber
            });
        }

        // Create new subscriber
        const newSubscriber = await prisma.newsletterSubscriber.create({
            data: {
                email: validatedData.email,
                name: validatedData.name,
                preferences: validatedData.preferences ? {
                    create: validatedData.preferences
                } : {
                    create: {
                        specialEvents: true,
                        majorUpdates: true,
                        monthlyNewsletter: true,
                        newContentNotify: false,
                    }
                }
            },
            include: { preferences: true }
        });

        logger.info('New newsletter subscriber created', {
            email: validatedData.email,
            subscriberId: newSubscriber.id,
            hasPreferences: !!newSubscriber.preferences
        });

        return NextResponse.json({
            success: true,
            message: 'Successfully subscribed to newsletter!',
            subscriber: newSubscriber
        }, { status: 201 });

    } catch (error) {
        if (error instanceof z.ZodError) {
            logger.warn('Newsletter subscription validation error', {
                errorCount: error.issues.length
            });
            
            return NextResponse.json({
                success: false,
                error: 'Invalid subscription data',
                details: error.issues
            }, { status: 400 });
        }

        logger.error('Newsletter subscription error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json({
            success: false,
            error: 'Failed to subscribe to newsletter'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const stats = await prisma.newsletterSubscriber.aggregate({
            _count: {
                id: true
            },
            where: {
                isActive: true
            }
        });

        return NextResponse.json({
            success: true,
            activeSubscribers: stats._count.id
        });
    } catch (error) {
        logger.error('Newsletter stats error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        });

        return NextResponse.json({
            success: false,
            error: 'Failed to get newsletter stats'
        }, { status: 500 });
    }
}