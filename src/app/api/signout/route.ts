import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isHttps =
        req.headers.get('x-forwarded-proto') === 'https' || isProduction;

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

    // Redirect to home page
    const response = NextResponse.redirect(new URL('/', req.url));

    // Set all cookies to expire
    cookieNames.forEach((name) => {
        response.cookies.set(name, '', {
            path: '/',
            expires: new Date(0),
            maxAge: -1,
            httpOnly: true,
            secure: isHttps,
            sameSite: 'lax',
        });
    });

    // Set cache control headers
    response.headers.set(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private'
    );
    response.headers.set('Pragma', 'no-cache');

    return response;
}

export async function GET(req: NextRequest) {
    return POST(req);
}
