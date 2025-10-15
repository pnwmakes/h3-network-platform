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

        // Find the user's creator profile or create one for SUPER_ADMIN
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

        // Allow both CREATOR role users and SUPER_ADMIN users
        if (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // For SUPER_ADMINs without creator profiles, create one
        let creatorProfile = user.creator;
        if (!user.creator) {
            creatorProfile = await prisma.creator.create({
                data: {
                    userId: user.id,
                    displayName:
                        displayName ||
                        user.name ||
                        user.email?.split('@')[0] ||
                        'Admin',
                    bio: bio || 'H3 Network Admin and Content Creator',
                    isActive: true,
                    profileComplete: false,
                },
            });
        }

        // Update the creator profile
        const updatedCreator = await prisma.creator.update({
            where: { id: creatorProfile!.id },
            data: {
                displayName: displayName || creatorProfile!.displayName,
                bio: bio || creatorProfile!.bio,
                showName: showName || creatorProfile!.showName,
                funnyFact: funnyFact || creatorProfile!.funnyFact,
                linkedinUrl: linkedinUrl || creatorProfile!.linkedinUrl,
                instagramUrl: instagramUrl || creatorProfile!.instagramUrl,
                tiktokUrl: tiktokUrl || creatorProfile!.tiktokUrl,
                websiteUrl: websiteUrl || creatorProfile!.websiteUrl,
                avatarUrl: avatarUrl || creatorProfile!.avatarUrl,
                profileComplete:
                    profileComplete !== undefined
                        ? profileComplete
                        : creatorProfile!.profileComplete,
                isActive:
                    isActive !== undefined
                        ? isActive
                        : creatorProfile!.isActive,
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

        // Allow both CREATOR role users and SUPER_ADMIN users
        if (user.role !== 'CREATOR' && user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Insufficient permissions' },
                { status: 403 }
            );
        }

        // If user is SUPER_ADMIN but doesn't have a creator profile, create one
        if (user.role === 'SUPER_ADMIN' && !user.creator) {
            const newCreatorProfile = await prisma.creator.create({
                data: {
                    userId: user.id,
                    displayName:
                        user.name || user.email?.split('@')[0] || 'Admin',
                    bio: 'H3 Network Admin and Content Creator',
                    isActive: true,
                    profileComplete: true,
                },
            });

            return NextResponse.json({
                success: true,
                creator: newCreatorProfile,
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
