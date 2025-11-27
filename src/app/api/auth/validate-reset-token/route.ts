import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { token } = body;

        if (!token) {
            return NextResponse.json(
                { error: 'Reset token is required' },
                { status: 400 }
            );
        }

        // Find user with this token
        const user = await prisma.user.findUnique({
            where: { resetToken: token },
            select: {
                id: true,
                email: true,
                resetTokenExpiry: true,
            },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid reset token' },
                { status: 404 }
            );
        }

        // Check if token is expired
        if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return NextResponse.json(
                { error: 'Reset token has expired' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            email: user.email,
        });
    } catch (error) {
        console.error('Error validating reset token:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
