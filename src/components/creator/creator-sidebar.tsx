'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HomeIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    CalendarIcon,
    ChartBarIcon,
    Cog6ToothIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';

const navigation = [
    { name: 'Dashboard', href: '/creator', icon: HomeIcon },
    { name: 'Videos', href: '/creator/videos', icon: VideoCameraIcon },
    { name: 'Blog Posts', href: '/creator/blogs', icon: DocumentTextIcon },
    { name: 'Schedule', href: '/creator/schedule', icon: CalendarIcon },
    { name: 'Analytics', href: '/creator/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/creator/settings', icon: Cog6ToothIcon },
];

const quickActions = [
    {
        name: 'Upload Video',
        href: '/creator/videos/new',
        icon: VideoCameraIcon,
    },
    {
        name: 'Write Blog Post',
        href: '/creator/blogs/new',
        icon: DocumentTextIcon,
    },
    { name: 'Schedule Content', href: '/creator/schedule', icon: CalendarIcon },
];

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

export function CreatorSidebar() {
    const pathname = usePathname();
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

    return (
        <div className='flex flex-col h-screen bg-white border-r border-gray-200'>
            {/* Header */}
            <div className='flex items-center h-16 px-6 border-b border-gray-200'>
                <h2 className='text-xl font-semibold text-gray-900'>
                    Creator Studio
                </h2>
            </div>

            {/* Quick Actions */}
            <div className='p-4 border-b border-gray-200'>
                <button
                    onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                    className='flex items-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                    <PlusIcon className='w-4 h-4 mr-2' />
                    Create Content
                </button>

                {isQuickActionsOpen && (
                    <div className='mt-2 space-y-1'>
                        {quickActions.map((action) => (
                            <Link
                                key={action.name}
                                href={action.href}
                                className='flex items-center px-3 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100'
                                onClick={() => setIsQuickActionsOpen(false)}
                            >
                                <action.icon className='w-4 h-4 mr-2' />
                                {action.name}
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className='flex-1 px-4 py-4 space-y-1 overflow-y-auto'>
                {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={classNames(
                                isActive
                                    ? 'bg-blue-50 border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                                'group flex items-center pl-3 pr-2 py-2 border-l-4 text-sm font-medium'
                            )}
                        >
                            <item.icon
                                className={classNames(
                                    isActive
                                        ? 'text-blue-600'
                                        : 'text-gray-400 group-hover:text-gray-500',
                                    'mr-3 h-5 w-5'
                                )}
                                aria-hidden='true'
                            />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className='p-4 border-t border-gray-200'>
                <div className='text-xs text-gray-500'>
                    <p>H3 Network Platform</p>
                    <p>Creator Studio v1.0</p>
                </div>
            </div>
        </div>
    );
}
