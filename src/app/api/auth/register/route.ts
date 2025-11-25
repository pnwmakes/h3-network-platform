import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';
import { UserRole } from '@prisma/client';
import { z } from 'zod';

// Validation schema
const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    // Public registration only allows USER role
    // Creators must apply through admin approval process
    role: z.enum(['USER']).optional().default('USER'),
});

export const POST = withApiSecurity(async (request: NextRequest) => {
    try {
        const body = await request.json();

        // Validate input
        const result = registerSchema.safeParse(body);
        if (!result.success) {
            logger.warn('Registration validation failed', {
                errorCount: result.error.issues.length,
            });
            return createErrorResponse(
                'Invalid input',
                400,
                result.error.issues
            );
        }

        const { name, email, password, role } = result.data;

        logger.info('User registration attempt', {
            email,
            name,
            role,
        });

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'A user with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Public registration always creates VIEWER role
        // Creators must be promoted through admin panel
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: UserRole.VIEWER,
                emailVerified: new Date(), // For MVP, auto-verify emails
            },
        });

        // Remove password from response
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _, ...userWithoutPassword } = user;

        logger.info('User registration successful', {
            userId: user.id,
            email: user.email || undefined,
            role: user.role,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Account created successfully',
                user: userWithoutPassword,
            },
            { status: 201 }
        );
    } catch (error) {
        logger.error('Registration error', {
            error: error instanceof Error ? error.message : String(error),
            endpoint: '/api/auth/register',
        });
        return createErrorResponse('Internal server error', 500);
    }
});
