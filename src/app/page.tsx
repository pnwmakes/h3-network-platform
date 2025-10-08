'use client';

import { useSession } from 'next-auth/react';

export default function Home() {
    const { data: session, status } = useSession();

    return (
        <div className='min-h-screen bg-gray-50'>
            <main className='max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8'>
                <div className='text-center'>
                    <h1 className='text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl'>
                        Welcome to{' '}
                        <span className='text-blue-600'>H3 Network</span>
                    </h1>
                    <p className='mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl'>
                        Supporting creators in criminal justice reform,
                        addiction recovery, and reentry support.
                    </p>

                    {status === 'loading' ? (
                        <div className='mt-8 flex justify-center'>
                            <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
                        </div>
                    ) : session ? (
                        <div className='mt-8'>
                            <div className='bg-white p-6 rounded-lg shadow-sm max-w-md mx-auto'>
                                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                                    Welcome back, {session.user.name}!
                                </h2>
                                <p className='text-gray-600 mb-4'>
                                    You&apos;re signed in as a{' '}
                                    <span className='font-medium text-blue-600'>
                                        {session.user.role.toLowerCase()}
                                    </span>
                                </p>
                                <div className='space-y-2'>
                                    <div className='flex justify-between text-sm'>
                                        <span className='text-gray-500'>
                                            Email:
                                        </span>
                                        <span className='text-gray-900'>
                                            {session.user.email}
                                        </span>
                                    </div>
                                    <div className='flex justify-between text-sm'>
                                        <span className='text-gray-500'>
                                            User ID:
                                        </span>
                                        <span className='text-gray-900 font-mono text-xs'>
                                            {session.user.id}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='mt-8'>
                            <p className='text-gray-600 mb-4'>
                                Sign in to access your personalized content and
                                creator tools
                            </p>
                        </div>
                    )}

                    <div className='mt-12'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                            Platform Features
                        </h2>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto'>
                            <div className='bg-white p-6 rounded-lg shadow-sm'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                    Video Content
                                </h3>
                                <p className='text-gray-600'>
                                    YouTube-integrated video player with
                                    progress tracking
                                </p>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-sm'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                    Creator Dashboard
                                </h3>
                                <p className='text-gray-600'>
                                    Bulk content scheduling and management tools
                                </p>
                            </div>
                            <div className='bg-white p-6 rounded-lg shadow-sm'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                                    Community Support
                                </h3>
                                <p className='text-gray-600'>
                                    Focused on criminal justice reform and
                                    recovery
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
