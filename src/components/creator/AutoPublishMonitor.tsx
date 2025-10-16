'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    CheckCircle,
    AlertCircle,
    Play,
    RefreshCw,
    Video,
    FileText,
} from 'lucide-react';

interface ContentItem {
    id: string;
    title: string;
    contentType: 'VIDEO' | 'BLOG';
    publishAt: string;
    status: string;
    creator: string;
}

interface AutoPublishApiResponse {
    success: boolean;
    data: {
        upcomingContent: ContentItem[];
        recentlyPublished: ContentItem[];
        totalPending: number;
        systemStatus: string;
        lastCheck: string;
    };
}

export function AutoPublishMonitor() {
    const [status, setStatus] = useState<AutoPublishApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auto-publish', {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStatus(data);
                setError(null);
            } else {
                setError('Failed to fetch auto-publish status');
            }
        } catch (err) {
            setError('Error connecting to auto-publish system');
            console.error('Auto-publish status error:', err);
        } finally {
            setLoading(false);
            setLastRefresh(new Date());
        }
    };

    const triggerManualPublish = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/auto-publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Manual publish result:', result);
                // Refresh status after manual publish
                await fetchStatus();
            } else {
                setError('Manual publish failed');
            }
        } catch (err) {
            setError('Error triggering manual publish');
            console.error('Manual publish error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const formatTimeUntil = (milliseconds: number) => {
        if (milliseconds <= 0) return 'Ready to publish';

        const minutes = Math.floor(milliseconds / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ${hours % 24}h`;
        if (hours > 0) return `${hours}h ${minutes % 60}m`;
        if (minutes > 0) return `${minutes}m`;
        return 'Less than 1m';
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    if (loading && !status) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <RefreshCw className='w-5 h-5 animate-spin' />
                        Loading Auto-Publish Status...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (error && !status) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2 text-red-600'>
                        <AlertCircle className='w-5 h-5' />
                        Auto-Publish System Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-red-600 mb-4'>{error}</p>
                    <Button onClick={fetchStatus} variant='outline'>
                        <RefreshCw className='w-4 h-4 mr-2' />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className='space-y-6'>
            {/* System Status */}
            <Card>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
                    <CardTitle className='flex items-center gap-2'>
                        <Play className='w-5 h-5 text-green-600' />
                        Auto-Publish System
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                        <Badge
                            variant={
                                status?.data?.systemStatus === 'operational'
                                    ? 'default'
                                    : 'destructive'
                            }
                            className='bg-green-100 text-green-800'
                        >
                            {status?.data?.systemStatus === 'operational' ? (
                                <>
                                    <CheckCircle className='w-3 h-3 mr-1' />
                                    Operational
                                </>
                            ) : (
                                <>
                                    <AlertCircle className='w-3 h-3 mr-1' />
                                    Error
                                </>
                            )}
                        </Badge>
                        <Button
                            variant='outline'
                            size='sm'
                            onClick={fetchStatus}
                            disabled={loading}
                        >
                            <RefreshCw
                                className={`w-4 h-4 mr-2 ${
                                    loading ? 'animate-spin' : ''
                                }`}
                            />
                            Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className='flex items-center justify-between mb-4'>
                        <div>
                            <p className='text-sm text-gray-600'>
                                System is{' '}
                                {status?.data?.systemStatus || 'unknown'}
                            </p>
                            <p className='text-xs text-gray-500'>
                                Last updated:{' '}
                                {formatDateTime(lastRefresh.toISOString())}
                            </p>
                        </div>
                        <Button
                            onClick={triggerManualPublish}
                            disabled={loading}
                            size='sm'
                        >
                            <Play className='w-4 h-4 mr-2' />
                            Run Now
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Upcoming Content */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <Clock className='w-5 h-5 text-blue-600' />
                        Upcoming Publications (
                        {status?.data?.upcomingContent.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(status?.data?.upcomingContent.length || 0) === 0 ? (
                        <p className='text-gray-500 text-center py-4'>
                            No content scheduled for auto-publish
                        </p>
                    ) : (
                        <div className='space-y-3'>
                            {status?.data?.upcomingContent
                                .slice(0, 5)
                                .map((item) => {
                                    const timeUntil =
                                        new Date(item.publishAt).getTime() -
                                        new Date().getTime();
                                    return (
                                        <div
                                            key={item.id}
                                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                                        >
                                            <div className='flex items-center gap-3'>
                                                {item.contentType ===
                                                'VIDEO' ? (
                                                    <Video className='w-4 h-4 text-red-600' />
                                                ) : (
                                                    <FileText className='w-4 h-4 text-green-600' />
                                                )}
                                                <div>
                                                    <p className='font-medium text-sm'>
                                                        {item.title}
                                                    </p>
                                                    <p className='text-xs text-gray-500'>
                                                        {formatDateTime(
                                                            item.publishAt
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge
                                                variant='outline'
                                                className='text-xs'
                                            >
                                                <Clock className='w-3 h-3 mr-1' />
                                                {formatTimeUntil(timeUntil)}
                                            </Badge>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recently Published */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center gap-2'>
                        <CheckCircle className='w-5 h-5 text-green-600' />
                        Recently Published (
                        {status?.data?.recentlyPublished.length || 0})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {(status?.data?.recentlyPublished.length || 0) === 0 ? (
                        <p className='text-gray-500 text-center py-4'>
                            No content published in the last 24 hours
                        </p>
                    ) : (
                        <div className='space-y-3'>
                            {status?.data?.recentlyPublished
                                .slice(0, 5)
                                .map((item) => (
                                    <div
                                        key={item.id}
                                        className='flex items-center justify-between p-3 bg-green-50 rounded-lg'
                                    >
                                        <div className='flex items-center gap-3'>
                                            {item.contentType === 'VIDEO' ? (
                                                <Video className='w-4 h-4 text-red-600' />
                                            ) : (
                                                <FileText className='w-4 h-4 text-green-600' />
                                            )}
                                            <div>
                                                <p className='font-medium text-sm'>
                                                    {item.title}
                                                </p>
                                                <p className='text-xs text-gray-500'>
                                                    Status: {item.status}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge
                                            variant='outline'
                                            className='bg-green-100 text-green-800'
                                        >
                                            <CheckCircle className='w-3 h-3 mr-1' />
                                            Published
                                        </Badge>
                                    </div>
                                ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
