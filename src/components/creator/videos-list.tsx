'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    EyeIcon,
    PencilIcon,
    TrashIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

interface Video {
    id: string;
    title: string;
    description: string | null;
    status: string;
    viewCount: number;
    createdAt: Date;
    publishedAt: Date | null;
    scheduledAt: Date | null;
    youtubeId: string;
    thumbnailUrl: string | null;
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

interface VideosListProps {
    videos: Video[];
}

export function VideosList({ videos }: VideosListProps) {
    const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
    const [filter, setFilter] = useState<string>('all');

    const filteredVideos = videos.filter((video) => {
        if (filter === 'all') return true;
        return video.status.toLowerCase() === filter.toLowerCase();
    });

    const handleSelectVideo = (videoId: string) => {
        setSelectedVideos((prev) =>
            prev.includes(videoId)
                ? prev.filter((id) => id !== videoId)
                : [...prev, videoId]
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

    if (videos.length === 0) {
        return (
            <div className='text-center py-12'>
                <div className='mx-auto h-12 w-12 text-gray-400'>📹</div>
                <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No videos
                </h3>
                <p className='mt-1 text-sm text-gray-500'>
                    Get started by uploading your first video.
                </p>
                <div className='mt-6'>
                    <Link
                        href='/creator/videos/new'
                        className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                    >
                        Upload Video
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-white shadow overflow-hidden sm:rounded-md'>
            {/* Filters */}
            <div className='border-b border-gray-200 px-4 py-3 sm:px-6'>
                <div className='flex items-center justify-between'>
                    <div className='flex space-x-4'>
                        <button
                            onClick={() => setFilter('all')}
                            className={`text-sm font-medium ${
                                filter === 'all'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            All ({videos.length})
                        </button>
                        <button
                            onClick={() => setFilter('published')}
                            className={`text-sm font-medium ${
                                filter === 'published'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Published (
                            {
                                videos.filter((v) => v.status === 'PUBLISHED')
                                    .length
                            }
                            )
                        </button>
                        <button
                            onClick={() => setFilter('draft')}
                            className={`text-sm font-medium ${
                                filter === 'draft'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Drafts (
                            {videos.filter((v) => v.status === 'DRAFT').length})
                        </button>
                        <button
                            onClick={() => setFilter('scheduled')}
                            className={`text-sm font-medium ${
                                filter === 'scheduled'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Scheduled (
                            {
                                videos.filter((v) => v.status === 'SCHEDULED')
                                    .length
                            }
                            )
                        </button>
                    </div>

                    {selectedVideos.length > 0 && (
                        <div className='flex items-center space-x-2'>
                            <span className='text-sm text-gray-500'>
                                {selectedVideos.length} selected
                            </span>
                            <button className='text-sm text-blue-600 hover:text-blue-500'>
                                Bulk Edit
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Videos List */}
            <ul className='divide-y divide-gray-200'>
                {filteredVideos.map((video) => (
                    <li key={video.id} className='px-4 py-4 sm:px-6'>
                        <div className='flex items-center space-x-4'>
                            <input
                                type='checkbox'
                                checked={selectedVideos.includes(video.id)}
                                onChange={() => handleSelectVideo(video.id)}
                                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                            />

                            <div className='flex-shrink-0'>
                                <Image
                                    className='h-16 w-24 rounded-lg object-cover'
                                    src={
                                        video.thumbnailUrl ||
                                        '/placeholder-video.jpg'
                                    }
                                    alt={video.title}
                                    width={96}
                                    height={64}
                                />
                            </div>

                            <div className='flex-1 min-w-0'>
                                <div className='flex items-center justify-between'>
                                    <p className='text-sm font-medium text-gray-900 truncate'>
                                        {video.title}
                                    </p>
                                    {getStatusBadge(video.status)}
                                </div>

                                <div className='mt-1 flex items-center space-x-2 text-xs text-gray-500'>
                                    {video.show && (
                                        <span>{video.show.name}</span>
                                    )}
                                    {video.show && <span>•</span>}
                                    <span className='flex items-center'>
                                        <EyeIcon className='h-3 w-3 mr-1' />
                                        {video.viewCount.toLocaleString()} views
                                    </span>
                                    <span>•</span>
                                    {video.status === 'SCHEDULED' &&
                                    video.scheduledAt ? (
                                        <span className='flex items-center'>
                                            <CalendarIcon className='h-3 w-3 mr-1' />
                                            Scheduled for{' '}
                                            {formatDistanceToNow(
                                                new Date(video.scheduledAt),
                                                { addSuffix: true }
                                            )}
                                        </span>
                                    ) : (
                                        <span>
                                            {video.publishedAt
                                                ? `Published ${formatDistanceToNow(
                                                      new Date(
                                                          video.publishedAt
                                                      ),
                                                      { addSuffix: true }
                                                  )}`
                                                : `Created ${formatDistanceToNow(
                                                      new Date(video.createdAt),
                                                      { addSuffix: true }
                                                  )}`}
                                        </span>
                                    )}
                                </div>

                                {video.description && (
                                    <p className='mt-1 text-sm text-gray-500 truncate'>
                                        {video.description}
                                    </p>
                                )}
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Link
                                    href={`https://youtube.com/watch?v=${video.youtubeId}`}
                                    target='_blank'
                                    className='text-gray-400 hover:text-gray-500'
                                    title='View on YouTube'
                                >
                                    <EyeIcon className='h-5 w-5' />
                                </Link>
                                <Link
                                    href={`/creator/videos/${video.id}/edit`}
                                    className='text-gray-400 hover:text-gray-500'
                                    title='Edit video'
                                >
                                    <PencilIcon className='h-5 w-5' />
                                </Link>
                                <button
                                    className='text-gray-400 hover:text-red-500'
                                    title='Delete video'
                                >
                                    <TrashIcon className='h-5 w-5' />
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            {filteredVideos.length === 0 && (
                <div className='text-center py-12'>
                    <p className='text-sm text-gray-500'>
                        No videos found for the selected filter.
                    </p>
                </div>
            )}
        </div>
    );
}
