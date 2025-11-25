'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signOutAction() {
    const cookieStore = await cookies();

    // Delete all NextAuth related cookies with proper options
    const cookieNames = [
        'next-auth.session-token',
        '__Secure-next-auth.session-token',
        'next-auth.csrf-token',
        '__Host-next-auth.csrf-token',
        'next-auth.callback-url',
        '__Secure-next-auth.callback-url',
    ];

    cookieNames.forEach((name) => {
        try {
            cookieStore.delete({
                name,
                path: '/',
                domain: process.env.NODE_ENV === 'production' 
                    ? '.netlify.app' 
                    : undefined,
            });
        } catch (e) {
            // Ignore errors for cookies that don't exist
            console.error('Error deleting cookie:', name, e);
        }
    });

    // Also try without domain specification
    cookieNames.forEach((name) => {
        try {
            cookieStore.delete(name);
        } catch (e) {
            // Ignore errors
        }
    });

    redirect('/');
}
