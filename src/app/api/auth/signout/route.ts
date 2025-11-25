import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
    // Clear all NextAuth cookies
    const cookieStore = await cookies();
    
    // Clear session token cookies
    cookieStore.delete('next-auth.session-token');
    cookieStore.delete('__Secure-next-auth.session-token');
    cookieStore.delete('next-auth.csrf-token');
    cookieStore.delete('__Host-next-auth.csrf-token');
    cookieStore.delete('next-auth.callback-url');
    cookieStore.delete('__Secure-next-auth.callback-url');

    // Redirect to home page
    return NextResponse.redirect(new URL('/', req.url));
}

export async function POST(req: NextRequest) {
    return GET(req);
}
