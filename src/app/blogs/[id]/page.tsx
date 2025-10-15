'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Blog {
    id: string;
    title: string;
    content: string;
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
        bio: string | null;
    };
    guestContributors: string[];
    guestBios: string[];
}

export default function BlogPage() {
    const params = useParams();
    const blogId = params.id as string;
    const [blog, setBlog] = useState<Blog | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`/api/blogs/${blogId}`);
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Blog post not found');
                    }
                    throw new Error('Failed to fetch blog post');
                }
                const data = await response.json();
                setBlog(data);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to load blog post'
                );
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedBlogs = async () => {
            try {
                const response = await fetch(`/api/content?type=blog&limit=3`);
                if (response.ok) {
                    const data = await response.json();
                    setRelatedBlogs(
                        data.content.filter((b: Blog) => b.id !== blogId)
                    );
                }
            } catch (err) {
                console.error('Failed to fetch related blogs:', err);
            }
        };

        if (blogId) {
            fetchBlog();
            fetchRelatedBlogs();
        }
    }, [blogId]);

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Recently';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

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
            <div className='min-h-screen bg-gray-50 py-8'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='animate-pulse'>
                        <div className='aspect-video bg-gray-200 rounded-xl mb-8'></div>
                        <div className='h-10 bg-gray-200 rounded mb-4'></div>
                        <div className='h-4 bg-gray-200 rounded w-3/4 mb-6'></div>
                        <div className='space-y-3 mb-6'>
                            <div className='h-4 bg-gray-200 rounded'></div>
                            <div className='h-4 bg-gray-200 rounded'></div>
                            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
                        </div>
                        <div className='flex items-center space-x-4'>
                            <div className='w-12 h-12 bg-gray-200 rounded-full'></div>
                            <div className='space-y-2'>
                                <div className='h-4 bg-gray-200 rounded w-32'></div>
                                <div className='h-3 bg-gray-200 rounded w-24'></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div className='min-h-screen bg-gray-50 py-8'>
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='text-center py-12'>
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
                            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                                {error === 'Blog post not found'
                                    ? 'Blog Post Not Found'
                                    : 'Unable to Load Blog Post'}
                            </h1>
                            <p className='text-gray-600'>{error}</p>
                        </div>
                        <Link
                            href='/blogs'
                            className='px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        >
                            Browse All Blogs
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Breadcrumb */}
                <nav className='mb-6'>
                    <div className='flex items-center space-x-2 text-sm text-gray-600'>
                        <Link href='/' className='hover:text-blue-600'>
                            Home
                        </Link>
                        <span>/</span>
                        <Link href='/blogs' className='hover:text-blue-600'>
                            Blogs
                        </Link>
                        <span>/</span>
                        <span className='text-gray-900 font-medium truncate'>
                            {blog.title}
                        </span>
                    </div>
                </nav>

                <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
                    {/* Main Content */}
                    <div className='lg:col-span-3'>
                        <article className='bg-white rounded-xl shadow-lg overflow-hidden'>
                            {/* Featured Image */}
                            {blog.featuredImage && (
                                <div className='aspect-video relative'>
                                    <Image
                                        src={blog.featuredImage}
                                        alt={blog.title}
                                        fill
                                        className='object-cover'
                                        priority
                                    />
                                </div>
                            )}

                            <div className='p-8'>
                                {/* Article Header */}
                                <header className='mb-8'>
                                    {/* Topic Badge */}
                                    {blog.topic && (
                                        <div className='mb-4'>
                                            <span className='px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full'>
                                                {blog.topic
                                                    .replace('_', ' ')
                                                    .toLowerCase()}
                                            </span>
                                        </div>
                                    )}

                                    <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight'>
                                        {blog.title}
                                    </h1>

                                    {/* Excerpt */}
                                    {blog.excerpt && (
                                        <p className='text-xl text-gray-600 mb-6 leading-relaxed'>
                                            {blog.excerpt}
                                        </p>
                                    )}

                                    {/* Meta Info */}
                                    <div className='flex items-center justify-between border-b border-gray-200 pb-6'>
                                        <div className='flex items-center space-x-4'>
                                            {blog.creator.avatarUrl ? (
                                                <Image
                                                    src={blog.creator.avatarUrl}
                                                    alt={
                                                        blog.creator.displayName
                                                    }
                                                    width={48}
                                                    height={48}
                                                    className='rounded-full'
                                                />
                                            ) : (
                                                <div className='w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center'>
                                                    <span className='text-gray-600 font-semibold'>
                                                        {blog.creator.displayName.charAt(
                                                            0
                                                        )}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className='font-semibold text-gray-900'>
                                                    {blog.creator.displayName}
                                                </h3>
                                                <div className='flex items-center space-x-3 text-sm text-gray-600'>
                                                    <span>
                                                        {formatDate(
                                                            blog.publishedAt
                                                        )}
                                                    </span>
                                                    {blog.readTime && (
                                                        <>
                                                            <span>•</span>
                                                            <span>
                                                                {blog.readTime}{' '}
                                                                min read
                                                            </span>
                                                        </>
                                                    )}
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

                                        {/* Share/Save Actions */}
                                        <div className='flex items-center space-x-3'>
                                            <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors'>
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
                                                        d='M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
                                                    />
                                                </svg>
                                            </button>
                                            <button className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors'>
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
                                                        d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </header>

                                {/* Article Content */}
                                <div className='prose prose-lg prose-gray max-w-none'>
                                    <div
                                        className='text-gray-700 leading-relaxed'
                                        dangerouslySetInnerHTML={{
                                            __html: blog.content,
                                        }}
                                    />
                                </div>

                                {/* Contributors */}
                                {blog.guestContributors.length > 0 && (
                                    <div className='mt-8 pt-8 border-t border-gray-200'>
                                        <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                                            Contributors
                                        </h3>
                                        <div className='space-y-4'>
                                            {blog.guestContributors.map(
                                                (contributor, index) => (
                                                    <div
                                                        key={index}
                                                        className='flex items-start space-x-3'
                                                    >
                                                        <div className='w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center'>
                                                            <span className='text-gray-600 text-sm font-medium'>
                                                                {contributor.charAt(
                                                                    0
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className='font-medium text-gray-900'>
                                                                {contributor}
                                                            </p>
                                                            {blog.guestBios[
                                                                index
                                                            ] && (
                                                                <p className='text-sm text-gray-600 mt-1'>
                                                                    {
                                                                        blog
                                                                            .guestBios[
                                                                            index
                                                                        ]
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Tags */}
                                {blog.tags.length > 0 && (
                                    <div className='mt-8 pt-8 border-t border-gray-200'>
                                        <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                                            Tags
                                        </h3>
                                        <div className='flex flex-wrap gap-2'>
                                            {blog.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className='px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 cursor-pointer transition-colors'
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </article>
                    </div>

                    {/* Sidebar */}
                    <div className='lg:col-span-1'>
                        {/* Creator Info */}
                        <div className='bg-white rounded-xl shadow-lg p-6 mb-6'>
                            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                                About the Author
                            </h3>
                            <div className='text-center'>
                                {blog.creator.avatarUrl ? (
                                    <Image
                                        src={blog.creator.avatarUrl}
                                        alt={blog.creator.displayName}
                                        width={64}
                                        height={64}
                                        className='rounded-full mx-auto mb-4'
                                    />
                                ) : (
                                    <div className='w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4'>
                                        <span className='text-gray-600 text-xl font-semibold'>
                                            {blog.creator.displayName.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                <h4 className='font-semibold text-gray-900 mb-2'>
                                    {blog.creator.displayName}
                                </h4>
                                {blog.creator.bio && (
                                    <p className='text-sm text-gray-600 mb-4 text-center'>
                                        {blog.creator.bio}
                                    </p>
                                )}
                                <Link
                                    href={`/creators/${blog.creator.displayName
                                        .toLowerCase()
                                        .replace(/\s+/g, '-')}`}
                                    className='text-blue-600 text-sm hover:text-blue-700 font-medium'
                                >
                                    View All Posts →
                                </Link>
                            </div>
                        </div>

                        {/* Related Blogs */}
                        {relatedBlogs.length > 0 && (
                            <div className='bg-white rounded-xl shadow-lg p-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                                    Related Posts
                                </h3>
                                <div className='space-y-4'>
                                    {relatedBlogs.map((relatedBlog) => (
                                        <Link
                                            key={relatedBlog.id}
                                            href={`/blogs/${relatedBlog.id}`}
                                            className='block group hover:bg-gray-50 p-3 rounded-lg transition-colors'
                                        >
                                            <div className='flex space-x-3'>
                                                {relatedBlog.featuredImage && (
                                                    <div className='w-16 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0'>
                                                        <Image
                                                            src={
                                                                relatedBlog.featuredImage
                                                            }
                                                            alt={
                                                                relatedBlog.title
                                                            }
                                                            width={64}
                                                            height={64}
                                                            className='object-cover w-full h-full'
                                                        />
                                                    </div>
                                                )}
                                                <div className='flex-1 min-w-0'>
                                                    <h4 className='text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600'>
                                                        {relatedBlog.title}
                                                    </h4>
                                                    <p className='text-xs text-gray-600 mt-1'>
                                                        {
                                                            relatedBlog.creator
                                                                .displayName
                                                        }
                                                    </p>
                                                    <div className='flex items-center text-xs text-gray-500 mt-1 space-x-2'>
                                                        <span>
                                                            {formatViewCount(
                                                                relatedBlog.viewCount
                                                            )}{' '}
                                                            views
                                                        </span>
                                                        {relatedBlog.readTime && (
                                                            <>
                                                                <span>•</span>
                                                                <span>
                                                                    {
                                                                        relatedBlog.readTime
                                                                    }{' '}
                                                                    min read
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                                <Link
                                    href='/blogs'
                                    className='block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4 pt-4 border-t border-gray-200'
                                >
                                    View All Blogs →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
