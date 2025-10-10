'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import CountdownBanner from '@/components/CountdownBanner';
import { QuickAccessCard } from '@/components/quick-access-card';

export default function Home() {
    const { data: session, status } = useSession();

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200'>
            {/* Countdown Banner */}
            <CountdownBanner />

            <main className='max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8'>
                {/* Hero Section */}
                <div className='text-center mb-16'>
                    {/* H3 Logo with Hope Help Humor */}
                    <div className='mb-8 flex justify-center'>
                        <Image
                            src='/logos/H3 Logo_with HopeHelpHumor.png'
                            alt='H3 Network - Hope, Help, Humor'
                            width={600}
                            height={200}
                            className='h-32 md:h-48 w-auto max-w-full'
                            priority
                        />
                    </div>
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

                {/* Quick Access for Logged-in Users */}
                {session && (
                    <div className='mb-16'>
                        <QuickAccessCard />
                    </div>
                )}

                {/* Hope Help Humor Sections */}
                <div className='grid md:grid-cols-3 gap-8 mb-16'>
                    <div className='text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200'>
                        <div className='text-6xl font-black text-blue-600 mb-4'>
                            01
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
                            Hope
                        </h2>
                        <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                            We understand conversations on these topics can
                            leave people feeling hopeless. This is why we strive
                            to bring HOPE through each piece of our content.
                            There is a way forward and we will find it together!
                        </p>
                    </div>

                    <div className='text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200'>
                        <div className='text-6xl font-black text-green-600 mb-4'>
                            02
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
                            Help
                        </h2>
                        <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                            We don&apos;t just discuss problems; we discuss
                            solutions. We want our viewers to leave feeling
                            empowered to make a positive difference in our
                            communities.
                        </p>
                    </div>

                    <div className='text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg transition-colors duration-200'>
                        <div className='text-6xl font-black text-yellow-600 mb-4'>
                            03
                        </div>
                        <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
                            Humor
                        </h2>
                        <p className='text-gray-600 dark:text-gray-300 leading-relaxed'>
                            When we can take a moment to laugh, we own the
                            moment instead of it owning us. Laughter is truly
                            the best medicine and the good news? There&apos;s no
                            insurance needed for this medicine!
                        </p>
                    </div>
                </div>

                {/* NEW NETWORK SHOWS! Section */}
                <div className='mb-16'>
                    <h2 className='text-4xl font-bold text-gray-900 text-center mb-12'>
                        NEW NETWORK SHOWS!
                    </h2>
                    <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                            <div className='p-8 text-center'>
                                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                    DON&apos;T PANIC! THE SHOW
                                </h3>
                                <div className='mb-6'>
                                    <span className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold'>
                                        COMING JAN 2026!
                                    </span>
                                </div>
                                <p className='text-gray-600 mb-6'>
                                    Join Rita Williams and Trip Taylor as they
                                    tackle the topics that matter most to our
                                    community.
                                </p>
                                <Link
                                    href='http://linktr.ee/h3dontpanic'
                                    className='inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold'
                                    target='_blank'
                                >
                                    Learn More →
                                </Link>
                            </div>
                        </div>

                        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                            <div className='p-8 text-center'>
                                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                    SECOND CHANCE SESSIONS
                                </h3>
                                <div className='mb-6'>
                                    <span className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold'>
                                        COMING JAN 2026!
                                    </span>
                                </div>
                                <p className='text-gray-600 mb-6'>
                                    Kardell Sims and Trinese McDowell share
                                    powerful stories of redemption and second
                                    chances.
                                </p>
                                <Link
                                    href='https://linktr.ee/secondchancesessions'
                                    className='inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold'
                                    target='_blank'
                                >
                                    Learn More →
                                </Link>
                            </div>
                        </div>

                        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                            <div className='p-8 text-center'>
                                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                    HOPE JUNKIES
                                </h3>
                                <div className='mb-6'>
                                    <span className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold'>
                                        COMING JAN 2026!
                                    </span>
                                </div>
                                <p className='text-gray-600 mb-6'>
                                    Hunter and Kristen bring hope and healing to
                                    those struggling with addiction and
                                    recovery.
                                </p>
                                <Link
                                    href='https://linktr.ee/hopejunkiespodcast'
                                    className='inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold'
                                    target='_blank'
                                >
                                    Learn More →
                                </Link>
                            </div>
                        </div>

                        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                            <div className='p-8 text-center'>
                                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                    INSIDE OUT
                                </h3>
                                <div className='mb-6'>
                                    <span className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold'>
                                        COMING JAN 2026!
                                    </span>
                                </div>
                                <p className='text-gray-600 mb-6'>
                                    George K L Smith provides insights from
                                    inside the system and beyond.
                                </p>
                                <Link
                                    href='https://linktr.ee/insideoutgkls'
                                    className='inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold'
                                    target='_blank'
                                >
                                    Learn More →
                                </Link>
                            </div>
                        </div>

                        <div className='bg-white rounded-xl shadow-lg overflow-hidden'>
                            <div className='p-8 text-center'>
                                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                    PRISON POD
                                </h3>
                                <div className='mb-6'>
                                    <span className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold'>
                                        COMING JAN 2026!
                                    </span>
                                </div>
                                <p className='text-gray-600 mb-6'>
                                    Valerie Cartonio brings authentic
                                    perspectives from the justice-impacted
                                    community.
                                </p>
                                <Link
                                    href='https://linktr.ee/prisonpod'
                                    className='inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold'
                                    target='_blank'
                                >
                                    Learn More →
                                </Link>
                            </div>
                        </div>

                        <div className='bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-lg overflow-hidden border-2 border-blue-200'>
                            <div className='p-8 text-center'>
                                <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                                    WANT TO PITCH YOUR IDEA?
                                </h3>
                                <div className='mb-6'>
                                    <span className='inline-block bg-yellow-500 text-gray-900 px-6 py-2 rounded-full text-sm font-semibold'>
                                        NOW ACCEPTING PITCHES!
                                    </span>
                                </div>
                                <p className='text-gray-600 mb-6'>
                                    We believe in quality over quantity. Share
                                    your show or blog idea with us!
                                </p>
                                <Link
                                    href='https://hopehelphumor.com/wp-content/uploads/2025/08/H3-Network_Pitch-1.pdf'
                                    className='inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors duration-200'
                                    target='_blank'
                                >
                                    LEARN MORE!
                                </Link>
                            </div>
                        </div>
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

                {/* FROM OUR TEAM - Testimonials Section */}
                <div className='mb-16'>
                    <h2 className='text-4xl font-bold text-gray-900 text-center mb-12'>
                        FROM OUR TEAM
                    </h2>
                    <div className='grid md:grid-cols-3 gap-8'>
                        <div className='bg-white rounded-xl shadow-lg p-8'>
                            <div className='mb-6'>
                                <div className='w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4'></div>
                                <h3 className='text-xl font-bold text-gray-900 text-center'>
                                    Noah Asher
                                </h3>
                                <p className='text-sm text-gray-600 text-center'>
                                    Founder and Executive Producer
                                </p>
                            </div>
                            <blockquote className='text-gray-700 italic mb-4'>
                                &quot;I remember how hopeless and helpless I
                                felt while being locked up. I thought there was
                                no coming back from this. I took a short
                                sentence, but I was beginning to think I took a
                                life sentence. After being released, I realized
                                there was a way forward. And ever since then, I
                                have wanted to create a place where people could
                                find Hope, Help, and even laugh a little along
                                the way!&quot;
                            </blockquote>
                        </div>

                        <div className='bg-white rounded-xl shadow-lg p-8'>
                            <div className='mb-6'>
                                <div className='w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4'></div>
                                <h3 className='text-xl font-bold text-gray-900 text-center'>
                                    Rita Williams
                                </h3>
                                <p className='text-sm text-gray-600 text-center'>
                                    Media Director and Show Host
                                </p>
                            </div>
                            <blockquote className='text-gray-700 italic mb-4'>
                                &quot;Noah and I&apos;ve poured countless hours
                                into building the H3 Network, and I
                                couldn&apos;t be more excited to finally share
                                it with the world. This project has been a true
                                labor of love, designed to bring hope, help, and
                                humor to a community too often overlooked: those
                                impacted by the system. No one else is doing
                                what we&apos;re doing, and I&apos;m proud that
                                H3 is stepping into that gap with authenticity
                                and purpose. The best part? We&apos;re just
                                getting started.&quot;
                            </blockquote>
                        </div>

                        <div className='bg-white rounded-xl shadow-lg p-8'>
                            <div className='mb-6'>
                                <div className='w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4'></div>
                                <h3 className='text-xl font-bold text-gray-900 text-center'>
                                    Kardell Sims
                                </h3>
                                <p className='text-sm text-gray-600 text-center'>
                                    Content Creator and Show Host
                                </p>
                            </div>
                            <blockquote className='text-gray-700 italic mb-4'>
                                &quot;The H3 Network has created a place where I
                                can connect with other justice-impacted people
                                while also having a voice of my own. When Noah
                                first pitched this network to me, he said,
                                &apos;I want to create a platform for people to
                                share their own message of Hope.&apos; And H3
                                has done it. No other community like this.&quot;
                            </blockquote>
                        </div>
                    </div>
                </div>

                {/* Meet Our Creators Section */}
                <div className='text-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-12 mb-16'>
                    <h2 className='text-4xl font-bold text-gray-900 mb-6'>
                        MEET OUR H3 NETWORK CREATORS
                    </h2>
                    <p className='text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8'>
                        Discover the passionate voices behind our community. Our
                        creators share their authentic stories of Hope, Help,
                        and Humor to support those affected by criminal justice
                        issues and addiction recovery.
                    </p>
                    <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                        <Link
                            href='/creators'
                            className='inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg'
                        >
                            <svg
                                className='w-5 h-5 mr-2'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                                />
                            </svg>
                            Browse Creators
                        </Link>
                        <Link
                            href='/videos'
                            className='inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg border border-blue-200'
                        >
                            <svg
                                className='w-5 h-5 mr-2'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-8V6a2 2 0 00-2-2H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4V2m10 0v2M7 4h10v16H7V4z'
                                />
                            </svg>
                            Watch Videos
                        </Link>
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
