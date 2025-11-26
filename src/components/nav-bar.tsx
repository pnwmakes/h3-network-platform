'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export function NavBar() {
    const { data: session, status } = useSession();

    return (
        <nav className='bg-white shadow-sm border-b'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16'>
                    <div className='flex items-center space-x-8'>
                        <Link
                            href='/'
                            className='text-xl font-bold text-gray-900'
                        >
                            H3 Network
                        </Link>

                        {/* Navigation Links */}
                        <div className='hidden md:flex items-center space-x-6'>
                            <Link
                                href='/videos'
                                className='text-gray-700 hover:text-gray-900 font-medium'
                            >
                                Videos
                            </Link>
                            <Link
                                href='/blogs'
                                className='text-gray-700 hover:text-gray-900 font-medium'
                            >
                                Blog
                            </Link>
                        </div>
                    </div>

                    <div className='flex items-center space-x-4'>
                        {status === 'loading' ? (
                            <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
                        ) : session ? (
                            <div className='flex items-center space-x-4'>
                                <span className='text-sm text-gray-700'>
                                    Welcome, {session.user.name}
                                </span>
                                <span className='px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full'>
                                    {session.user.role}
                                </span>
                                <button
                                    onClick={async () => {
                                        // Manually clear NextAuth cookies
                                        document.cookie.split(';').forEach((c) => {
                                            document.cookie = c
                                                .replace(/^ +/, '')
                                                .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
                                        });
                                        // Sign out
                                        await signOut({ redirect: false });
                                        // Force reload
                                        window.location.replace('/');
                                    }}
                                    className='text-sm text-gray-500 hover:text-gray-700'
                                >
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <div className='flex items-center space-x-2'>
                                <Link
                                    href='/auth/register'
                                    className='text-sm text-gray-500 hover:text-gray-700 px-3 py-2'
                                >
                                    Create Account
                                </Link>
                                <Link
                                    href='/auth/signin'
                                    className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700'
                                >
                                    Sign in
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
