import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            displayName,
            bio,
            showName,
            funnyFact,
            linkedinUrl,
            instagramUrl,
            tiktokUrl,
            websiteUrl,
            avatarUrl,
            profileComplete,
            isActive,
        } = body;

        // Find the user's creator profile
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

        // Update the creator profile
        const updatedCreator = await prisma.creator.update({
            where: { id: user.creator.id },
            data: {
                displayName: displayName || user.creator.displayName,
                bio: bio || user.creator.bio,
                showName: showName || user.creator.showName,
                funnyFact: funnyFact || user.creator.funnyFact,
                linkedinUrl: linkedinUrl || user.creator.linkedinUrl,
                instagramUrl: instagramUrl || user.creator.instagramUrl,
                tiktokUrl: tiktokUrl || user.creator.tiktokUrl,
                websiteUrl: websiteUrl || user.creator.websiteUrl,
                avatarUrl: avatarUrl || user.creator.avatarUrl,
                profileComplete:
                    profileComplete !== undefined
                        ? profileComplete
                        : user.creator.profileComplete,
                isActive:
                    isActive !== undefined ? isActive : user.creator.isActive,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            creator: updatedCreator,
        });
    } catch (error) {
        console.error('Creator profile update error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get the user's creator profile
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { creator: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // If user is SUPER_ADMIN but doesn't have a creator profile, create a temporary one for dashboard access
        if (user.role === 'SUPER_ADMIN' && !user.creator) {
            return NextResponse.json({
                success: true,
                creator: {
                    id: 'temp-admin',
                    displayName: user.name || 'Super Admin',
                    bio: 'Platform Administrator - Full Access',
                    showName: 'Admin Dashboard',
                    isActive: true,
                    profileComplete: true,
                    avatarUrl: '/h3-logos/h3-network-logo-badge.png',
                    funnyFact: 'Has administrative superpowers! 🚀',
                    linkedinUrl: '',
                    instagramUrl: '',
                    tiktokUrl: '',
                    websiteUrl: '',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    userId: user.id,
                },
                isAdminAccess: true,
            });
        }

        if (!user.creator) {
            return NextResponse.json(
                { error: 'Creator profile not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            creator: user.creator,
            isAdminAccess: false,
        });
    } catch (error) {
        console.error('Creator profile fetch error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
