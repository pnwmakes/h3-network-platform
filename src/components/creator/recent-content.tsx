import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Video {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    viewCount: number;
    show?: {
        name: string;
        description?: string | null;
        id?: string;
        createdAt?: Date;
        updatedAt?: Date;
        isActive?: boolean;
        thumbnailUrl?: string | null;
    } | null;
}

interface Blog {
    id: string;
    title: string;
    status: string;
    createdAt: Date;
    viewCount: number;
}

interface RecentContentProps {
    videos: Video[];
    blogs: Blog[];
}

export function RecentContent({ videos, blogs }: RecentContentProps) {
    return (
        <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
                <h2 className='text-lg font-medium text-gray-900'>
                    Recent Content
                </h2>
                <p className='text-sm text-gray-500'>
                    Your latest videos and blog posts
                </p>
            </div>
            <div className='p-6'>
                <div className='space-y-6'>
                    {/* Recent Videos */}
                    <div>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-sm font-medium text-gray-900'>
                                Videos
                            </h3>
                            <Link
                                href='/creator/videos'
                                className='text-sm text-blue-600 hover:text-blue-500'
                            >
                                View all
                            </Link>
                        </div>
                        <div className='space-y-3'>
                            {videos.length > 0 ? (
                                videos.map((video) => (
                                    <div
                                        key={video.id}
                                        className='flex items-center space-x-3'
                                    >
                                        <div className='flex-shrink-0'>
                                            <div className='w-16 h-12 bg-gray-200 rounded flex items-center justify-center'>
                                                <span className='text-xs text-gray-500'>
                                                    📹
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-medium text-gray-900 truncate'>
                                                {video.title}
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                {video.show?.name} •{' '}
                                                {video.viewCount.toLocaleString()}{' '}
                                                views
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                {formatDistanceToNow(
                                                    new Date(video.createdAt),
                                                    { addSuffix: true }
                                                )}
                                            </p>
                                        </div>
                                        <div className='flex-shrink-0'>
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    video.status === 'PUBLISHED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {video.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className='text-sm text-gray-500'>
                                    No videos yet
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Recent Blogs */}
                    <div>
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-sm font-medium text-gray-900'>
                                Blog Posts
                            </h3>
                            <Link
                                href='/creator/blogs'
                                className='text-sm text-blue-600 hover:text-blue-500'
                            >
                                View all
                            </Link>
                        </div>
                        <div className='space-y-3'>
                            {blogs.length > 0 ? (
                                blogs.map((blog) => (
                                    <div
                                        key={blog.id}
                                        className='flex items-center space-x-3'
                                    >
                                        <div className='flex-shrink-0'>
                                            <div className='w-16 h-12 bg-gray-200 rounded flex items-center justify-center'>
                                                <span className='text-xs text-gray-500'>
                                                    📝
                                                </span>
                                            </div>
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <p className='text-sm font-medium text-gray-900 truncate'>
                                                {blog.title}
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                {blog.viewCount.toLocaleString()}{' '}
                                                views
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                {formatDistanceToNow(
                                                    new Date(blog.createdAt),
                                                    { addSuffix: true }
                                                )}
                                            </p>
                                        </div>
                                        <div className='flex-shrink-0'>
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                    blog.status === 'PUBLISHED'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}
                                            >
                                                {blog.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className='text-sm text-gray-500'>
                                    No blog posts yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
