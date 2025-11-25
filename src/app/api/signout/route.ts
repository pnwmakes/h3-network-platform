import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = isProduction ? '.netlify.app' : undefined;

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

    // Delete each cookie with multiple strategies
    cookieNames.forEach((name) => {
        // Strategy 1: Delete with domain
        if (domain) {
            try {
                cookieStore.delete({
                    name,
                    path: '/',
                    domain,
                    secure: true,
                    httpOnly: true,
                });
            } catch (e) {
                // Ignore
            }
        }
        
        // Strategy 2: Delete with path only
        try {
            cookieStore.delete({
                name,
                path: '/',
            });
        } catch (e) {
            // Ignore
        }
        
        // Strategy 3: Simple delete
        try {
            cookieStore.delete(name);
        } catch (e) {
            // Ignore
        }
    });

    // Create response with Set-Cookie headers to explicitly clear cookies
    const response = NextResponse.json({
        success: true,
        message: 'Signed out successfully',
    });
    
    // Explicitly set cookies to expire in the past
    cookieNames.forEach((name) => {
        response.cookies.set(name, '', {
            path: '/',
            expires: new Date(0),
            maxAge: 0,
            ...(isProduction && {
                domain: '.netlify.app',
                secure: true,
            }),
        });
    });
    
    // Set cache control to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
}

export async function GET(req: NextRequest) {
    return POST(req);
}
