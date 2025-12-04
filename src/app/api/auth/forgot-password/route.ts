import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        // Always return success to prevent email enumeration attacks
        // But only create token if user exists
        if (user) {
            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Update user with reset token
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetToken,
                    resetTokenExpiry,
                },
            });

            // TODO: Send email when email service is configured
            // For now, return the token so it can be displayed
            // In production, this should only be sent via email
            return NextResponse.json({
                success: true,
                resetToken, // Remove this when email is configured
                message: 'Password reset link generated',
            });
        }

        // Return success even if user doesn't exist (security best practice)
        return NextResponse.json({
            success: true,
            message: 'If an account exists, a reset link will be sent',
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
