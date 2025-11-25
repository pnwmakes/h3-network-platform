'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { SearchInput } from './search-input';
import { DarkModeToggle } from './dark-mode-toggle';

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

    // Handle escape key to close search modal
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsSearchModalOpen(false);
            }
        };

        if (isSearchModalOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isSearchModalOpen]);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Videos', href: '/videos' },
        { name: 'Creators', href: '/creators' },
        { name: 'Blog', href: '/blog' },
    ];

    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
            <header className='bg-white dark:bg-gray-950 shadow-lg border-b border-gray-200 dark:border-gray-800 transition-colors duration-200'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center h-20'>
                        {/* Logo */}
                        <Link
                            href='/'
                            className='flex items-center flex-shrink-0 mr-8'
                        >
                            <Image
                                src='/logos/H3 Logo.png'
                                alt='H3 Network - Hope, Help, Humor'
                                width={120}
                                height={40}
                                className='h-8 w-auto hover:opacity-80 transition-opacity duration-200'
                                priority
                            />
                        </Link>
                        {/* Navigation - Hidden on mobile, shown on desktop */}
                        <nav className='hidden lg:flex items-center space-x-1 mr-auto'>
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap rounded-md ${
                                        isActive(item.href)
                                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                                            : 'text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {/* Search Icon - Part of navigation */}
                            <button
                                onClick={() => setIsSearchModalOpen(true)}
                                className='p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 ml-1'
                                title='Search videos, creators, and content'
                            >
                                <svg
                                    className='w-5 h-5'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                >
                                    <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                    />
                                </svg>
                            </button>
                        </nav>{' '}
                        {/* Right side items */}
                        <div className='flex items-center space-x-3'>
                            {/* H3 Gear Shop Button */}
                            <div className='hidden lg:block'>
                                <a
                                    href='https://www.astroformadesign.com/shop/55978954/h3-network'
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap'
                                >
                                    <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                                        />
                                    </svg>
                                    <span>H3 Gear</span>
                                </a>
                            </div>

                            {/* Dark Mode Toggle */}
                            <div className='hidden lg:block'>
                                <DarkModeToggle />
                            </div>

                            {/* User Menu */}
                            <div className='hidden lg:flex items-center space-x-3'>
                                {session ? (
                                    <div className='flex items-center space-x-3'>
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
                                        {session.user.role ===
                                            'SUPER_ADMIN' && (
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
                                            onClick={() => {
                                                signOut({
                                                    redirect: true,
                                                    callbackUrl: '/',
                                                });
                                            }}
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
                        <div className='lg:hidden ml-auto flex-shrink-0'>
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
                                    <svg
                                        className='w-4 h-4'
                                        fill='none'
                                        stroke='currentColor'
                                        viewBox='0 0 24 24'
                                    >
                                        <path
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            strokeWidth={2}
                                            d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
                                        />
                                    </svg>
                                    <span>Shop H3 Gear</span>
                                </a>
                            </div>

                            <div className='space-y-2'>
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
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
                                        {session.user.role ===
                                            'SUPER_ADMIN' && (
                                            <>
                                                <Link
                                                    href='/creator/dashboard'
                                                    onClick={() =>
                                                        setIsMobileMenuOpen(
                                                            false
                                                        )
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
                                                        setIsMobileMenuOpen(
                                                            false
                                                        )
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
                                                setIsMobileMenuOpen(false);
                                                signOut({
                                                    redirect: true,
                                                    callbackUrl: '/',
                                                });
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

            {/* Search Modal */}
            {isSearchModalOpen && (
                <div className='fixed inset-0 z-50 overflow-y-auto'>
                    {/* Backdrop */}
                    <div
                        className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
                        onClick={() => setIsSearchModalOpen(false)}
                    />

                    {/* Modal Content */}
                    <div className='flex min-h-full items-start justify-center p-4 text-center sm:p-0'>
                        <div className='relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6 mt-20'>
                            {/* Modal Header */}
                            <div className='flex items-center justify-between mb-4'>
                                <h3 className='text-lg font-medium text-gray-900 dark:text-white'>
                                    Search H3 Network
                                </h3>
                                <button
                                    onClick={() => setIsSearchModalOpen(false)}
                                    className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors'
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
                            </div>

                            {/* Search Input */}
                            <div className='mb-4'>
                                <SearchInput
                                    className='w-full'
                                    placeholder='Search videos, creators, and content...'
                                    autoFocus
                                />
                            </div>

                            {/* Quick Actions */}
                            <div className='text-sm text-gray-500 dark:text-gray-400'>
                                <p>
                                    Press{' '}
                                    <kbd className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs'>
                                        Enter
                                    </kbd>{' '}
                                    to search or{' '}
                                    <kbd className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs'>
                                        Esc
                                    </kbd>{' '}
                                    to close
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
