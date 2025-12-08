import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BackButton } from '@/components/back-button';
import { FollowButton } from '@/components/ui/FollowButton';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { isInsideMode } from '@/lib/inside-mode';
import {
    Users,
    Video,
    FileText,
    Eye,
    Calendar,
    Linkedin,
    Instagram,
    Globe,
    ExternalLink,
} from 'lucide-react';

interface CreatorPageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getCreator(id: string) {
    try {
        return await prisma.creator.findUnique({
            where: {
                id,
                isActive: true,
            },
            include: {
                user: true,
                videos: {
                    where: {
                        status: 'PUBLISHED',
                    },
                    include: {
                        show: true,
                    },
                    orderBy: {
                        publishedAt: 'desc',
                    },
                },
                blogs: {
                    where: {
                        status: 'PUBLISHED',
                    },
                    orderBy: {
                        publishedAt: 'desc',
                    },
                },
                _count: {
                    select: {
                        followers: true,
                    },
                },
            },
        });
    } catch (error) {
        console.warn('Database not available:', error);
        return null;
    }
}

// Force revalidation to ensure fresh data
export const revalidate = 0;

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default async function CreatorPage({ params }: CreatorPageProps) {
    const { id } = await params;
    const creator = await getCreator(id);

    // Check if we're in Inside Mode
    const insideMode = isInsideMode();

    if (!creator) {
        notFound();
    }

    // Calculate stats
    const totalVideos = creator.videos.length;
    const totalBlogs = creator.blogs.length;
    const totalViews =
        creator.videos.reduce((sum, video) => sum + video.viewCount, 0) +
        creator.blogs.reduce((sum, blog) => sum + blog.viewCount, 0);
    const totalWatchTime = creator.videos.reduce(
        (sum, video) => sum + (video.duration || 0),
        0
    );

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <BackButton href='/creators' label='Back to Creators' />

                {/* Creator Header */}
                <div className='bg-white rounded-xl shadow-lg overflow-hidden mb-8'>
                    <div className='relative h-48 bg-gradient-to-br from-blue-100 via-purple-100 to-green-100'>
                        <div className='absolute inset-0 bg-black bg-opacity-20'></div>
                        <div className='absolute bottom-6 left-6 flex items-end space-x-6'>
                            {/* Creator Avatar */}
                            <div className='relative'>
                                {creator.avatarUrl ? (
                                    <Image
                                        src={creator.avatarUrl}
                                        alt={creator.displayName}
                                        width={120}
                                        height={120}
                                        className='rounded-full border-4 border-white shadow-lg object-cover'
                                    />
                                ) : (
                                    <div className='w-30 h-30 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
                                        <span className='text-3xl font-bold text-gray-600'>
                                            {creator.displayName
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Creator Info */}
                            <div className='text-white mb-4'>
                                <h1 className='text-3xl font-bold mb-2'>
                                    {creator.displayName}
                                </h1>
                                {creator.showName && (
                                    <p className='text-lg opacity-90 mb-2'>
                                        {creator.showName}
                                    </p>
                                )}
                                <div className='flex items-center space-x-4 text-sm opacity-75'>
                                    <span className='flex items-center'>
                                        <Calendar className='h-4 w-4 mr-1' />
                                        Joined{' '}
                                        {formatDistanceToNow(
                                            new Date(creator.createdAt),
                                            { addSuffix: true }
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className='p-6'>
                        {/* Follow Button */}
                        <div className='mb-6 pb-6 border-b border-gray-200'>
                            <FollowButton
                                creatorId={creator.id}
                                initialFollowerCount={creator._count.followers}
                                size='lg'
                            />
                        </div>

                        {/* Creator Bio */}
                        {creator.bio && (
                            <div className='mb-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                                    About
                                </h3>
                                <p className='text-gray-700 leading-relaxed'>
                                    {creator.bio}
                                </p>
                            </div>
                        )}

                        {/* Fun Fact */}
                        {creator.funnyFact && (
                            <div className='mb-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                                    Fun Fact
                                </h3>
                                <p className='text-gray-700 leading-relaxed italic'>
                                    {creator.funnyFact}
                                </p>
                            </div>
                        )}

                        {/* Social Media Links - Hidden in Inside Mode */}
                        {!insideMode &&
                            (creator.linkedinUrl ||
                                creator.instagramUrl ||
                                creator.tiktokUrl ||
                                creator.websiteUrl) && (
                                <div className='mb-6'>
                                    <h3 className='text-lg font-semibold text-gray-900 mb-3'>
                                        Connect with {creator.displayName}
                                    </h3>
                                    <div className='flex flex-wrap gap-3'>
                                        {creator.linkedinUrl && (
                                            <a
                                                href={creator.linkedinUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors'
                                            >
                                                <Linkedin className='h-4 w-4' />
                                                LinkedIn
                                                <ExternalLink className='h-3 w-3' />
                                            </a>
                                        )}
                                        {creator.instagramUrl && (
                                            <a
                                                href={creator.instagramUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-lg hover:bg-pink-200 transition-colors'
                                            >
                                                <Instagram className='h-4 w-4' />
                                                Instagram
                                                <ExternalLink className='h-3 w-3' />
                                            </a>
                                        )}
                                        {creator.tiktokUrl && (
                                            <a
                                                href={creator.tiktokUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
                                            >
                                                <Video className='h-4 w-4' />
                                                TikTok
                                                <ExternalLink className='h-3 w-3' />
                                            </a>
                                        )}
                                        {creator.websiteUrl && (
                                            <a
                                                href={creator.websiteUrl}
                                                target='_blank'
                                                rel='noopener noreferrer'
                                                className='flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'
                                            >
                                                <Globe className='h-4 w-4' />
                                                Website
                                                <ExternalLink className='h-3 w-3' />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Creator Stats */}
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
                            <div className='text-center p-4 bg-blue-50 rounded-lg'>
                                <Video className='h-6 w-6 text-blue-600 mx-auto mb-2' />
                                <div className='text-2xl font-bold text-gray-900'>
                                    {totalVideos}
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Videos
                                </div>
                            </div>
                            <div className='text-center p-4 bg-green-50 rounded-lg'>
                                <FileText className='h-6 w-6 text-green-600 mx-auto mb-2' />
                                <div className='text-2xl font-bold text-gray-900'>
                                    {totalBlogs}
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Blogs
                                </div>
                            </div>
                            <div className='text-center p-4 bg-purple-50 rounded-lg'>
                                <Eye className='h-6 w-6 text-purple-600 mx-auto mb-2' />
                                <div className='text-2xl font-bold text-gray-900'>
                                    {totalViews.toLocaleString()}
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Total Views
                                </div>
                            </div>
                            <div className='text-center p-4 bg-yellow-50 rounded-lg'>
                                <Users className='h-6 w-6 text-yellow-600 mx-auto mb-2' />
                                <div className='text-2xl font-bold text-gray-900'>
                                    {Math.floor(totalWatchTime / 60)}
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Minutes Content
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className='bg-white rounded-xl shadow-lg'>
                    <div className='border-b border-gray-200'>
                        <nav className='flex space-x-8 px-6' aria-label='Tabs'>
                            <a
                                href='#videos'
                                className='border-b-2 border-blue-500 py-4 px-1 text-sm font-medium text-blue-600'
                            >
                                Videos ({totalVideos})
                            </a>
                            {totalBlogs > 0 && (
                                <a
                                    href='#blogs'
                                    className='border-b-2 border-transparent py-4 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                >
                                    Blogs ({totalBlogs})
                                </a>
                            )}
                        </nav>
                    </div>

                    {/* Videos Tab Content */}
                    <div className='p-6'>
                        {creator.videos.length > 0 ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {creator.videos.map((video) => (
                                    <Link
                                        key={video.id}
                                        href={`/videos/${video.id}`}
                                        className='group block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300'
                                    >
                                        <div className='relative aspect-video'>
                                            <Image
                                                src={
                                                    video.thumbnailUrl ||
                                                    '/placeholder-video.svg'
                                                }
                                                alt={video.title}
                                                fill
                                                className='object-cover group-hover:scale-105 transition-transform duration-300'
                                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                            />
                                            {video.duration && (
                                                <div className='absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded'>
                                                    {formatDuration(
                                                        video.duration
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className='p-4'>
                                            <h3 className='font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2'>
                                                {video.title}
                                            </h3>

                                            {video.show && (
                                                <p className='text-sm text-blue-600 font-medium mb-2'>
                                                    {video.show.name}
                                                </p>
                                            )}

                                            <div className='flex items-center justify-between text-xs text-gray-500'>
                                                <span>
                                                    {video.viewCount} views
                                                </span>
                                                {video.publishedAt && (
                                                    <span>
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                video.publishedAt
                                                            ),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            {video.topic && (
                                                <div className='mt-2'>
                                                    <span className='inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full'>
                                                        {video.topic
                                                            .replace('_', ' ')
                                                            .toLowerCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center py-12'>
                                <Video className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                    No videos yet
                                </h3>
                                <p className='text-gray-500'>
                                    {creator.displayName} hasn&apos;t published
                                    any videos yet.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Blogs Tab Content - if we have blogs */}
                    {totalBlogs > 0 && (
                        <div
                            className='p-6 border-t border-gray-200'
                            id='blogs'
                        >
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {creator.blogs.map((blog) => (
                                    <Link
                                        key={blog.id}
                                        href={`/blogs/${blog.id}`}
                                        className='group block bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300 p-4'
                                    >
                                        <h3 className='font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2'>
                                            {blog.title}
                                        </h3>

                                        {blog.excerpt && (
                                            <p className='text-sm text-gray-600 line-clamp-3 mb-3'>
                                                {blog.excerpt}
                                            </p>
                                        )}

                                        <div className='flex items-center justify-between text-xs text-gray-500'>
                                            <span>{blog.viewCount} views</span>
                                            {blog.publishedAt && (
                                                <span>
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            blog.publishedAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </span>
                                            )}
                                        </div>

                                        {blog.topic && (
                                            <div className='mt-2'>
                                                <span className='inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full'>
                                                    {blog.topic
                                                        .replace('_', ' ')
                                                        .toLowerCase()}
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Empty state for blogs */}
                    {totalBlogs === 0 && (
                        <div
                            className='p-6 border-t border-gray-200 hidden'
                            id='blogs'
                        >
                            <div className='text-center py-12'>
                                <FileText className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                    No blogs yet
                                </h3>
                                <p className='text-gray-500'>
                                    {creator.displayName} hasn&apos;t published
                                    any blogs yet.
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Follow/Subscribe Section - Future Enhancement */}
                <div className='mt-8 text-center bg-white rounded-xl shadow-lg p-8'>
                    <h3 className='text-xl font-bold text-gray-900 mb-4'>
                        Support {creator.displayName}
                    </h3>
                    <p className='text-gray-600 mb-6'>
                        Stay updated with the latest content from{' '}
                        {creator.displayName} and support their mission of Hope,
                        Help, and Humor.
                    </p>
                    <div className='space-y-3'>
                        <button className='w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200'>
                            Follow Creator (Coming Soon)
                        </button>
                        <div className='text-sm text-gray-500'>
                            Get notified when {creator.displayName} posts new
                            content
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
