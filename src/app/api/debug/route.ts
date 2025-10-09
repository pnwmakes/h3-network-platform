import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Test database connection
        const videoCount = await prisma.video.count();
        const creatorCount = await prisma.creator.count();
        
        return NextResponse.json({
            success: true,
            database: 'connected',
            counts: {
                videos: videoCount,
                creators: creatorCount
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}