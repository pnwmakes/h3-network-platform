import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
// Import email templates - uncomment when email service is configured
// import {
//     getCreatorInvitationEmailHTML,
//     getCreatorInvitationEmailText,
// } from '@/lib/email-templates/creator-invitation';

// Generate random password
function generateTempPassword(): string {
    return crypto.randomBytes(8).toString('hex'); // 16 character password
}

// Generate password reset token
function generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex'); // 64 character token
}

export async function POST(req: NextRequest) {
    try {
        // Verify user is authenticated and is a super admin
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the user and check if they are a super admin
        const adminUser = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!adminUser || adminUser.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden: Super admin access required' },
                { status: 403 }
            );
        }

        // Parse request body
        const body = await req.json();
        const { name, email, displayName, bio, showName } = body;

        // Validate required fields
        if (!name || !email || !displayName) {
            return NextResponse.json(
                { error: 'Name, email, and display name are required' },
                { status: 400 }
            );
        }

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

        // Generate temporary password and reset token
        const tempPassword = generateTempPassword();
        const resetToken = generateResetToken();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);
        const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Create user with CREATOR role
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'CREATOR',
                emailVerified: new Date(), // Auto-verify since admin created
                resetToken,
                resetTokenExpiry,
            },
        });

        // Create creator profile
        await prisma.creator.create({
            data: {
                userId: newUser.id,
                displayName,
                bio: bio || '',
                showName: showName || '',
            },
        });

        // TODO: Send email with credentials and reset link
        // For now, we'll return the temp password in the response
        // In production, this should be sent via email only
        /*
        const emailHTML = getCreatorInvitationEmailHTML({
            creatorName: name,
            creatorEmail: email,
            tempPassword,
            resetToken,
            invitedBy: adminUser.name || 'H3 Network Admin',
        });

        const emailText = getCreatorInvitationEmailText({
            creatorName: name,
            creatorEmail: email,
            tempPassword,
            resetToken,
            invitedBy: adminUser.name || 'H3 Network Admin',
        });

        // Send email using your email service (e.g., SendGrid, Resend, etc.)
        await sendEmail({
            to: email,
            subject: 'Welcome to H3 Network - Set Your Password',
            html: emailHTML,
            text: emailText,
        });
        */

        console.log('Creator account created:', {
            email: newUser.email,
            tempPassword,
            resetLink: `${process.env.NEXTAUTH_URL}/auth/set-password/${resetToken}`,
        });

        return NextResponse.json({
            success: true,
            email: newUser.email,
            tempPassword, // TODO: Remove this when email is implemented
            resetToken, // TODO: Remove this when email is implemented
            message: 'Creator account created successfully',
        });
    } catch (error) {
        console.error('Error creating creator:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
