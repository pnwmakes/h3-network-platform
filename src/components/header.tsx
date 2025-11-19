'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SearchInput } from './search-input';
import { DarkModeToggle } from './dark-mode-toggle';

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Videos', href: '/videos' },
        { name: 'Creators', href: '/creators' },
        { name: 'Search', href: '/search' },
        { name: 'Blog', href: '/blog' },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <header className='bg-white dark:bg-gray-950 shadow-lg border-b border-gray-200 dark:border-gray-800 transition-colors duration-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center h-20 gap-8'>
                    {/* Logo Section */}
                    <div className='flex items-center min-w-0'>
                        <Link href='/' className='flex items-center'>
                            <Image
                                src='/logos/H3 Logo.png'
                                alt='H3 Network - Hope, Help, Humor'
                                width={120}
                                height={40}
                                className='h-8 w-auto hover:opacity-80 transition-opacity duration-200'
                                priority
                            />
                        </Link>
                        <div className='hidden xl:block text-sm text-gray-500 dark:text-gray-300 border-l border-gray-200 dark:border-gray-800 pl-4 ml-4 transition-colors duration-200'>
                            Hope • Help • Humor
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className='hidden xl:flex space-x-8'>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap ${
                                    isActive(item.href)
                                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                        : 'text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Search Bar - Desktop */}
                    <div className='hidden xl:flex flex-1 max-w-lg justify-center'>
                        <SearchInput
                            className='w-full max-w-md'
                            placeholder='Search videos, creators, and content...'
                        />
                    </div>

                    {/* Right Side - Actions and User Menu */}
                    <div className='flex items-center space-x-6'>
                        {/* H3 Gear Shop Button */}
                        <div className='hidden lg:block'>
                            <a
                                href='https://www.astroformadesign.com/shop/55978954/h3-network'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap'
                            >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                                </svg>
                                <span>H3 Gear</span>
                            </a>
                        </div>

                        {/* Dark Mode Toggle */}
                        <div className='hidden lg:block'>
                            <DarkModeToggle />
                        </div>

                        {/* User Menu */}
                        <div className='hidden lg:flex items-center space-x-4'>

                            {session ? (
                                <div className='flex items-center space-x-4'>
                                <Link
                                    href='/profile'
                                    className={`text-sm font-medium transition-colors duration-200 ${
                                        isActive('/profile')
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'
                                    }`}
                                >
                                    Profile
                                </Link>
                                {session.user.role === 'CREATOR' && (
                                    <Link
                                        href='/creator/dashboard'
                                        className={`text-sm font-medium transition-colors duration-200 ${
                                            isActive('/creator')
                                                ? 'text-blue-600 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'
                                        }`}
                                    >
                                        Creator Dashboard
                                    </Link>
                                )}
                                {session.user.role === 'SUPER_ADMIN' && (
                                    <>
                                        <Link
                                            href='/creator/dashboard'
                                            className={`text-sm font-medium transition-colors duration-200 ${
                                                isActive('/creator')
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400'
                                            }`}
                                        >
                                            Creator Dashboard
                                        </Link>
                                        <Link
                                            href='/admin/dashboard'
                                            className={`text-sm font-medium px-2 py-1 rounded-md transition-colors duration-200 ${
                                                isActive('/admin')
                                                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/50 dark:text-red-400 dark:hover:bg-red-900'
                                            }`}
                                        >
                                            Super Admin
                                        </Link>
                                    </>
                                )}
                                <span className='text-sm font-medium text-gray-700 dark:text-gray-100 transition-colors duration-200 border-l border-gray-200 dark:border-gray-800 pl-3'>
                                    Welcome, {session.user?.name}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className='text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200'
                                >
                                    Sign Out
                                </button>
                                </div>
                            ) : (
                                <div className='flex items-center space-x-4'>
                                    <Link
                                        href='/auth/signin'
                                        className='text-sm font-medium text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200'
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href='/auth/register'
                                        className='bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200'
                                    >
                                        Join Community
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className='lg:hidden ml-auto'>
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className='text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:text-blue-600 dark:focus:text-blue-400 transition-colors duration-200'
                        >
                            <svg
                                className='h-6 w-6'
                                fill='none'
                                viewBox='0 0 24 24'
                                strokeWidth={1.5}
                                stroke='currentColor'
                            >
                                {isMobileMenuOpen ? (
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M6 18L18 6M6 6l12 12'
                                    />
                                ) : (
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        d='M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5'
                                    />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                        {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className='lg:hidden border-t border-gray-200 dark:border-gray-800 py-4 transition-colors duration-200'>
                        <div className='text-center text-xs text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-200'>
                            Hope • Help • Humor
                        </div>

                        {/* Mobile H3 Gear Button */}
                        <div className='px-3 mb-4'>
                            <a
                                href='https://www.astroformadesign.com/shop/55978954/h3-network'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-md'
                            >
                                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
                                </svg>
                                <span>Shop H3 Gear</span>
                            </a>
                        </div>

                        <div className='space-y-2'>
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                                        isActive(item.href)
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-800'
                                            : 'text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile User Menu */}
                        <div className='mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200'>
                            {session ? (
                                <div className='space-y-2'>
                                    <div className='px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-100 transition-colors duration-200'>
                                        Welcome, {session.user?.name}
                                    </div>
                                    <Link
                                        href='/profile'
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                                            isActive('/profile')
                                                ? 'text-blue-600 bg-blue-50'
                                                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                        }`}
                                    >
                                        My Profile
                                    </Link>
                                    {session.user.role === 'CREATOR' && (
                                        <Link
                                            href='/creator/dashboard'
                                            onClick={() =>
                                                setIsMobileMenuOpen(false)
                                            }
                                            className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                                                isActive('/creator')
                                                    ? 'text-blue-600 bg-blue-50'
                                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            Creator Dashboard
                                        </Link>
                                    )}
                                    {session.user.role === 'SUPER_ADMIN' && (
                                        <>
                                            <Link
                                                href='/creator/dashboard'
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                                className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                                                    isActive('/creator')
                                                        ? 'text-blue-600 bg-blue-50'
                                                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                Creator Dashboard
                                            </Link>
                                            <Link
                                                href='/admin/dashboard'
                                                onClick={() =>
                                                    setIsMobileMenuOpen(false)
                                                }
                                                className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                                                    isActive('/admin')
                                                        ? 'text-red-600 bg-red-50'
                                                        : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                                }`}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        </>
                                    )}
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className='block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200'
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            ) : (
                                <div className='space-y-2'>
                                    <Link
                                        href='/auth/signin'
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className='block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors duration-200'
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href='/auth/register'
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className='block mx-3 my-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-base font-medium hover:bg-blue-700 text-center transition-colors duration-200'
                                    >
                                        Join Our Community
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
