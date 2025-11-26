import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
    const headersList = headers();

    return NextResponse.json({
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        timestamp: new Date().toISOString(),
        // Headers that might affect cookies
        host: headersList.get('host'),
        protocol: headersList.get('x-forwarded-proto') || 'unknown',
        // Don't expose actual secrets
    });
}
