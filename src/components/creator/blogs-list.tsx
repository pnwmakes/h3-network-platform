'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    ClockIcon,
    TagIcon,
} from '@heroicons/react/24/outline';

interface Blog {
    id: string;
    title: string;
    content: string;
    excerpt?: string | null;
    status: string;
    readTime?: number | null;
    viewCount: number;
    tags: string[];
    topic?: string | null;
    createdAt: Date;
    publishedAt: Date | null;
    scheduledAt: Date | null;
    featuredImage?: string | null;
    creator: {
        id: string;
        displayName: string;
    };
}

interface BlogsListProps {
    blogs: Blog[];
}

export function BlogsList({ blogs }: BlogsListProps) {
    const [selectedBlogs, setSelectedBlogs] = useState<string[]>([]);
    const [filter, setFilter] = useState('all');

    const filteredBlogs = blogs.filter((blog) => {
        if (filter === 'all') return true;
        return blog.status.toLowerCase() === filter.toLowerCase();
    });

    const handleSelectBlog = (blogId: string) => {
        setSelectedBlogs((prev) =>
            prev.includes(blogId)
                ? prev.filter((id) => id !== blogId)
                : [...prev, blogId]
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return (
                    <span className='inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800'>
                        Published
                    </span>
                );
            case 'DRAFT':
                return (
                    <span className='inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'>
                        Draft
                    </span>
                );
            case 'SCHEDULED':
                return (
                    <span className='inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800'>
                        Scheduled
                    </span>
                );
            default:
                return (
                    <span className='inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800'>
                        {status}
                    </span>
                );
        }
    };

    if (blogs.length === 0) {
        return (
            <div className='text-center py-12'>
                <div className='mx-auto h-12 w-12 text-gray-400'>📝</div>
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No blog posts yet
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                    Get started by writing your first blog post.
                </p>
                <div className='mt-6'>
                    <Link
                        href='/creator/blogs/new'
                        className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                    >
                        Write Blog Post
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            {/* Filter Controls */}
            <div className='border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6'>
                <div className='flex items-center justify-between'>
                    <div className='flex space-x-4'>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className='block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md'
                        >
                            <option value='all'>All Status</option>
                            <option value='published'>Published</option>
                            <option value='draft'>Drafts</option>
                            <option value='scheduled'>Scheduled</option>
                        </select>
                    </div>

                    {selectedBlogs.length > 0 && (
                        <div className='flex space-x-2'>
                            <button
                                type='button'
                                className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            >
                                Bulk Actions ({selectedBlogs.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Blogs List */}
            <ul className='divide-y divide-gray-200'>
                {filteredBlogs.map((blog) => (
                    <li key={blog.id} className='px-4 py-4 sm:px-6'>
                        <div className='flex items-start space-x-4'>
                            <input
                                type='checkbox'
                                checked={selectedBlogs.includes(blog.id)}
                                onChange={() => handleSelectBlog(blog.id)}
                                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1'
                            />

                            {/* Featured Image */}
                            {blog.featuredImage && (
                                <div className='flex-shrink-0'>
                                    <Image
                                        className='h-16 w-24 rounded-lg object-cover'
                                        src={blog.featuredImage}
                                        alt={blog.title}
                                        width={96}
                                        height={64}
                                    />
                                </div>
                            )}

                            <div className='flex-1 min-w-0'>
                                <div className='flex items-start justify-between'>
                                    <div className='flex-1'>
                                        <p className='text-sm font-medium text-gray-900 truncate'>
                                            {blog.title}
                                        </p>
                                        
                                        {blog.excerpt && (
                                            <p className='mt-1 text-sm text-gray-500 line-clamp-2'>
                                                {blog.excerpt}
                                            </p>
                                        )}

                                        <div className='mt-2 flex items-center space-x-4 text-xs text-gray-500'>
                                            <span className='flex items-center'>
                                                <ClockIcon className='h-3 w-3 mr-1' />
                                                {blog.readTime || 5} min read
                                            </span>
                                            <span className='flex items-center'>
                                                <EyeIcon className='h-3 w-3 mr-1' />
                                                {blog.viewCount} views
                                            </span>
                                            <span>
                                                {formatDistanceToNow(new Date(blog.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </span>
                                        </div>

                                        {/* Tags */}
                                        {blog.tags.length > 0 && (
                                            <div className='mt-2 flex flex-wrap gap-1'>
                                                <TagIcon className='h-3 w-3 text-gray-400 mt-0.5' />
                                                {blog.tags.slice(0, 3).map((tag, index) => (
                                                    <span
                                                        key={index}
                                                        className='inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded'
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                                {blog.tags.length > 3 && (
                                                    <span className='text-xs text-gray-500'>
                                                        +{blog.tags.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex items-center space-x-2 ml-4'>
                                        {getStatusBadge(blog.status)}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className='flex items-center space-x-2'>
                                <Link
                                    href={`/blogs/${blog.id}`}
                                    className='text-gray-400 hover:text-blue-600 transition-colors'
                                    title='View Post'
                                >
                                    <EyeIcon className='h-5 w-5' />
                                </Link>
                                <Link
                                    href={`/creator/blogs/${blog.id}/edit`}
                                    className='text-gray-400 hover:text-blue-600 transition-colors'
                                    title='Edit Post'
                                >
                                    <PencilIcon className='h-5 w-5' />
                                </Link>
                                <button
                                    type='button'
                                    className='text-gray-400 hover:text-red-600 transition-colors'
                                    title='Delete Post'
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Are you sure you want to delete this blog post?'
                                            )
                                        ) {
                                            // TODO: Implement delete functionality
                                            console.log('Delete blog:', blog.id);
                                        }
                                    }}
                                >
                                    <TrashIcon className='h-5 w-5' />
                                </button>
                            </div>
                        </div>

                        {/* Scheduled Info */}
                        {blog.status === 'SCHEDULED' && blog.scheduledAt && (
                            <div className='mt-2 ml-8 text-xs text-blue-600'>
                                Scheduled for {new Date(blog.scheduledAt).toLocaleString()}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}