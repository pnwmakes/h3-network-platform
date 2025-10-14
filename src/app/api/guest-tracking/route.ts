import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

const GUEST_VIEW_LIMIT = 2;

export async function POST(request: NextRequest) {
    try {
        // We don't need the content details for basic tracking
        await request.json(); // Just consume the body

        // Get session ID from headers or generate one
        const headersList = await headers();
        const sessionId =
            headersList.get('x-session-id') ||
            request.cookies.get('session-id')?.value ||
            generateSessionId();

        // Check current guest view count
        let guestLimit = await prisma.guestViewingLimit.findUnique({
            where: { sessionId },
        });

        if (!guestLimit) {
            // Create new guest session
            guestLimit = await prisma.guestViewingLimit.create({
                data: {
                    sessionId,
                    viewCount: 1,
                },
            });
        } else {
            // Update existing session
            guestLimit = await prisma.guestViewingLimit.update({
                where: { sessionId },
                data: {
                    viewCount: guestLimit.viewCount + 1,
                    lastViewedAt: new Date(),
                },
            });
        }

        const isLimitReached = guestLimit.viewCount > GUEST_VIEW_LIMIT;
        const remainingViews = Math.max(
            0,
            GUEST_VIEW_LIMIT - guestLimit.viewCount + 1
        );

        const response = NextResponse.json({
            success: true,
            viewCount: guestLimit.viewCount,
            limitReached: isLimitReached,
            remainingViews,
            showLoginPrompt: guestLimit.viewCount >= GUEST_VIEW_LIMIT,
        });

        // Set session cookie if not exists
        if (!request.cookies.get('session-id')) {
            response.cookies.set('session-id', sessionId, {
                maxAge: 30 * 24 * 60 * 60, // 30 days
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
            });
        }

        return response;
    } catch (error) {
        console.error('Guest tracking error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to track guest viewing' },
            { status: 500 }
        );
    }
}

function generateSessionId(): string {
    return 'guest_' + Math.random().toString(36).substr(2, 9) + Date.now();
}
