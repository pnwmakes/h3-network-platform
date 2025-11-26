import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    // Delete all NextAuth cookies
    const cookieStore = await cookies();
    
    // Get all cookies
    const allCookies = cookieStore.getAll();
    
    // Delete NextAuth session cookies
    allCookies.forEach((cookie) => {
        if (cookie.name.startsWith('next-auth') || cookie.name.startsWith('__Secure-next-auth')) {
            cookieStore.delete(cookie.name);
        }
    });

    return NextResponse.json({ success: true });
}
