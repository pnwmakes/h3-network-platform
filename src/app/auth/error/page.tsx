'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case 'Configuration':
                return 'There is a problem with the server configuration.';
            case 'AccessDenied':
                return 'Access denied. You do not have permission to sign in.';
            case 'Verification':
                return 'The verification token has expired or has already been used.';
            default:
                return 'An error occurred during authentication.';
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
            <div className='max-w-md w-full space-y-8'>
                <div className='text-center'>
                    <h2 className='text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight'>
                        H3 NETWORK
                    </h2>
                    <div className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-bold mb-6'>
                        Hope • Help • Humor
                    </div>
                    <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                        Authentication Error
                    </h3>
                    <p className='text-lg text-red-600 leading-relaxed'>
                        {getErrorMessage(error)}
                    </p>
                </div>
                <div className='mt-8'>
                    <Link
                        href='/auth/signin'
                        className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    >
                        Try Again
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function AuthError() {
    return (
        <Suspense
            fallback={
                <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                    <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
                </div>
            }
        >
            <AuthErrorContent />
        </Suspense>
    );
}
