'use client';

import { useState, useEffect } from 'react';
import {
    Play,
    Clock,
    CheckCircle,
    TrendingUp,
    Calendar,
} from 'lucide-react';

interface UserStatsProps {
    userId: string;
}

interface UserStatsData {
    totalVideosWatched: number;
    totalWatchTime: number; // in minutes
    completedVideos: number;
    currentStreak: number;
    joinDate: string;
    favoriteTopics: string[];
    recentActivity: {
        videosThisWeek: number;
        minutesThisWeek: number;
    };
}

export default function UserStats({ userId }: UserStatsProps) {
    const [stats, setStats] = useState<UserStatsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch(`/api/users/${userId}/stats`);
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch user stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId]);

    if (loading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className='text-center py-8'>
                <p className='text-gray-500'>
                    Unable to load your statistics at this time.
                </p>
            </div>
        );
    }

    const formatWatchTime = (minutes: number): string => {
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    };

    return (
        <div className='space-y-6'>
            <div>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>
                    Your H3 Network Journey
                </h3>

                {/* Key Stats Grid */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-blue-600 text-sm font-medium'>
                                    Videos Watched
                                </p>
                                <p className='text-3xl font-bold text-blue-900'>
                                    {stats.totalVideosWatched}
                                </p>
                            </div>
                            <Play className='h-8 w-8 text-blue-600' />
                        </div>
                    </div>

                    <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-green-600 text-sm font-medium'>
                                    Watch Time
                                </p>
                                <p className='text-3xl font-bold text-green-900'>
                                    {formatWatchTime(stats.totalWatchTime)}
                                </p>
                            </div>
                            <Clock className='h-8 w-8 text-green-600' />
                        </div>
                    </div>

                    <div className='bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-yellow-600 text-sm font-medium'>
                                    Completed
                                </p>
                                <p className='text-3xl font-bold text-yellow-900'>
                                    {stats.completedVideos}
                                </p>
                            </div>
                            <CheckCircle className='h-8 w-8 text-yellow-600' />
                        </div>
                    </div>

                    <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-purple-600 text-sm font-medium'>
                                    Current Streak
                                </p>
                                <p className='text-3xl font-bold text-purple-900'>
                                    {stats.currentStreak} days
                                </p>
                            </div>
                            <TrendingUp className='h-8 w-8 text-purple-600' />
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
                    <div className='bg-gray-50 rounded-lg p-6 border border-gray-200'>
                        <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                            <Calendar className='h-5 w-5 mr-2 text-gray-600' />
                            This Week
                        </h4>
                        <div className='space-y-3'>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>
                                    Videos Watched
                                </span>
                                <span className='font-semibold text-gray-900'>
                                    {stats.recentActivity.videosThisWeek}
                                </span>
                            </div>
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>
                                    Watch Time
                                </span>
                                <span className='font-semibold text-gray-900'>
                                    {formatWatchTime(
                                        stats.recentActivity.minutesThisWeek
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className='bg-gray-50 rounded-lg p-6 border border-gray-200'>
                        <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                            Favorite Topics
                        </h4>
                        <div className='flex flex-wrap gap-2'>
                            {stats.favoriteTopics.length > 0 ? (
                                stats.favoriteTopics.map((topic, index) => (
                                    <span
                                        key={index}
                                        className='inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'
                                    >
                                        {topic
                                            .replace('_', ' ')
                                            .toLowerCase()
                                            .replace(/\b\w/g, (l) =>
                                                l.toUpperCase()
                                            )}
                                    </span>
                                ))
                            ) : (
                                <p className='text-gray-500 text-sm'>
                                    Keep watching to discover your favorite
                                    topics!
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Achievement Banner */}
                <div className='bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white text-center'>
                    <h4 className='text-xl font-bold mb-2'>
                        Member of the H3 Community
                    </h4>
                    <p className='text-blue-100'>
                        You&apos;ve been part of our Hope, Help, and Humor
                        community since {stats.joinDate}
                    </p>
                    <div className='mt-4 flex justify-center items-center space-x-6 text-sm'>
                        <div className='text-center'>
                            <div className='text-2xl font-bold'>
                                {stats.totalVideosWatched}
                            </div>
                            <div className='text-blue-200'>Videos</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-2xl font-bold'>
                                {formatWatchTime(stats.totalWatchTime)}
                            </div>
                            <div className='text-blue-200'>Watch Time</div>
                        </div>
                        <div className='text-center'>
                            <div className='text-2xl font-bold'>
                                {stats.currentStreak}
                            </div>
                            <div className='text-blue-200'>Day Streak</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
