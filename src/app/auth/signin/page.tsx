'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function SignInContent() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const message = searchParams.get('message');

    useEffect(() => {
        // Check if user is already signed in
        getSession().then((session) => {
            if (session) {
                // Redirect based on role
                const role = session.user.role;
                if (
                    role === 'CREATOR' ||
                    role === 'ADMIN' ||
                    role === 'SUPER_ADMIN'
                ) {
                    router.push('/creator/dashboard');
                } else {
                    router.push('/');
                }
            }
        });
    }, [router]);

    const handleCredentialsSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoadingCredentials(true);

        try {
            console.log('Attempting sign in with:', email);
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            console.log('Sign in result:', result);

            if (result?.error) {
                console.error('Sign in error:', result.error);
                setError('Invalid email or password');
                setIsLoadingCredentials(false);
            } else if (result?.ok) {
                // Sign in successful - use hard redirect to ensure session loads
                console.log('Sign in successful, redirecting...');
                // Get fresh session
                const session = await getSession();
                console.log('Session after login:', session);

                if (session?.user) {
                    const role = session.user.role;
                    if (
                        role === 'CREATOR' ||
                        role === 'ADMIN' ||
                        role === 'SUPER_ADMIN'
                    ) {
                        window.location.href = '/creator/dashboard';
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    // Fallback - try one more time after delay
                    setTimeout(async () => {
                        const retrySession = await getSession();
                        if (retrySession?.user) {
                            const role = retrySession.user.role;
                            if (
                                role === 'CREATOR' ||
                                role === 'ADMIN' ||
                                role === 'SUPER_ADMIN'
                            ) {
                                window.location.href = '/creator/dashboard';
                            } else {
                                window.location.href = '/';
                            }
                        } else {
                            window.location.href = '/';
                        }
                    }, 500);
                }
            }
        } catch (err) {
            console.error('Sign in error:', err);
            setError('Sign in failed. Please try again.');
            setIsLoadingCredentials(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setIsLoadingGoogle(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            console.error('Google sign in failed:', error);
        } finally {
            setIsLoadingGoogle(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
            <div className='max-w-md w-full space-y-8'>
                <div className='text-center'>
                    <h2 className='text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight'>
                        WELCOME TO H3 NETWORK
                    </h2>
                    <div className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-bold mb-6'>
                        Hope • Help • Humor
                    </div>
                    <p className='text-lg text-gray-600 leading-relaxed'>
                        Join our community supporting criminal justice reform,
                        addiction recovery, and reentry through Hope, Help, and
                        Humor.
                    </p>
                </div>

                {message && (
                    <div className='bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded'>
                        {message}
                    </div>
                )}

                <div className='mt-8 space-y-6'>
                    {/* Email/Password Form */}
                    <form
                        className='space-y-4'
                        onSubmit={handleCredentialsSignIn}
                    >
                        {error && (
                            <div className='bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded'>
                                {error}
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Email Address
                            </label>
                            <input
                                id='email'
                                name='email'
                                type='email'
                                required
                                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                                placeholder='your@email.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className='flex items-center justify-between'>
                                <label
                                    htmlFor='password'
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Password
                                </label>
                                <Link
                                    href='/auth/forgot-password'
                                    className='text-sm text-blue-600 hover:text-blue-500'
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <input
                                id='password'
                                name='password'
                                type='password'
                                required
                                className='mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm'
                                placeholder='Your password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type='submit'
                            disabled={isLoadingCredentials}
                            className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoadingCredentials ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-300' />
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <span className='px-2 bg-gray-50 text-gray-500'>
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={isLoadingGoogle}
                        className='group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {isLoadingGoogle ? (
                            <div className='w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin'></div>
                        ) : (
                            <>
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
                                Continue with Google
                            </>
                        )}
                    </button>

                    {/* Register Link */}
                    <div className='text-center'>
                        <span className='text-sm text-gray-600'>
                            Don&apos;t have an account?{' '}
                            <Link
                                href='/auth/register'
                                className='font-medium text-blue-600 hover:text-blue-500'
                            >
                                Create account
                            </Link>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense
            fallback={
                <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                    <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
                </div>
            }
        >
            <SignInContent />
        </Suspense>
    );
}
