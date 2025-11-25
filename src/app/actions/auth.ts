'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signOutAction() {
    const cookieStore = await cookies();

    // Get all cookies
    const allCookies = cookieStore.getAll();

    // Delete all NextAuth related cookies
    allCookies.forEach((cookie) => {
        if (
            cookie.name.includes('next-auth') ||
            cookie.name.includes('__Secure-next-auth') ||
            cookie.name.includes('__Host-next-auth')
        ) {
            cookieStore.delete(cookie.name);
        }
    });

    // Also explicitly try to delete known cookie names
    const cookieNames = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        'next-auth.csrf-token',
        '__Host-next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.callback-url',
    ];

    cookieNames.forEach((name) => {
        cookieStore.delete(name);
    });

    redirect('/');
}
