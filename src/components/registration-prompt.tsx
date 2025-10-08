'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

interface RegistrationPromptProps {
    isOpen: boolean;
    onClose: () => void;
    trigger: 'videoLimit' | 'timeLimit';
    videosWatched: number;
    timeWatched: number; // in seconds
}

export function RegistrationPrompt({
    isOpen,
    onClose,
    trigger,
    videosWatched,
    timeWatched,
}: RegistrationPromptProps) {
    const [isSigningIn, setIsSigningIn] = useState(false);

    if (!isOpen) return null;

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    const handleGoogleSignIn = async () => {
        setIsSigningIn(true);
        try {
            await signIn('google', { callbackUrl: window.location.href });
        } catch (error) {
            console.error('Sign in failed:', error);
            setIsSigningIn(false);
        }
    };

    const triggerMessage =
        trigger === 'videoLimit'
            ? `You've watched ${videosWatched} videos`
            : `You've watched ${formatTime(timeWatched)} of content`;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg max-w-md w-full p-6 relative'>
                {/* Close button */}
                <button
                    onClick={onClose}
                    className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
                >
                    <svg
                        className='w-6 h-6'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                        />
                    </svg>
                </button>

                {/* Content */}
                <div className='text-center'>
                    <div className='mb-4'>
                        <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                            <svg
                                className='w-8 h-8 text-blue-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'
                                />
                            </svg>
                        </div>
                        <h2 className='text-xl font-bold text-gray-900 mb-2'>
                            Enjoying H3 Network?
                        </h2>
                        <p className='text-gray-600 mb-4'>
                            {triggerMessage}. Create your free account to
                            continue watching and track your progress!
                        </p>
                    </div>

                    {/* Benefits */}
                    <div className='bg-gray-50 rounded-lg p-4 mb-6 text-left'>
                        <h3 className='font-semibold text-gray-900 mb-2'>
                            With a free account, you get:
                        </h3>
                        <ul className='space-y-2 text-sm text-gray-700'>
                            <li className='flex items-center'>
                                <svg
                                    className='w-4 h-4 text-green-500 mr-2'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                Unlimited access to all videos
                            </li>
                            <li className='flex items-center'>
                                <svg
                                    className='w-4 h-4 text-green-500 mr-2'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                Track your viewing progress
                            </li>
                            <li className='flex items-center'>
                                <svg
                                    className='w-4 h-4 text-green-500 mr-2'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                Resume videos where you left off
                            </li>
                            <li className='flex items-center'>
                                <svg
                                    className='w-4 h-4 text-green-500 mr-2'
                                    fill='currentColor'
                                    viewBox='0 0 20 20'
                                >
                                    <path
                                        fillRule='evenodd'
                                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                        clipRule='evenodd'
                                    />
                                </svg>
                                Access to blog content
                            </li>
                        </ul>
                    </div>

                    {/* Sign up options */}
                    <div className='space-y-3'>
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isSigningIn}
                            className='w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                        >
                            {isSigningIn ? (
                                <div className='w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2'></div>
                            ) : (
                                <svg
                                    className='w-5 h-5 mr-2'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        fill='#4285F4'
                                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                    />
                                    <path
                                        fill='#34A853'
                                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                    />
                                    <path
                                        fill='#FBBC05'
                                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                    />
                                    <path
                                        fill='#EA4335'
                                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                    />
                                </svg>
                            )}
                            {isSigningIn
                                ? 'Signing in...'
                                : 'Continue with Google'}
                        </button>

                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <div className='w-full border-t border-gray-300' />
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>
                                    Or
                                </span>
                            </div>
                        </div>

                        <Link
                            href='/auth/register'
                            className='w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700'
                        >
                            Create account with email
                        </Link>
                    </div>

                    {/* Already have account */}
                    <div className='mt-6 text-center'>
                        <span className='text-sm text-gray-600'>
                            Already have an account?{' '}
                            <Link
                                href='/auth/signin'
                                className='font-medium text-blue-600 hover:text-blue-500'
                            >
                                Sign in
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
