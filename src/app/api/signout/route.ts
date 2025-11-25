import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();

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

    // Delete each cookie with various configurations to ensure it works
    cookieNames.forEach((name) => {
        // Try to delete without domain
        try {
            cookieStore.delete({
                name,
                path: '/',
            });
        } catch (e) {
            // Ignore
        }
        
        // Try simple delete
        try {
            cookieStore.delete(name);
        } catch (e) {
            // Ignore
        }
    });

    // Return response with cache control headers
    const response = NextResponse.json({
        success: true,
        message: 'Signed out successfully',
    });
    
    // Set cache control to prevent caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
}

export async function GET(req: NextRequest) {
    return POST(req);
}
