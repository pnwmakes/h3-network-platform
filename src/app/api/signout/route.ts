import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    
    const isProduction = process.env.NODE_ENV === 'production';

    // List of all possible NextAuth cookie names
    const cookieNames = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        '__Host-next-auth.session-token',
        'next-auth.csrf-token',
        '__Host-next-auth.csrf-token',
        '__Secure-next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.callback-url',
        'next-auth.pkce.code_verifier',
    ];

    // Create response first
    const response = NextResponse.json({
        success: true,
        message: 'Signed out successfully',
    });
    
    // Explicitly set cookies to expire in the past using response headers
    cookieNames.forEach((name) => {
        // Set cookie with max-age=0 to delete it
        response.cookies.set(name, '', {
            path: '/',
            expires: new Date(0),
            maxAge: 0,
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
        });
        
        // Also delete from cookie store
        try {
            cookieStore.delete(name);
        } catch (e) {
            // Ignore
        }
    });
    
    // Set cache control to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
}

export async function GET(req: NextRequest) {
    return POST(req);
}