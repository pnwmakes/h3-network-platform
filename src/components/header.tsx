'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { SearchWithAutocomplete } from './search-with-autocomplete';

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Home', href: '/' },
        { name: 'Videos', href: '/videos' },
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
        <header className='bg-white shadow-sm border-b border-gray-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-center h-16'>
                    {/* Logo */}
                    <div className='flex-shrink-0'>
                        <Link href='/' className='flex items-center'>
                            <div className='text-2xl font-bold text-blue-600'>
                                H3 Network
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className='hidden md:flex space-x-8'>
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                                    isActive(item.href)
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-700 hover:text-blue-600'
                                }`}
                            >
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Search Bar - Desktop */}
                    <div className='hidden lg:flex flex-1 max-w-lg mx-8'>
                        <SearchWithAutocomplete 
                            placeholder='Search...'
                            showFilters={false}
                            compact={true}
                        />
                    </div>                    {/* User Menu */}
                    <div className='hidden md:flex items-center space-x-4'>
                        {session ? (
                            <div className='flex items-center space-x-4'>
                                <span className='text-sm text-gray-700'>
                                    Welcome, {session.user?.name}
                                </span>
                                <button
                                    onClick={() => signOut()}
                                    className='text-sm text-gray-700 hover:text-blue-600 transition-colors'
                                >
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <div className='flex items-center space-x-4'>
                                <Link
                                    href='/auth/signin'
                                    className='text-sm text-gray-700 hover:text-blue-600 transition-colors'
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href='/auth/register'
                                    className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors'
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className='md:hidden'>
                        <button
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                            className='text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600'
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
                    <div className='md:hidden border-t border-gray-200 py-4'>
                        <div className='space-y-2'>
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                                        isActive(item.href)
                                            ? 'text-blue-600 bg-blue-50'
                                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Mobile User Menu */}
                        <div className='mt-4 pt-4 border-t border-gray-200'>
                            {session ? (
                                <div className='space-y-2'>
                                    <div className='px-3 py-2 text-sm text-gray-700'>
                                        Welcome, {session.user?.name}
                                    </div>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className='block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50'
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
                                        className='block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href='/auth/register'
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className='block mx-3 my-2 bg-blue-600 text-white px-4 py-2 rounded-md text-base font-medium hover:bg-blue-700 text-center'
                                    >
                                        Get Started
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
