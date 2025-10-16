import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force fresh data endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        console.log('Debug API: Fetching fresh blog data...');
        
        // Get current timestamp
        const now = new Date().toISOString();
        
        // Get published blogs with fresh connection
        const blogs = await prisma.blog.findMany({
            where: {
                status: 'PUBLISHED',
                publishedAt: {
                    lte: new Date(),
                },
            },
            select: {
                id: true,
                title: true,
                status: true,
                publishedAt: true,
                updatedAt: true,
                creator: {
                    select: {
                        displayName: true
                    }
                }
            },
            orderBy: {
                publishedAt: 'desc',
            },
        });

        const response = NextResponse.json({
            timestamp: now,
            count: blogs.length,
            blogs: blogs.map(b => ({
                id: b.id,
                title: b.title,
                creator: b.creator.displayName,
                status: b.status,
                publishedAt: b.publishedAt?.toISOString(),
                updatedAt: b.updatedAt?.toISOString()
            }))
        });

        // Ultra-aggressive cache prevention
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Last-Modified', now);
        response.headers.set('ETag', `"${Date.now()}"`);

        return response;
    } catch (error) {
        console.error('Debug API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch debug data', timestamp: new Date().toISOString() },
            { status: 500 }
        );
    }
}