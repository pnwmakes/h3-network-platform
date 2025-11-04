import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';
import { UserRole, Prisma } from '@prisma/client';

export const GET = withApiSecurity(async (request: NextRequest) => {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== 'SUPER_ADMIN') {
            logger.securityEvent('Unauthorized admin access attempt', 'high', {
                userId: session?.user?.id,
                userRole: session?.user?.role,
                endpoint: '/api/admin/users',
            });
            return createErrorResponse('Unauthorized', 401);
        }

        logger.info('Admin users access', {
            userId: session.user.id,
            userRole: session.user.role,
        });

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role') || 'all';
        const status = searchParams.get('status') || 'all';
        const perPage = 10;

        // Build where clause
        const whereClause: Prisma.UserWhereInput = {};

        // Search filter
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        // Role filter
        if (role !== 'all') {
            whereClause.role = role as UserRole;
        }

        // Status filters
        if (status === 'verified') {
            whereClause.emailVerified = { not: null };
        } else if (status === 'unverified') {
            whereClause.emailVerified = null;
        }

        // Get total count
        const total = await prisma.user.count({ where: whereClause });
        const pages = Math.ceil(total / perPage);

        // Get users with pagination
        const users = await prisma.user.findMany({
            where: whereClause,
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        isActive: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: (page - 1) * perPage,
            take: perPage,
        });

        return NextResponse.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    pages,
                    current: page,
                    perPage,
                },
                filters: {
                    roles: ['VIEWER', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'],
                    statuses: ['active', 'inactive', 'verified', 'unverified'],
                },
            },
        });
    } catch (error) {
        logger.error('Admin users fetch error', {
            error: error instanceof Error ? error.message : String(error),
            endpoint: '/api/admin/users',
        });
        return createErrorResponse('Failed to fetch users', 500);
    }
});
