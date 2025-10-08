'use client';

import { useSession } from 'next-auth/react';
import CountdownBanner from '@/components/CountdownBanner';

export default function Home() {
    const { data: session, status } = useSession();

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Countdown Banner */}
            <CountdownBanner />

            <main className='max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8'>
                {/* Hero Section */}
                <div className='text-center mb-16'>
                    <h1 className='text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight'>
                        HOPE HELP HUMOR
                    </h1>
                    <p className='text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed'>
                        We are more than a network. We are a community! A
                        community for justice-impacted people and those who work
                        within criminal justice.
                    </p>

                    {status === 'loading' ? (
                        <div className='flex justify-center'>
                            <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
                        </div>
                    ) : session ? (
                        <div className='bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto'>
                            <h2 className='text-2xl font-bold text-gray-900 mb-3'>
                                Welcome back, {session.user.name}!
                            </h2>
                            <p className='text-gray-600 mb-4'>
                                You&apos;re signed in as a{' '}
                                <span className='font-semibold text-blue-600'>
                                    {session.user.role.toLowerCase()}
                                </span>
                            </p>
                            <div className='space-y-2 text-sm'>
                                <div className='flex justify-between'>
                                    <span className='text-gray-500'>
                                        Email:
                                    </span>
                                    <span className='text-gray-900'>
                                        {session.user.email}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className='text-center'>
                            <p className='text-lg text-gray-600 mb-6'>
                                Sign in to access your personalized content and
                                connect with our community
                            </p>
                        </div>
                    )}
                </div>

                {/* Hope Help Humor Sections */}
                <div className='grid md:grid-cols-3 gap-8 mb-16'>
                    <div className='text-center p-8 bg-white rounded-xl shadow-lg'>
                        <div className='text-6xl font-black text-blue-600 mb-4'>
                            01
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                            Hope
                        </h2>
                        <p className='text-gray-600 leading-relaxed'>
                            We understand conversations on these topics can
                            leave people feeling hopeless. This is why we strive
                            to bring HOPE through each piece of our content.
                            There is a way forward and we will find it together!
                        </p>
                    </div>

                    <div className='text-center p-8 bg-white rounded-xl shadow-lg'>
                        <div className='text-6xl font-black text-green-600 mb-4'>
                            02
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                            Help
                        </h2>
                        <p className='text-gray-600 leading-relaxed'>
                            We don&apos;t just discuss problems; we discuss
                            solutions. We want our viewers to leave feeling
                            empowered to make a positive difference in our
                            communities.
                        </p>
                    </div>

                    <div className='text-center p-8 bg-white rounded-xl shadow-lg'>
                        <div className='text-6xl font-black text-yellow-600 mb-4'>
                            03
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                            Humor
                        </h2>
                        <p className='text-gray-600 leading-relaxed'>
                            When we can take a moment to laugh, we own the
                            moment instead of it owning us. Laughter is truly
                            the best medicine and the good news? There&apos;s no
                            insurance needed for this medicine!
                        </p>
                    </div>
                </div>

                {/* Why a Network Section */}
                <div className='text-center bg-white rounded-xl shadow-lg p-12 mb-16'>
                    <h2 className='text-4xl font-bold text-gray-900 mb-6'>
                        WHY A NETWORK?
                    </h2>
                    <blockquote className='text-2xl font-semibold text-gray-700 mb-6 italic'>
                        &quot;IF YOU WANT TO GO FAST, GO ALONE. IF YOU WANT TO
                        GO FAR, GO TOGETHER.&quot;
                    </blockquote>
                    <p className='text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed mb-8'>
                        It is easy to feel isolated when it comes to reentry,
                        addiction, incarceration, and even criminal justice
                        reform. But we weren&apos;t created to do this life
                        alone. This is why we are a network with many voices. We
                        want each content creator and listener and reader to
                        feel like they are a part of a larger community. We know
                        that when we work together, we go further.
                    </p>
                    <div className='text-center'>
                        <p className='text-xl font-semibold text-gray-900 mb-2'>
                            Before you leave this page, please know this above
                            all else:
                        </p>
                        <p className='text-3xl font-black text-blue-600'>
                            YOU ARE NOT ALONE.
                        </p>
                    </div>
                </div>

                {/* Topics Section */}
                <div className='mb-16'>
                    <h2 className='text-4xl font-bold text-gray-900 text-center mb-12'>
                        TOPICS
                    </h2>
                    <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
                        <div className='bg-white p-6 rounded-xl shadow-lg'>
                            <h3 className='text-xl font-bold text-gray-900 mb-3'>
                                REENTRY
                            </h3>
                            <p className='text-gray-600 text-sm leading-relaxed'>
                                Reentry can be hard to navigate and can leave us
                                feeling lost, but there is HOPE! There are some
                                great reentry programs that our different shows
                                and blogs highlight.
                            </p>
                        </div>

                        <div className='bg-white p-6 rounded-xl shadow-lg'>
                            <h3 className='text-xl font-bold text-gray-900 mb-3'>
                                ADDICTION
                            </h3>
                            <p className='text-gray-600 text-sm leading-relaxed'>
                                If you are in recovery or you are currently
                                struggling with a substance use disorder, we are
                                here to HELP you find a way forward!
                            </p>
                        </div>

                        <div className='bg-white p-6 rounded-xl shadow-lg'>
                            <h3 className='text-xl font-bold text-gray-900 mb-3'>
                                INCARCERATION
                            </h3>
                            <p className='text-gray-600 text-sm leading-relaxed'>
                                We work directly with tablet providers to get
                                our content inside prisons and jails across the
                                nation. We currently stream on over ONE MILLION
                                tablets!
                            </p>
                        </div>

                        <div className='bg-white p-6 rounded-xl shadow-lg'>
                            <h3 className='text-xl font-bold text-gray-900 mb-3'>
                                CRIMINAL JUSTICE REFORM
                            </h3>
                            <p className='text-gray-600 text-sm leading-relaxed'>
                                We believe in providing HOPE to our people, but
                                we also believe in providing truth. We must have
                                those uncomfortable talks around uncomfortable
                                subjects.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Platform Features - Updated to match their style */}
                <div className='text-center'>
                    <h2 className='text-4xl font-bold text-gray-900 mb-12'>
                        PLATFORM FEATURES
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                        <div className='bg-white p-8 rounded-xl shadow-lg'>
                            <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                Video Content
                            </h3>
                            <p className='text-gray-600 leading-relaxed'>
                                YouTube-integrated video player with progress
                                tracking for our community of creators and
                                viewers.
                            </p>
                        </div>
                        <div className='bg-white p-8 rounded-xl shadow-lg'>
                            <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                Creator Dashboard
                            </h3>
                            <p className='text-gray-600 leading-relaxed'>
                                Bulk content scheduling and management tools for
                                our incredible content creators.
                            </p>
                        </div>
                        <div className='bg-white p-8 rounded-xl shadow-lg'>
                            <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                Community Support
                            </h3>
                            <p className='text-gray-600 leading-relaxed'>
                                Focused on criminal justice reform, addiction
                                recovery, and reentry support through Hope,
                                Help, and Humor.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
