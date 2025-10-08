'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    User,
    History,
    Bookmark,
    Settings,
    BarChart3,
    Shield,
} from 'lucide-react';
import { redirect } from 'next/navigation';
import ViewingHistory from '@/components/profile/ViewingHistory';
import SavedContent from '@/components/profile/SavedContent';
import AccountSettings from '@/components/profile/AccountSettings';
import UserStats from '@/components/profile/UserStats';
import PrivacySettings from '@/components/profile/PrivacySettings';

type TabType = 'overview' | 'history' | 'saved' | 'settings' | 'privacy';

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    // Handle URL tab parameter
    useEffect(() => {
        const tab = searchParams.get('tab') as TabType;
        if (
            tab &&
            ['overview', 'history', 'saved', 'settings', 'privacy'].includes(
                tab
            )
        ) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
            </div>
        );
    }

    if (!session) {
        redirect('/auth/signin');
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'history', label: 'Viewing History', icon: History },
        { id: 'saved', label: 'Saved Content', icon: Bookmark },
        { id: 'settings', label: 'Account Settings', icon: Settings },
        { id: 'privacy', label: 'Privacy', icon: Shield },
    ] as const;

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Header */}
                <div className='text-center mb-12'>
                    <h1 className='text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight'>
                        MY H3 PROFILE
                    </h1>
                    <div className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-bold mb-6'>
                        Hope • Help • Humor
                    </div>
                    <p className='text-lg text-gray-600 leading-relaxed'>
                        Track your journey through our community content and
                        manage your account
                    </p>
                </div>

                {/* User Info Card */}
                <div className='bg-white rounded-xl shadow-lg p-6 mb-8'>
                    <div className='flex items-center space-x-4'>
                        <div className='w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center'>
                            <User className='h-8 w-8 text-white' />
                        </div>
                        <div>
                            <h2 className='text-2xl font-bold text-gray-900'>
                                {session.user.name}
                            </h2>
                            <p className='text-gray-600'>
                                {session.user.email}
                            </p>
                            <div className='flex items-center mt-2'>
                                <span className='inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
                                    {session.user.role.toLowerCase()}
                                </span>
                                <span className='ml-3 text-sm text-gray-500'>
                                    H3 Network Member
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className='mb-8'>
                    <nav className='flex space-x-1 bg-white rounded-lg p-1 shadow-lg overflow-x-auto'>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() =>
                                        setActiveTab(tab.id as TabType)
                                    }
                                    className={`flex items-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                                        activeTab === tab.id
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                >
                                    <Icon className='h-5 w-5' />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className='bg-white rounded-xl shadow-lg p-6'>
                    {activeTab === 'overview' && (
                        <UserStats userId={session.user.id} />
                    )}
                    {activeTab === 'history' && (
                        <ViewingHistory userId={session.user.id} />
                    )}
                    {activeTab === 'saved' && (
                        <SavedContent userId={session.user.id} />
                    )}
                    {activeTab === 'settings' && (
                        <AccountSettings user={session.user} />
                    )}
                    {activeTab === 'privacy' && (
                        <PrivacySettings userId={session.user.id} />
                    )}
                </div>
            </div>
        </div>
    );
}
