import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        nodeEnv: process.env.NODE_ENV,
        nextauthUrl: process.env.NEXTAUTH_URL,
        hasNextauthSecret: !!process.env.NEXTAUTH_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        timestamp: new Date().toISOString(),
        // Don't expose actual secrets
    });
}
