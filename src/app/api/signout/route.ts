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

    // Delete each cookie
    cookieNames.forEach((name) => {
        cookieStore.delete({
            name,
            path: '/',
        });
    });

    return NextResponse.json({ success: true, message: 'Signed out successfully' });
}

export async function GET(req: NextRequest) {
    return POST(req);
}
