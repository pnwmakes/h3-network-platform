'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ContentGrid from '@/components/ContentGrid';

export default function ContentPage() {
    const searchParams = useSearchParams();
    const [activeTab, setActiveTab] = useState(
        searchParams.get('type') || 'all'
    );
    const [activeCategory, setActiveCategory] = useState(
        searchParams.get('category') || 'all'
    );

    const categories = [
        { value: 'all', label: 'All Topics' },
        { value: 'REENTRY', label: 'Reentry' },
        { value: 'ADDICTION', label: 'Addiction' },
        { value: 'INCARCERATION', label: 'Incarceration' },
        { value: 'CRIMINAL_JUSTICE_REFORM', label: 'Criminal Justice Reform' },
        { value: 'RECOVERY', label: 'Recovery' },
        { value: 'FAMILY', label: 'Family' },
        { value: 'RELATIONSHIPS', label: 'Relationships' },
    ];

    const tabs = [
        { value: 'all', label: 'All Content', icon: '📚' },
        { value: 'video', label: 'Videos', icon: '🎥' },
        { value: 'blog', label: 'Blogs', icon: '📝' },
    ];

    useEffect(() => {
        // Update URL when filters change
        const params = new URLSearchParams();
        if (activeTab !== 'all') params.set('type', activeTab);
        if (activeCategory !== 'all') params.set('category', activeCategory);

        const newUrl = `/content${
            params.toString() ? '?' + params.toString() : ''
        }`;
        window.history.replaceState(null, '', newUrl);
    }, [activeTab, activeCategory]);

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='text-center mb-12'>
                    <h1 className='text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight'>
                        H3 NETWORK CONTENT
                    </h1>
                    <p className='text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed'>
                        Explore our complete library of videos and articles
                        covering criminal justice reform, addiction recovery,
                        and reentry support.
                    </p>
                    <div className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-bold'>
                        Hope • Help • Humor
                    </div>
                </div>

                {/* Content Type Tabs */}
                <div className='flex justify-center mb-8'>
                    <div className='bg-white rounded-lg shadow-md p-1 flex'>
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                                    activeTab === tab.value
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Category Filter */}
                <div className='mb-8'>
                    <div className='flex flex-wrap justify-center gap-2'>
                        {categories.map((category) => (
                            <button
                                key={category.value}
                                onClick={() =>
                                    setActiveCategory(category.value)
                                }
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                                    activeCategory === category.value
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-sm'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
                    <div className='bg-white rounded-lg shadow-sm p-4 text-center'>
                        <div className='text-2xl font-bold text-blue-600'>
                            🎥
                        </div>
                        <div className='text-sm text-gray-600 mt-1'>Videos</div>
                    </div>
                    <div className='bg-white rounded-lg shadow-sm p-4 text-center'>
                        <div className='text-2xl font-bold text-purple-600'>
                            📝
                        </div>
                        <div className='text-sm text-gray-600 mt-1'>
                            Blog Posts
                        </div>
                    </div>
                    <div className='bg-white rounded-lg shadow-sm p-4 text-center'>
                        <div className='text-2xl font-bold text-green-600'>
                            👥
                        </div>
                        <div className='text-sm text-gray-600 mt-1'>
                            Creators
                        </div>
                    </div>
                    <div className='bg-white rounded-lg shadow-sm p-4 text-center'>
                        <div className='text-2xl font-bold text-yellow-600'>
                            🏷️
                        </div>
                        <div className='text-sm text-gray-600 mt-1'>Topics</div>
                    </div>
                </div>

                {/* Content Grid */}
                <ContentGridWithFilters
                    contentType={activeTab}
                    category={activeCategory}
                />

                {/* Additional Navigation */}
                <div className='mt-12 text-center'>
                    <div className='bg-white rounded-xl shadow-lg p-8'>
                        <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                            Looking for something specific?
                        </h3>
                        <p className='text-gray-600 mb-6'>
                            Use our search feature to find exactly what you need
                        </p>
                        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                            <Link
                                href='/search'
                                className='inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200'
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
                                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                                    />
                                </svg>
                                Search Content
                            </Link>
                            <Link
                                href='/creators'
                                className='inline-flex items-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors duration-200 border border-blue-200'
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Content Grid component with filtering
function ContentGridWithFilters({
    contentType,
    category,
}: {
    contentType: string;
    category: string;
}) {
    const [loading, setLoading] = useState(true);
    const [content, setContent] = useState([]);
    const [pagination, setPagination] = useState<{
        page: number;
        limit: number;
        totalCount: number;
        totalPages: number;
        hasMore: boolean;
    } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                const params = new URLSearchParams({
                    limit: '12',
                    page: currentPage.toString(),
                });

                if (contentType !== 'all') {
                    params.set('type', contentType);
                }

                if (category !== 'all') {
                    params.set('category', category);
                }

                const response = await fetch(
                    `/api/content?${params.toString()}`
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch content');
                }

                const data = await response.json();
                setContent(data.content);
                setPagination(data.pagination);
            } catch (error) {
                console.error('Error fetching content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [contentType, category, currentPage]);

    if (loading) {
        return (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {Array.from({ length: 6 }, (_, i) => (
                    <div
                        key={i}
                        className='bg-white rounded-xl shadow-lg overflow-hidden animate-pulse'
                    >
                        <div className='aspect-video bg-gray-200'></div>
                        <div className='p-6'>
                            <div className='h-4 bg-gray-200 rounded mb-2'></div>
                            <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
                            <div className='flex items-center space-x-3'>
                                <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
                                <div className='h-3 bg-gray-200 rounded w-24'></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (content.length === 0) {
        return (
            <div className='text-center py-12'>
                <div className='text-gray-500 mb-4'>
                    <svg
                        className='w-16 h-16 mx-auto mb-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z'
                        />
                    </svg>
                    <p className='text-lg font-semibold'>No content found</p>
                    <p>
                        Try adjusting your filters or check back later for new
                        content.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <ContentGrid limit={12} showHeader={false} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className='flex items-center justify-center space-x-4 mt-8'>
                    <button
                        onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage <= 1}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Previous
                    </button>

                    <span className='text-sm text-gray-700'>
                        Page {currentPage} of {pagination.totalPages}
                    </span>

                    <button
                        onClick={() =>
                            setCurrentPage(
                                Math.min(pagination.totalPages, currentPage + 1)
                            )
                        }
                        disabled={currentPage >= pagination.totalPages}
                        className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
