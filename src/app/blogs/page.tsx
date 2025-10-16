'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { PreviewNotice } from '@/components/preview-notice';

interface Blog {
    id: string;
    title: string;
    excerpt: string | null;
    featuredImage: string | null;
    viewCount: number;
    tags: string[];
    topic: string | null;
    publishedAt: string | null;
    createdAt: string;
    readTime: number | null;
    creator: {
        displayName: string;
        avatarUrl: string | null;
    };
}

export default function BlogsPage() {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Use cache-busting timestamp
            const cacheBuster = Date.now();
            console.log('Fetching blogs with cache buster:', cacheBuster);
            
            const response = await fetch(`/api/content?type=blog&limit=100&_=${cacheBuster}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch blogs');
            }
            
            const data = await response.json();
            console.log('Received blogs:', data.content.length, 'items');
            setBlogs(data.content);
        } catch (err) {
            console.error('Error fetching blogs:', err);
            setError(err instanceof Error ? err.message : 'Failed to load blogs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    const formatViewCount = (count: number) => {
        if (count >= 1000000) {
            return `${(count / 1000000).toFixed(1)}M`;
        }
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}K`;
        }
        return count.toString();
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='text-center mb-12'>
                        <h1 className='text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight transition-colors duration-200'>
                            H3 NETWORK BLOGS
                        </h1>
                        <p className='text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed transition-colors duration-200'>
                            Loading latest articles...
                        </p>
                    </div>
                    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        {Array.from({ length: 6 }, (_, i) => (
                            <div key={i} className='bg-white dark:bg-gray-900 rounded-lg shadow-md animate-pulse'>
                                <div className='aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg'></div>
                                <div className='p-6'>
                                    <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2'></div>
                                    <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4'></div>
                                    <div className='h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2'></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='text-center mb-12'>
                        <h1 className='text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight transition-colors duration-200'>
                            H3 NETWORK BLOGS
                        </h1>
                        <div className='text-red-600 dark:text-red-400 mb-4'>
                            {error}
                        </div>
                        <button
                            onClick={fetchBlogs}
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight transition-colors duration-200'>
                        H3 NETWORK BLOGS
                    </h1>
                    <p className='text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed transition-colors duration-200'>
                        In-depth articles and stories offering Hope, Help, and
                        Humor for those navigating criminal justice reform,
                        addiction recovery, and reentry challenges.
                    </p>
                    <div className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-bold mb-4'>
                        Hope • Help • Humor
                    </div>
                    <div className='mt-4'>
                        <button
                            onClick={fetchBlogs}
                            disabled={loading}
                            className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 text-sm'
                        >
                            {loading ? 'Refreshing...' : '🔄 Refresh Blogs'}
                        </button>
                    </div>
                </div>

                <PreviewNotice />

                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                    {blogs.map((blog) => (
                        <article
                            key={blog.id}
                            className='group bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-300'
                        >
                            <Link href={`/blogs/${blog.id}`} className='block'>
                                {/* Featured Image */}
                                <div className='relative aspect-video rounded-t-lg overflow-hidden'>
                                    {blog.featuredImage ? (
                                        <Image
                                            src={blog.featuredImage}
                                            alt={blog.title}
                                            fill
                                            className='object-cover group-hover:scale-105 transition-transform duration-300'
                                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                        />
                                    ) : (
                                        <div className='w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 flex items-center justify-center'>
                                            <svg
                                                className='w-16 h-16 text-purple-500 dark:text-purple-400'
                                                fill='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z' />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Blog Badge */}
                                    <div className='absolute top-3 left-3'>
                                        <span className='bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold'>
                                            Blog
                                        </span>
                                    </div>

                                    {/* Read Time */}
                                    {blog.readTime && (
                                        <div className='absolute bottom-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs'>
                                            {blog.readTime} min read
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className='p-6'>
                                    <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2'>
                                        {blog.title}
                                    </h2>

                                    {/* Excerpt */}
                                    {blog.excerpt && (
                                        <p className='text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 transition-colors duration-200'>
                                            {blog.excerpt}
                                        </p>
                                    )}

                                    {/* Author and Date */}
                                    <div className='flex items-center justify-between mb-4'>
                                        <div className='flex items-center space-x-3'>
                                            {blog.creator.avatarUrl ? (
                                                <Image
                                                    src={blog.creator.avatarUrl}
                                                    alt={
                                                        blog.creator.displayName
                                                    }
                                                    width={32}
                                                    height={32}
                                                    className='rounded-full'
                                                />
                                            ) : (
                                                <div className='w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center'>
                                                    <span className='text-gray-600 dark:text-gray-300 text-sm font-semibold'>
                                                        {blog.creator.displayName.charAt(
                                                            0
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                                                    {blog.creator.displayName}
                                                </p>
                                                <div className='flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400'>
                                                    <span>
                                                        {blog.publishedAt
                                                            ? formatDistanceToNow(
                                                                  new Date(
                                                                      blog.publishedAt
                                                                  ),
                                                                  {
                                                                      addSuffix:
                                                                          true,
                                                                  }
                                                              )
                                                            : 'Recently'}
                                                    </span>
                                                    <span>•</span>
                                                    <span>
                                                        {formatViewCount(
                                                            blog.viewCount
                                                        )}{' '}
                                                        views
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Topic */}
                                    {blog.topic && (
                                        <div className='mb-3'>
                                            <span className='inline-block bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs font-medium'>
                                                {blog.topic
                                                    .replace('_', ' ')
                                                    .toLowerCase()}
                                            </span>
                                        </div>
                                    )}

                                    {/* Tags */}
                                    {blog.tags.length > 0 && (
                                        <div className='flex flex-wrap gap-2'>
                                            {blog.tags
                                                .slice(0, 3)
                                                .map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className='px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full'
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                            {blog.tags.length > 3 && (
                                                <span className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full'>
                                                    +{blog.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>

                {blogs.length === 0 && (
                    <div className='text-center py-12'>
                        <div className='text-gray-500 dark:text-gray-400 mb-4'>
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
                                    d='M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
                                />
                            </svg>
                            <p className='text-lg font-semibold'>
                                No blog posts available yet
                            </p>
                            <p className='text-gray-600 dark:text-gray-300'>
                                Check back soon for new content!
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
