'use client';

import { useState, useEffect } from 'react';
import { Clock, Play, Calendar, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';

interface ViewingHistoryProps {
    userId: string;
}

interface HistoryItem {
    id: string;
    video: {
        id: string;
        title: string;
        description?: string;
        thumbnailUrl?: string;
        duration?: number;
        creator: {
            displayName: string;
        };
        show?: {
            name: string;
        };
    };
    progressSeconds: number;
    completed: boolean;
    lastWatched: string;
}

export default function ViewingHistory({ userId }: ViewingHistoryProps) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCompleted, setFilterCompleted] = useState<
        'all' | 'completed' | 'in-progress'
    >('all');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`/api/users/${userId}/history`);
                if (response.ok) {
                    const data = await response.json();
                    setHistory(data);
                }
            } catch (error) {
                console.error('Failed to fetch viewing history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userId]);

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercentage = (
        progressSeconds: number,
        totalDuration?: number
    ): number => {
        if (!totalDuration) return 0;
        return Math.round((progressSeconds / totalDuration) * 100);
    };

    const filteredHistory = history.filter((item) => {
        const matchesSearch =
            item.video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.video.creator.displayName
                .toLowerCase()
                .includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterCompleted === 'all' ||
            (filterCompleted === 'completed' && item.completed) ||
            (filterCompleted === 'in-progress' &&
                !item.completed &&
                item.progressSeconds > 0);

        return matchesSearch && matchesFilter;
    });

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
                    Your Viewing History
                </h3>

                {/* Search and Filter Controls */}
                <div className='flex flex-col sm:flex-row gap-4 mb-6'>
                    <div className='relative flex-1'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                        <input
                            type='text'
                            placeholder='Search your watched videos...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                    <div className='relative'>
                        <Filter className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                        <select
                            value={filterCompleted}
                            onChange={(e) =>
                                setFilterCompleted(
                                    e.target.value as
                                        | 'all'
                                        | 'completed'
                                        | 'in-progress'
                                )
                            }
                            className='pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white'
                        >
                            <option value='all'>All Videos</option>
                            <option value='completed'>Completed</option>
                            <option value='in-progress'>In Progress</option>
                        </select>
                    </div>
                </div>

                {/* History List */}
                {filteredHistory.length === 0 ? (
                    <div className='text-center py-12'>
                        <Play className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                        <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                            {searchTerm || filterCompleted !== 'all'
                                ? 'No videos found'
                                : 'No viewing history yet'}
                        </h4>
                        <p className='text-gray-500 mb-6'>
                            {searchTerm || filterCompleted !== 'all'
                                ? 'Try adjusting your search or filter settings.'
                                : 'Start watching videos to see your history here.'}
                        </p>
                        {!searchTerm && filterCompleted === 'all' && (
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
                    <div className='space-y-4'>
                        {filteredHistory.map((item) => (
                            <div
                                key={item.id}
                                className='bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors'
                            >
                                <div className='flex space-x-4'>
                                    <div className='relative flex-shrink-0'>
                                        <Link href={`/videos/${item.video.id}`}>
                                            <div className='relative w-32 h-18 rounded-lg overflow-hidden'>
                                                <Image
                                                    src={
                                                        item.video
                                                            .thumbnailUrl ||
                                                        '/placeholder-video.svg'
                                                    }
                                                    alt={item.video.title}
                                                    fill
                                                    className='object-cover'
                                                    sizes='128px'
                                                />
                                                {item.video.duration && (
                                                    <div className='absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1.5 py-0.5 rounded'>
                                                        {formatDuration(
                                                            item.video.duration
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Progress indicator */}
                                        {!item.completed &&
                                            item.progressSeconds > 0 && (
                                                <div className='absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 h-1'>
                                                    <div
                                                        className='bg-blue-600 h-full'
                                                        style={{
                                                            width: `${getProgressPercentage(
                                                                item.progressSeconds,
                                                                item.video
                                                                    .duration
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                    </div>

                                    <div className='flex-1 min-w-0'>
                                        <Link href={`/videos/${item.video.id}`}>
                                            <h4 className='text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2'>
                                                {item.video.title}
                                            </h4>
                                        </Link>

                                        <div className='flex items-center text-sm text-gray-600 mt-1'>
                                            <span className='font-medium'>
                                                {item.video.creator.displayName}
                                            </span>
                                            {item.video.show && (
                                                <>
                                                    <span className='mx-2'>
                                                        •
                                                    </span>
                                                    <span>
                                                        {item.video.show.name}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className='flex items-center justify-between mt-3'>
                                            <div className='flex items-center space-x-4 text-sm text-gray-500'>
                                                <div className='flex items-center'>
                                                    <Calendar className='h-4 w-4 mr-1' />
                                                    <span>
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                item.lastWatched
                                                            ),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                </div>

                                                {item.completed ? (
                                                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                        ✓ Completed
                                                    </span>
                                                ) : item.progressSeconds > 0 ? (
                                                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                                        {getProgressPercentage(
                                                            item.progressSeconds,
                                                            item.video.duration
                                                        )}
                                                        % watched
                                                    </span>
                                                ) : (
                                                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                                                        Started
                                                    </span>
                                                )}
                                            </div>

                                            <Link
                                                href={`/videos/${item.video.id}`}
                                                className='inline-flex items-center px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors'
                                            >
                                                {item.completed
                                                    ? 'Watch Again'
                                                    : 'Continue'}
                                                <Play className='h-4 w-4 ml-1' />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
