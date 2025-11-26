import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

const handler = NextAuth(authOptions);

// Wrap handler to ensure cookies are set properly on Netlify
async function authHandler(req: NextRequest) {
    const response = (await handler(
        req,
        {} as Record<string, never>
    )) as NextResponse;

    // Force cookies to be included in response
    if (response instanceof NextResponse) {
        response.headers.set('Cache-Control', 'no-store, must-revalidate');
    }

    return response;
}

export { authHandler as GET, authHandler as POST };
