import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Eye, User, Clock, Tag } from 'lucide-react';

async function getBlogs() {
    try {
        return await prisma.blog.findMany({
            where: {
                status: 'PUBLISHED',
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
            },
            orderBy: {
                publishedAt: 'desc',
            },
        });
    } catch (error) {
        console.warn('Database not available, returning empty blogs list:', error);
        return [];
    }
}

function formatTopic(topic: string): string {
    return topic
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

export default async function BlogPage() {
    const blogs = await getBlogs();

    return (
        <div className='min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-200'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Header */}
                <div className='text-center mb-12'>
                    <h1 className='text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tight transition-colors duration-200'>
                        H3 NETWORK BLOG
                    </h1>
                    <p className='text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed transition-colors duration-200'>
                        Stories of Hope, Help, and Humor from our community
                        of justice-impacted individuals, advocates, and
                        experts in criminal justice reform, addiction
                        recovery, and reentry support.
                    </p>
                    <div className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-bold'>
                        Hope • Help • Humor
                    </div>
                </div>

                {/* Blog Posts Grid */}
                {blogs.length > 0 ? (
                    <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                        {blogs.map((blog) => (
                            <article
                                key={blog.id}
                                className='group bg-white dark:bg-gray-900 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'
                            >
                                <Link href={`/blog/${blog.id}`}>
                                    {/* Featured Image */}
                                    <div className='relative aspect-video overflow-hidden'>
                                        <Image
                                            src={
                                                blog.featuredImage ||
                                                '/placeholder-blog.svg'
                                            }
                                            alt={blog.title}
                                            fill
                                            className='object-cover group-hover:scale-105 transition-transform duration-300'
                                            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                        />
                                        
                                        {/* Topic Badge */}
                                        {blog.topic && (
                                            <div className='absolute top-4 left-4'>
                                                <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                                    {formatTopic(blog.topic)}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className='p-6'>
                                        {/* Title */}
                                        <h2 className='text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                                            {blog.title}
                                        </h2>

                                        {/* Excerpt */}
                                        {blog.excerpt && (
                                            <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                                                {blog.excerpt}
                                            </p>
                                        )}

                                        {/* Author & Meta */}
                                        <div className='flex items-center space-x-3 mb-4'>
                                            <div className='flex items-center space-x-2'>
                                                {blog.creator.avatarUrl ? (
                                                    <Image
                                                        src={blog.creator.avatarUrl}
                                                        alt={blog.creator.displayName}
                                                        width={32}
                                                        height={32}
                                                        className='rounded-full'
                                                    />
                                                ) : (
                                                    <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
                                                        <User className='h-4 w-4 text-gray-400' />
                                                    </div>
                                                )}
                                                <span className='text-sm font-medium text-gray-700'>
                                                    {blog.creator.displayName}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Post Meta */}
                                        <div className='flex items-center justify-between text-xs text-gray-500'>
                                            <div className='flex items-center space-x-4'>
                                                {blog.publishedAt && (
                                                    <div className='flex items-center space-x-1'>
                                                        <Calendar className='h-3 w-3' />
                                                        <span>
                                                            {formatDistanceToNow(
                                                                new Date(blog.publishedAt),
                                                                { addSuffix: true }
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                
                                                <div className='flex items-center space-x-1'>
                                                    <Clock className='h-3 w-3' />
                                                    <span>
                                                        {calculateReadTime(blog.content)} min read
                                                    </span>
                                                </div>
                                                
                                                <div className='flex items-center space-x-1'>
                                                    <Eye className='h-3 w-3' />
                                                    <span>{blog.viewCount} views</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {blog.tags.length > 0 && (
                                            <div className='mt-4 flex flex-wrap gap-1'>
                                                {blog.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className='inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs'
                                                    >
                                                        <Tag className='h-3 w-3' />
                                                        {tag}
                                                    </span>
                                                ))}
                                                {blog.tags.length > 3 && (
                                                    <span className='text-xs text-gray-500 px-2 py-1'>
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
                ) : (
                    <div className='text-center py-12'>
                        <div className='mb-6'>
                            <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <User className='h-8 w-8 text-gray-400' />
                            </div>
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                No blog posts yet
                            </h3>
                            <p className='text-gray-600'>
                                Check back soon for inspiring stories and insights from our H3 Network community.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}