import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const createNewsletterSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    subject: z
        .string()
        .min(1, 'Subject is required')
        .max(200, 'Subject too long'),
    content: z.string().min(1, 'Content is required'),
    type: z.enum([
        'SPECIAL_EVENT',
        'MAJOR_UPDATE',
        'MONTHLY_SUMMARY',
        'NEW_CONTENT',
    ]),
    scheduledAt: z.string().datetime().optional(),
});

const updateNewsletterSchema = createNewsletterSchema.partial().extend({
    status: z
        .enum(['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED', 'CANCELLED'])
        .optional(),
});

// GET /api/admin/newsletter - List newsletters
export async function GET(request: NextRequest) {
    try {
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

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(
            parseInt(searchParams.get('limit') || '20'),
            100
        );
        const status = searchParams.get('status');
        const type = searchParams.get('type');

        const offset = (page - 1) * limit;

        const whereClause: {
            status?:
                | 'DRAFT'
                | 'SCHEDULED'
                | 'SENDING'
                | 'SENT'
                | 'FAILED'
                | 'CANCELLED';
            type?:
                | 'SPECIAL_EVENT'
                | 'MAJOR_UPDATE'
                | 'MONTHLY_SUMMARY'
                | 'NEW_CONTENT';
        } = {};
        if (
            status &&
            [
                'DRAFT',
                'SCHEDULED',
                'SENDING',
                'SENT',
                'FAILED',
                'CANCELLED',
            ].includes(status)
        ) {
            whereClause.status = status as
                | 'DRAFT'
                | 'SCHEDULED'
                | 'SENDING'
                | 'SENT'
                | 'FAILED'
                | 'CANCELLED';
        }
        if (
            type &&
            [
                'SPECIAL_EVENT',
                'MAJOR_UPDATE',
                'MONTHLY_SUMMARY',
                'NEW_CONTENT',
            ].includes(type)
        ) {
            whereClause.type = type as
                | 'SPECIAL_EVENT'
                | 'MAJOR_UPDATE'
                | 'MONTHLY_SUMMARY'
                | 'NEW_CONTENT';
        }

        const [newsletters, totalCount] = await Promise.all([
            prisma.newsletter.findMany({
                where: whereClause,
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
                orderBy: {
                    createdAt: 'desc',
                },
                skip: offset,
                take: limit,
            }),
            prisma.newsletter.count({ where: whereClause }),
        ]);

        logger.info('Admin newsletters retrieved', {
            userId: session.user.id,
            count: newsletters.length,
            page,
            totalCount,
        });

        return NextResponse.json({
            success: true,
            newsletters,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
            },
        });
    } catch (error) {
        logger.error('Admin newsletter list error', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to retrieve newsletters',
            },
            { status: 500 }
        );
    }
}

// POST /api/admin/newsletter - Create newsletter
export async function POST(request: NextRequest) {
    try {
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

        const body = await request.json();
        const validatedData = createNewsletterSchema.parse(body);

        const newsletter = await prisma.newsletter.create({
            data: {
                title: validatedData.title,
                subject: validatedData.subject,
                content: validatedData.content,
                type: validatedData.type,
                status: 'DRAFT',
                scheduledAt: validatedData.scheduledAt
                    ? new Date(validatedData.scheduledAt)
                    : null,
                createdById: session.user.id,
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        logger.info('Newsletter created', {
            userId: session.user.id,
            newsletterId: newsletter.id,
            type: newsletter.type,
            title: newsletter.title,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Newsletter created successfully',
                newsletter,
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid newsletter data',
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        logger.error('Newsletter creation error', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to create newsletter',
            },
            { status: 500 }
        );
    }
}

// PUT /api/admin/newsletter - Update newsletter
export async function PUT(request: NextRequest) {
    try {
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

        const { searchParams } = new URL(request.url);
        const newsletterId = searchParams.get('id');

        if (!newsletterId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Newsletter ID required',
                },
                { status: 400 }
            );
        }

        const body = await request.json();
        const validatedData = updateNewsletterSchema.parse(body);

        // Check if newsletter exists
        const existingNewsletter = await prisma.newsletter.findUnique({
            where: { id: newsletterId },
            select: { status: true, sentAt: true },
        });

        if (!existingNewsletter) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Newsletter not found',
                },
                { status: 404 }
            );
        }

        // Prevent editing sent newsletters
        if (existingNewsletter.status === 'SENT' || existingNewsletter.sentAt) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Cannot edit sent newsletters',
                },
                { status: 400 }
            );
        }

        const updateData: {
            title?: string;
            subject?: string;
            content?: string;
            type?:
                | 'SPECIAL_EVENT'
                | 'MAJOR_UPDATE'
                | 'MONTHLY_SUMMARY'
                | 'NEW_CONTENT';
            status?:
                | 'DRAFT'
                | 'SCHEDULED'
                | 'SENDING'
                | 'SENT'
                | 'FAILED'
                | 'CANCELLED';
            scheduledAt?: Date | null;
        } = {};
        if (validatedData.title !== undefined)
            updateData.title = validatedData.title;
        if (validatedData.subject !== undefined)
            updateData.subject = validatedData.subject;
        if (validatedData.content !== undefined)
            updateData.content = validatedData.content;
        if (validatedData.type !== undefined)
            updateData.type = validatedData.type;
        if (validatedData.status !== undefined)
            updateData.status = validatedData.status;
        if (validatedData.scheduledAt !== undefined) {
            updateData.scheduledAt = validatedData.scheduledAt
                ? new Date(validatedData.scheduledAt)
                : null;
        }

        const newsletter = await prisma.newsletter.update({
            where: { id: newsletterId },
            data: updateData,
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        logger.info('Newsletter updated', {
            userId: session.user.id,
            newsletterId: newsletter.id,
            changes: Object.keys(updateData).join(', '),
        });

        return NextResponse.json({
            success: true,
            message: 'Newsletter updated successfully',
            newsletter,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Invalid newsletter data',
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        logger.error('Newsletter update error', {
            error: error instanceof Error ? error.message : 'Unknown error',
        });

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to update newsletter',
            },
            { status: 500 }
        );
    }
}
