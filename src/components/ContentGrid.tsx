'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Creator {
    displayName: string;
    avatarUrl: string | null;
}

interface ContentItem {
    id: string;
    title: string;
    description: string | null;
    type: 'video' | 'blog';
    creator: Creator;
    publishedAt: string | null;
    thumbnailUrl?: string | null;
    featuredImage?: string | null;
    readTime?: number | null;
    viewCount: number;
    tags: string[];
}

interface ContentGridProps {
    limit?: number;
    showHeader?: boolean;
    className?: string;
}

export default function ContentGrid({
    limit = 6,
    showHeader = true,
    className = '',
}: ContentGridProps) {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                setLoading(true);
                // Add cache-busting timestamp to ensure fresh data
                const cacheBuster = Date.now();
                const response = await fetch(
                    `/api/content?limit=${limit}&_=${cacheBuster}`,
                    {
                        cache: 'no-store',
                    }
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch content');
                }
                const data = await response.json();
                setContent(data.content);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load content'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchContent();
    }, [limit]);

    const refetchContent = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/content?limit=${limit}`);
            if (!response.ok) {
                throw new Error('Failed to fetch content');
            }
            const data = await response.json();
            setContent(data.content);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Failed to load content'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Recently';
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatViewCount = (count: number) => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    if (loading) {
        return (
            <div className={`space-y-8 ${className}`}>
                {showHeader && (
                    <div className='text-center'>
                        <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                            Latest Content
                        </h2>
                        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                            Discover the latest videos and blogs from our H3
                            Network creators
                        </p>
                    </div>
                )}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                    {Array.from({ length: limit }, (_, i) => (
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
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center py-12 ${className}`}>
                <div className='text-red-600 mb-4'>
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
                            d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                    </svg>
                    <p className='text-lg font-semibold'>
                        Unable to load content
                    </p>
                    <p className='text-gray-600'>{error}</p>
                </div>
                <button
                    onClick={refetchContent}
                    className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (content.length === 0) {
        return (
            <div className={`text-center py-12 ${className}`}>
                {showHeader && (
                    <div className='mb-8'>
                        <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                            Latest Content
                        </h2>
                        <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                            Discover the latest videos and blogs from our H3
                            Network creators
                        </p>
                    </div>
                )}
                <div className='text-gray-600'>
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
                    <p className='text-lg font-semibold'>
                        No content available yet
                    </p>
                    <p>Check back soon for new videos and blogs!</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`space-y-8 ${className}`}>
            {showHeader && (
                <div className='text-center'>
                    <h2 className='text-4xl font-bold text-gray-900 mb-4'>
                        Latest Content
                    </h2>
                    <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                        Discover the latest videos and blogs from our H3 Network
                        creators
                    </p>
                </div>
            )}

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {content.map((item) => (
                    <Link
                        key={item.id}
                        href={`/${item.type === 'video' ? 'videos' : 'blogs'}/${
                            item.id
                        }`}
                        className='group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1'
                    >
                        {/* Thumbnail/Featured Image */}
                        <div className='aspect-video bg-gray-200 relative overflow-hidden'>
                            {item.type === 'video' && item.thumbnailUrl ? (
                                <Image
                                    src={item.thumbnailUrl}
                                    alt={item.title}
                                    fill
                                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                                />
                            ) : item.type === 'blog' && item.featuredImage ? (
                                <Image
                                    src={item.featuredImage}
                                    alt={item.title}
                                    fill
                                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                                />
                            ) : (
                                <div className='w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center'>
                                    {item.type === 'video' ? (
                                        <svg
                                            className='w-16 h-16 text-blue-500'
                                            fill='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path d='M8 5v14l11-7z' />
                                        </svg>
                                    ) : (
                                        <svg
                                            className='w-16 h-16 text-purple-500'
                                            fill='currentColor'
                                            viewBox='0 0 24 24'
                                        >
                                            <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' />
                                        </svg>
                                    )}
                                </div>
                            )}

                            {/* Content Type Badge */}
                            <div className='absolute top-3 left-3'>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        item.type === 'video'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-purple-500 text-white'
                                    }`}
                                >
                                    {item.type === 'video' ? 'Video' : 'Blog'}
                                </span>
                            </div>

                            {/* View Count */}
                            <div className='absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs'>
                                {formatViewCount(item.viewCount)} views
                            </div>
                        </div>

                        {/* Content */}
                        <div className='p-6'>
                            <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2'>
                                {item.title}
                            </h3>

                            {item.description && (
                                <p className='text-gray-600 mb-4 line-clamp-2'>
                                    {item.description}
                                </p>
                            )}

                            {/* Creator and Date */}
                            <div className='flex items-center justify-between mb-3'>
                                <div className='flex items-center space-x-3'>
                                    {item.creator.avatarUrl ? (
                                        <Image
                                            src={item.creator.avatarUrl}
                                            alt={item.creator.displayName}
                                            width={32}
                                            height={32}
                                            className='rounded-full'
                                        />
                                    ) : (
                                        <div className='w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center'>
                                            <span className='text-gray-600 text-sm font-semibold'>
                                                {item.creator.displayName.charAt(
                                                    0
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <span className='text-sm text-gray-700 font-medium'>
                                        {item.creator.displayName}
                                    </span>
                                </div>
                                <span className='text-sm text-gray-500'>
                                    {formatDate(item.publishedAt)}
                                </span>
                            </div>

                            {/* Tags */}
                            {item.tags.length > 0 && (
                                <div className='flex flex-wrap gap-2'>
                                    {item.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {item.tags.length > 3 && (
                                        <span className='px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full'>
                                            +{item.tags.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Read Time for Blogs */}
                            {item.type === 'blog' && item.readTime && (
                                <div className='mt-3 text-sm text-gray-500'>
                                    {item.readTime} min read
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>

            {/* View All Link */}
            {content.length >= limit && (
                <div className='text-center'>
                    <Link
                        href='/content'
                        className='inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg'
                    >
                        View All Content
                        <svg
                            className='w-5 h-5 ml-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M17 8l4 4m0 0l-4 4m4-4H3'
                            />
                        </svg>
                    </Link>
                </div>
            )}
        </div>
    );
}
