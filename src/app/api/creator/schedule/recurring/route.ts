import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ContentType, ScheduleStatus } from '@prisma/client';
import { addDays, addWeeks, addMonths } from 'date-fns';

interface RecurringConfig {
    contentIds: string[];
    startDate: Date;
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    weekdays?: number[];
    monthDay?: number;
    endType: 'never' | 'after' | 'on';
    endCount?: number;
    endDate?: Date;
    time: string;
    notes?: string;
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check if user is a creator or super admin
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { creator: true },
        });

        if (!user || !user.creator) {
            return NextResponse.json(
                { error: 'Creator profile not found' },
                { status: 404 }
            );
        }

        if (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const config: RecurringConfig = body;

        // Validation
        if (!config.contentIds || config.contentIds.length === 0) {
            return NextResponse.json(
                { error: 'At least one content item is required' },
                { status: 400 }
            );
        }

        if (!config.startDate || !config.pattern || !config.time) {
            return NextResponse.json(
                { error: 'Start date, pattern, and time are required' },
                { status: 400 }
            );
        }

        // Generate schedule dates based on pattern
        const scheduleDates = generateScheduleDates(config);

        if (scheduleDates.length === 0) {
            return NextResponse.json(
                { error: 'No valid schedule dates generated' },
                { status: 400 }
            );
        }

        const scheduledItems = [];

        // Create scheduled items for each content and date combination
        for (let i = 0; i < scheduleDates.length; i++) {
            const contentIndex = i % config.contentIds.length;
            const contentId = config.contentIds[contentIndex];
            const publishDate = scheduleDates[i];

            // Determine content type by checking both tables
            let contentType: ContentType = 'VIDEO';
            let isValid = false;

            // Check if it's a video
            const video = await prisma.video.findFirst({
                where: {
                    id: contentId,
                    creatorId: user.creator.id,
                },
            });

            if (video) {
                contentType = 'VIDEO';
                isValid = true;
            } else {
                // Check if it's a blog
                const blog = await prisma.blog.findFirst({
                    where: {
                        id: contentId,
                        creatorId: user.creator.id,
                    },
                });

                if (blog) {
                    contentType = 'BLOG';
                    isValid = true;
                }
            }

            if (!isValid) {
                continue; // Skip invalid content
            }

            // Create scheduled content entry
            const scheduledContent = await prisma.scheduledContent.create({
                data: {
                    contentType,
                    videoId: contentType === 'VIDEO' ? contentId : null,
                    blogId: contentType === 'BLOG' ? contentId : null,
                    publishAt: publishDate,
                    creatorId: user.creator.id,
                    notes: config.notes
                        ? `${config.notes} (Recurring ${config.pattern})`
                        : `Recurring ${config.pattern}`,
                    status: ScheduleStatus.PENDING,
                },
            });

            scheduledItems.push(scheduledContent);

            // Update the content's status and scheduledAt
            if (contentType === 'VIDEO') {
                await prisma.video.update({
                    where: { id: contentId },
                    data: {
                        status: 'SCHEDULED',
                        scheduledAt: publishDate,
                    },
                });
            } else {
                await prisma.blog.update({
                    where: { id: contentId },
                    data: {
                        status: 'SCHEDULED',
                        scheduledAt: publishDate,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            scheduledItems: scheduledItems.length,
            message: `Successfully created ${scheduledItems.length} recurring schedules`,
        });
    } catch (error) {
        console.error('Recurring schedule error:', error);
        return NextResponse.json(
            { error: 'Failed to create recurring schedule' },
            { status: 500 }
        );
    }
}

function generateScheduleDates(config: RecurringConfig): Date[] {
    const dates: Date[] = [];
    const startDate = new Date(config.startDate);
    const [hours, minutes] = config.time.split(':').map(Number);

    // Set the time on start date
    startDate.setHours(hours, minutes, 0, 0);

    let currentDate = new Date(startDate);
    let count = 0;
    const maxIterations = 1000; // Prevent infinite loops

    while (count < maxIterations) {
        let shouldAdd = false;

        if (config.pattern === 'daily') {
            shouldAdd = true;
        } else if (config.pattern === 'weekly') {
            if (
                config.weekdays &&
                config.weekdays.includes(currentDate.getDay())
            ) {
                shouldAdd = true;
            }
        } else if (config.pattern === 'monthly') {
            if (!config.monthDay || currentDate.getDate() === config.monthDay) {
                shouldAdd = true;
            }
        }

        if (shouldAdd) {
            // Check end conditions
            if (
                config.endType === 'on' &&
                config.endDate &&
                currentDate > config.endDate
            ) {
                break;
            }
            if (
                config.endType === 'after' &&
                dates.length >= (config.endCount || 10)
            ) {
                break;
            }

            dates.push(new Date(currentDate));
        }

        // Advance to next occurrence
        if (config.pattern === 'daily') {
            currentDate = addDays(currentDate, config.interval);
        } else if (config.pattern === 'weekly') {
            // For weekly, we need to advance by days and check weekdays
            currentDate = addDays(currentDate, 1);

            // If we've gone through all weekdays in this week, advance to next interval
            if (
                config.weekdays &&
                currentDate.getDay() === 0 &&
                dates.length > 0
            ) {
                currentDate = addWeeks(currentDate, config.interval - 1);
            }
        } else if (config.pattern === 'monthly') {
            currentDate = addMonths(currentDate, config.interval);
            if (config.monthDay) {
                currentDate.setDate(config.monthDay);
            }
        }

        count++;
    }

    return dates;
}
