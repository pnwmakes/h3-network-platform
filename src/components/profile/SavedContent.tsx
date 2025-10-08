'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Search, Trash2, Play, Calendar } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface SavedContentProps {
    userId: string;
}

interface SavedItem {
    id: string;
    video: {
        id: string;
        title: string;
        description?: string;
        thumbnailUrl?: string;
        duration?: number;
        viewCount: number;
        publishedAt?: string;
        creator: {
            displayName: string;
        };
        show?: {
            name: string;
        };
    };
    savedAt: string;
}

export default function SavedContent({ userId }: SavedContentProps) {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSavedContent = async () => {
            try {
                const response = await fetch(`/api/users/${userId}/saved`);

                if (response.ok) {
                    const data = await response.json();
                    setSavedItems(data);
                } else {
                    console.error(
                        'Failed to fetch saved content:',
                        response.status
                    );
                }
            } catch (error) {
                console.error('Failed to fetch saved content:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSavedContent();
    }, [userId]);

    const handleRemoveSaved = async (videoId: string) => {
        try {
            const response = await fetch(
                `/api/users/${userId}/saved/${videoId}`,
                {
                    method: 'DELETE',
                }
            );

            if (response.ok) {
                setSavedItems(
                    savedItems.filter((item) => item.video.id !== videoId)
                );
            }
        } catch (error) {
            console.error('Failed to remove saved video:', error);
        }
    };

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const filteredItems = savedItems.filter(
        (item) =>
            item.video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.video.creator.displayName
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>
                    Saved Content
                </h3>

                {/* Search */}
                <div className='relative mb-6'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                    <input
                        type='text'
                        placeholder='Search your saved videos...'
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                </div>

                {/* Saved Content List */}
                {filteredItems.length === 0 ? (
                    <div className='text-center py-12'>
                        <Bookmark className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                        <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                            {searchTerm
                                ? 'No saved videos found'
                                : 'No saved content yet'}
                        </h4>
                        <p className='text-gray-500 mb-6'>
                            {searchTerm
                                ? 'Try adjusting your search terms.'
                                : 'Save videos to watch later by clicking the bookmark icon.'}
                        </p>
                        {!searchTerm && (
                            <Link
                                href='/videos'
                                className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                            >
                                <Play className='h-5 w-5 mr-2' />
                                Browse Videos
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden'
                            >
                                <div className='relative'>
                                    <Link href={`/videos/${item.video.id}`}>
                                        <div className='relative aspect-video'>
                                            <Image
                                                src={
                                                    item.video.thumbnailUrl ||
                                                    '/placeholder-video.svg'
                                                }
                                                alt={item.video.title}
                                                fill
                                                className='object-cover hover:scale-105 transition-transform duration-300'
                                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                            />
                                            {item.video.duration && (
                                                <div className='absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded'>
                                                    {formatDuration(
                                                        item.video.duration
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Remove button */}
                                    <button
                                        onClick={() =>
                                            handleRemoveSaved(item.video.id)
                                        }
                                        className='absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg'
                                        title='Remove from saved'
                                    >
                                        <Trash2 className='h-4 w-4' />
                                    </button>
                                </div>

                                <div className='p-4'>
                                    <Link href={`/videos/${item.video.id}`}>
                                        <h3 className='font-semibold text-lg text-gray-900 line-clamp-2 hover:text-blue-600 transition-colors mb-2'>
                                            {item.video.title}
                                        </h3>
                                    </Link>

                                    <div className='flex items-center text-sm text-gray-600 mb-3'>
                                        <span className='font-medium'>
                                            {item.video.creator.displayName}
                                        </span>
                                        {item.video.show && (
                                            <>
                                                <span className='mx-2'>•</span>
                                                <span>
                                                    {item.video.show.name}
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <div className='flex items-center justify-between text-xs text-gray-500 mb-3'>
                                        <div className='flex items-center space-x-3'>
                                            <span>
                                                {item.video.viewCount} views
                                            </span>
                                            {item.video.publishedAt && (
                                                <span>
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            item.video.publishedAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center text-xs text-gray-500'>
                                            <Calendar className='h-3 w-3 mr-1' />
                                            <span>
                                                Saved{' '}
                                                {formatDistanceToNow(
                                                    new Date(item.savedAt),
                                                    { addSuffix: true }
                                                )}
                                            </span>
                                        </div>

                                        <Link
                                            href={`/videos/${item.video.id}`}
                                            className='inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors'
                                        >
                                            <Play className='h-4 w-4 mr-1' />
                                            Watch
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Summary */}
                {filteredItems.length > 0 && (
                    <div className='mt-8 text-center'>
                        <p className='text-gray-500'>
                            {filteredItems.length} of {savedItems.length} saved
                            video{savedItems.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
