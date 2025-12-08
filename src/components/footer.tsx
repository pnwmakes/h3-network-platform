'use client';

import Link from 'next/link';
import Image from 'next/image';
import { isInsideMode } from '@/lib/inside-mode';

export function Footer() {
    const insideMode = isInsideMode();
    
    return (
        <footer className='bg-gray-900 text-white'>
            {/* Newsletter Signup Section - Hidden in Inside Mode */}
            {!insideMode && (
                <div className='bg-gradient-to-r from-blue-600 to-green-600 py-12'>
                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                        <h2 className='text-3xl font-bold mb-4'>
                            SUBSCRIBE TO THE H3 NETWORK TODAY! IT&apos;S FREE...SO
                            WHY NOT?
                        </h2>
                        <div className='max-w-md mx-auto flex gap-4'>
                            <input
                                type='email'
                                placeholder='Email'
                                className='flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white'
                            />
                            <button className='bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200'>
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Footer Content */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
                <div className='grid md:grid-cols-3 gap-8'>
                    {/* Logo and Description */}
                    <div className='md:col-span-1'>
                        <Image
                            src='/logos/H3 Logo_with HopeHelpHumor.png'
                            alt='H3 Network - Hope, Help, Humor'
                            width={300}
                            height={100}
                            className='h-16 w-auto mb-4'
                        />
                        <p className='text-gray-400 mb-6'>
                            A community for justice-impacted people and those
                            who work within criminal justice. Find Hope, Help,
                            and Humor through authentic content and real
                            stories.
                        </p>

                        {/* Social Media Links - Hidden in Inside Mode */}
                        {!insideMode && (
                            <div className='flex space-x-4'>
                                <Link
                                    href='http://www.youtube.com/@hopehelphumor'
                                    target='_blank'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                    aria-label='YouTube'
                                >
                                    <svg
                                        className='w-6 h-6'
                                        fill='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path d='M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' />
                                    </svg>
                                </Link>
                                <Link
                                    href='http://www.instagram.com/hopehelphumor'
                                    target='_blank'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                    aria-label='Instagram'
                                >
                                    <svg
                                        className='w-6 h-6'
                                        fill='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path d='M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' />
                                    </svg>
                                </Link>
                                <Link
                                    href='https://www.linkedin.com/company/hopehelphumor-network/'
                                    target='_blank'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                    aria-label='LinkedIn'
                                >
                                    <svg
                                        className='w-6 h-6'
                                        fill='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path d='M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' />
                                    </svg>
                                </Link>
                                <Link
                                    href='https://linktr.ee/hopehelphumor'
                                    target='_blank'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                    aria-label='LinkTree'
                                >
                                    <svg
                                        className='w-6 h-6'
                                        fill='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path d='M13.736 5.853L12 4.117l-1.736 1.736-2.147-2.147a1 1 0 0 0-1.414 0L4.117 6.292a1 1 0 0 0 0 1.414l2.147 2.147L4.117 11.68a1 1 0 0 0 0 1.414l2.586 2.586a1 1 0 0 0 1.414 0l2.147-2.147L12 15.269l1.736-1.736 2.147 2.147a1 1 0 0 0 1.414 0l2.586-2.586a1 1 0 0 0 0-1.414l-2.147-2.147 2.147-2.147a1 1 0 0 0 0-1.414L17.297 3.586a1 1 0 0 0-1.414 0l-2.147 2.147z' />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className='text-lg font-semibold mb-4'>
                            Quick Links
                        </h3>
                        <ul className='space-y-2'>
                            <li>
                                <Link
                                    href='/'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/videos'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                >
                                    Videos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/creators'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                >
                                    Creators
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href='/blog'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                >
                                    Blog
                                </Link>
                            </li>
                            {/* Hide Conference link in Inside Mode */}
                            {!insideMode && (
                                <li>
                                    <Link
                                        href='https://hopehelphumor.com/conference/'
                                        target='_blank'
                                        className='text-gray-400 hover:text-white transition-colors duration-200'
                                    >
                                        Conference
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Contact - Modified for Inside Mode */}
                    <div>
                        <h3 className='text-lg font-semibold mb-4'>
                            Get In Touch
                        </h3>
                        {insideMode ? (
                            <p className='text-gray-400'>
                                Content provided by H3 Network
                            </p>
                        ) : (
                            <div className='space-y-2'>
                                <Link
                                    href='mailto:hopehelphumor.network@gmail.com'
                                    className='text-gray-400 hover:text-white transition-colors duration-200 block'
                                >
                                    hopehelphumor.network@gmail.com
                                </Link>
                                <div className='mt-4'>
                                    <Link
                                        href='https://hopehelphumor.com/wp-content/uploads/2025/08/H3-Network_Pitch-1.pdf'
                                        target='_blank'
                                        className='inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors duration-200'
                                    >
                                        Pitch Your Content
                                    </Link>
                                </div>
                                <div className='mt-4 pt-4 border-t border-gray-800'>
                                    <p className='text-sm text-gray-500'>
                                        Built by{' '}
                                        <Link
                                            href='mailto:james@secondchancetech.io'
                                            className='text-blue-400 hover:text-blue-300 transition-colors duration-200'
                                        >
                                            Second Chance Tech
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className='border-t border-gray-800 mt-12 pt-8'>
                    <div className='flex flex-col sm:flex-row justify-between items-center'>
                        <div className='text-center sm:text-left'>
                            <p className='text-gray-400'>
                                © Hope Help Humor, 2025. All rights reserved.
                            </p>
                            <p className='text-sm text-gray-500 mt-2'>
                                We are more than a network. We are a community!
                            </p>
                        </div>
                        <div className='mt-4 sm:mt-0'>
                            <div className='flex flex-wrap justify-center gap-6 text-sm'>
                                <Link
                                    href='/privacy'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                >
                                    Privacy Policy
                                </Link>
                                <Link
                                    href='/terms'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                >
                                    Terms of Service
                                </Link>
                                <Link
                                    href='/contact'
                                    className='text-gray-400 hover:text-white transition-colors duration-200'
                                >
                                    Contact Us
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
