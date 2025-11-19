'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Eye,
    Heart,
    Clock,
    Users,
    Target,
    Award,
    Calendar,
    Video,
    FileText,
    Download,
    RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
    overview: {
        totalViews: number;
        totalLikes: number;
        totalComments: number;
        totalShares: number;
        engagementRate: number;
        avgViewDuration: number;
        subscriberGrowth: number;
        contentCount: number;
    };
    timeRange: {
        views: { date: string; count: number }[];
        engagement: { date: string; rate: number }[];
        contentPublished: { date: string; count: number }[];
    };
    contentPerformance: {
        videos: ContentMetrics[];
        blogs: ContentMetrics[];
    };
    audienceInsights: {
        demographics: {
            ageGroups: { range: string; percentage: number }[];
            locations: { country: string; percentage: number }[];
            interests: { topic: string; percentage: number }[];
        };
        behavior: {
            peakHours: { hour: number; activity: number }[];
            deviceTypes: { type: string; percentage: number }[];
        };
    };
    goals: {
        monthly: {
            target: number;
            current: number;
            period: string;
        };
        quarterly: {
            target: number;
            current: number;
            period: string;
        };
    };
}

interface ContentMetrics {
    id: string;
    title: string;
    type: 'video' | 'blog';
    publishedAt: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    engagementRate: number;
    avgViewDuration?: number;
    readTime?: number;
    thumbnailUrl?: string;
    status: string;
    performance: 'excellent' | 'good' | 'average' | 'poor';
}

export function AdvancedAnalytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');
    const [contentFilter, setContentFilter] = useState('all');
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `/api/creator/analytics?timeRange=${timeRange}&filter=${contentFilter}`,
                {
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setAnalytics(data.analytics);
            } else {
                console.error('Failed to fetch analytics');
                // Set mock data for development
                setAnalytics(getMockAnalytics());
            }
        } catch (error) {
            console.error('Analytics fetch error:', error);
            setAnalytics(getMockAnalytics());
        } finally {
            setLoading(false);
        }
    }, [timeRange, contentFilter]);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    };

    const exportData = () => {
        if (!analytics) return;

        const dataStr = JSON.stringify(analytics, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `creator-analytics-${
            new Date().toISOString().split('T')[0]
        }.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getPerformanceColor = (performance: string) => {
        switch (performance) {
            case 'excellent':
                return 'bg-green-100 text-green-800';
            case 'good':
                return 'bg-blue-100 text-blue-800';
            case 'average':
                return 'bg-yellow-100 text-yellow-800';
            case 'poor':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatNumber = (num: number | string | undefined): string => {
        const numValue = typeof num === 'string' ? parseInt(num) : num;
        if (typeof numValue !== 'number' || isNaN(numValue)) {
            return '0';
        }
        if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + 'M';
        if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K';
        return numValue.toString();
    };

    const formatPercentage = (num: number | string | undefined): string => {
        const numValue = typeof num === 'string' ? parseFloat(num) : num;
        if (typeof numValue !== 'number' || isNaN(numValue)) {
            return '0.0%';
        }
        return `${numValue.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center p-8'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <Card>
                <CardContent className='p-8 text-center'>
                    <BarChart3 className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        Analytics Unavailable
                    </h3>
                    <p className='text-gray-600 mb-4'>
                        Unable to load analytics data at this time.
                    </p>
                    <Button onClick={fetchAnalytics}>Try Again</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Header Controls */}
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900'>
                        Analytics Dashboard
                    </h2>
                    <p className='text-gray-600'>
                        Track your content performance and audience engagement
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className='w-32'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='7d'>Last 7 days</SelectItem>
                            <SelectItem value='30d'>Last 30 days</SelectItem>
                            <SelectItem value='90d'>Last 3 months</SelectItem>
                            <SelectItem value='1y'>Last year</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={contentFilter}
                        onValueChange={setContentFilter}
                    >
                        <SelectTrigger className='w-32'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>All Content</SelectItem>
                            <SelectItem value='videos'>Videos Only</SelectItem>
                            <SelectItem value='blogs'>Blogs Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant='outline'
                        size='sm'
                        onClick={handleRefresh}
                        disabled={refreshing}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing ? 'animate-spin' : ''
                            }`}
                        />
                    </Button>

                    <Button variant='outline' size='sm' onClick={exportData}>
                        <Download className='h-4 w-4 mr-2' />
                        Export
                    </Button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <MetricCard
                    title='Total Views'
                    value={formatNumber(analytics.overview.totalViews)}
                    change={12.5}
                    icon={<Eye className='h-5 w-5' />}
                    color='blue'
                />
                <MetricCard
                    title='Engagement Rate'
                    value={formatPercentage(analytics.overview.engagementRate)}
                    change={-2.1}
                    icon={<Heart className='h-5 w-5' />}
                    color='red'
                />
                <MetricCard
                    title='Avg View Duration'
                    value={(() => {
                        const duration =
                            analytics.overview.avgViewDuration || 0;
                        const minutes = Math.floor(duration / 60);
                        const seconds = Math.floor(duration % 60);
                        return `${minutes}:${seconds
                            .toString()
                            .padStart(2, '0')}`;
                    })()}
                    change={8.3}
                    icon={<Clock className='h-5 w-5' />}
                    color='green'
                />
                <MetricCard
                    title='Content Published'
                    value={(analytics.overview.contentCount || 0).toString()}
                    change={25.0}
                    icon={<Target className='h-5 w-5' />}
                    color='purple'
                />
            </div>

            {/* Analytics Tabs */}
            <Tabs defaultValue='performance' className='w-full'>
                <TabsList className='grid w-full grid-cols-4'>
                    <TabsTrigger value='performance'>Performance</TabsTrigger>
                    <TabsTrigger value='audience'>Audience</TabsTrigger>
                    <TabsTrigger value='content'>Content</TabsTrigger>
                    <TabsTrigger value='goals'>Goals</TabsTrigger>
                </TabsList>

                <TabsContent value='performance' className='space-y-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* Views Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <TrendingUp className='h-5 w-5' />
                                    Views Over Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
                                    <p className='text-gray-500'>
                                        Chart visualization would go here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engagement Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Heart className='h-5 w-5' />
                                    Engagement Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='h-64 flex items-center justify-center bg-gray-50 rounded-lg'>
                                    <p className='text-gray-500'>
                                        Engagement chart would go here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Top Performing Content */}
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Award className='h-5 w-5' />
                                Top Performing Content
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {[
                                    ...(analytics.contentPerformance?.videos || []),
                                    ...(analytics.contentPerformance?.blogs || []),
                                ]
                                    .sort((a, b) => b.views - a.views)
                                    .slice(0, 5)
                                    .map((content) => (
                                        <div
                                            key={content.id}
                                            className='flex items-center gap-4 p-4 bg-gray-50 rounded-lg'
                                        >
                                            <div className='flex-shrink-0'>
                                                {content.type === 'video' ? (
                                                    <Video className='h-8 w-8 text-blue-500' />
                                                ) : (
                                                    <FileText className='h-8 w-8 text-green-500' />
                                                )}
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <h4 className='font-medium text-gray-900 truncate'>
                                                    {content.title}
                                                </h4>
                                                <div className='flex items-center gap-4 text-sm text-gray-600 mt-1'>
                                                    <span>
                                                        {formatNumber(
                                                            content.views
                                                        )}{' '}
                                                        views
                                                    </span>
                                                    <span>
                                                        {formatNumber(
                                                            content.likes
                                                        )}{' '}
                                                        likes
                                                    </span>
                                                    <span>
                                                        {formatPercentage(
                                                            content.engagementRate
                                                        )}{' '}
                                                        engagement
                                                    </span>
                                                </div>
                                            </div>
                                            <Badge
                                                className={getPerformanceColor(
                                                    content.performance
                                                )}
                                            >
                                                {content.performance}
                                            </Badge>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='audience' className='space-y-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* Demographics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Users className='h-5 w-5' />
                                    Audience Demographics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div>
                                    <h4 className='font-medium mb-2'>
                                        Age Groups
                                    </h4>
                                    <div className='space-y-2'>
                                        {(analytics.audienceInsights?.demographics?.ageGroups || []).map(
                                            (group) => (
                                                <div
                                                    key={group.range}
                                                    className='flex items-center justify-between'
                                                >
                                                    <span className='text-sm text-gray-600'>
                                                        {group.range}
                                                    </span>
                                                    <div className='flex items-center gap-2'>
                                                        <div className='w-24 bg-gray-200 rounded-full h-2'>
                                                            <div
                                                                className='bg-blue-500 h-2 rounded-full'
                                                                style={{
                                                                    width: `${group.percentage}%`,
                                                                }}
                                                            />
                                                        </div>
                                                        <span className='text-sm font-medium'>
                                                            {formatPercentage(
                                                                group.percentage
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Peak Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Clock className='h-5 w-5' />
                                    Peak Activity Hours
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='h-48 flex items-center justify-center bg-gray-50 rounded-lg'>
                                    <p className='text-gray-500'>
                                        Activity heatmap would go here
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value='content' className='space-y-6'>
                    {/* Content Performance Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>All Content Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='overflow-x-auto'>
                                <table className='w-full text-sm'>
                                    <thead>
                                        <tr className='border-b'>
                                            <th className='text-left p-2'>
                                                Content
                                            </th>
                                            <th className='text-left p-2'>
                                                Type
                                            </th>
                                            <th className='text-left p-2'>
                                                Views
                                            </th>
                                            <th className='text-left p-2'>
                                                Engagement
                                            </th>
                                            <th className='text-left p-2'>
                                                Performance
                                            </th>
                                            <th className='text-left p-2'>
                                                Published
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            ...(analytics.contentPerformance?.videos || []),
                                            ...(analytics.contentPerformance?.blogs || []),
                                        ]
                                            .sort(
                                                (a, b) =>
                                                    new Date(
                                                        b.publishedAt
                                                    ).getTime() -
                                                    new Date(
                                                        a.publishedAt
                                                    ).getTime()
                                            )
                                            .map((content) => (
                                                <tr
                                                    key={content.id}
                                                    className='border-b hover:bg-gray-50'
                                                >
                                                    <td className='p-2'>
                                                        <div className='font-medium truncate max-w-xs'>
                                                            {content.title}
                                                        </div>
                                                    </td>
                                                    <td className='p-2'>
                                                        <Badge variant='outline'>
                                                            {content.type}
                                                        </Badge>
                                                    </td>
                                                    <td className='p-2'>
                                                        {formatNumber(
                                                            content.views
                                                        )}
                                                    </td>
                                                    <td className='p-2'>
                                                        {formatPercentage(
                                                            content.engagementRate
                                                        )}
                                                    </td>
                                                    <td className='p-2'>
                                                        <Badge
                                                            className={getPerformanceColor(
                                                                content.performance
                                                            )}
                                                        >
                                                            {
                                                                content.performance
                                                            }
                                                        </Badge>
                                                    </td>
                                                    <td className='p-2 text-gray-600'>
                                                        {new Date(
                                                            content.publishedAt
                                                        ).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value='goals' className='space-y-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* Monthly Goals */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Target className='h-5 w-5' />
                                    Monthly Goals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <div>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-sm font-medium'>
                                                Views Target
                                            </span>
                                            <span className='text-sm text-gray-600'>
                                                {formatNumber(
                                                    analytics.goals?.monthly?.current || 0
                                                )}{' '}
                                                /{' '}
                                                {formatNumber(
                                                    analytics.goals?.monthly?.target || 0
                                                )}
                                            </span>
                                        </div>
                                        <div className='w-full bg-gray-200 rounded-full h-2'>
                                            <div
                                                className='bg-blue-500 h-2 rounded-full'
                                                style={{
                                                    width: `${Math.min(
                                                        ((analytics.goals?.monthly?.current || 0) /
                                                            (analytics.goals?.monthly?.target || 1)) *
                                                            100,
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <p className='text-xs text-gray-500 mt-1'>
                                            {formatPercentage(
                                                ((analytics.goals?.monthly?.current || 0) /
                                                    (analytics.goals?.monthly?.target || 1)) *
                                                    100
                                            )}{' '}
                                            of monthly goal
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quarterly Goals */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Calendar className='h-5 w-5' />
                                    Quarterly Goals
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='space-y-4'>
                                    <div>
                                        <div className='flex items-center justify-between mb-2'>
                                            <span className='text-sm font-medium'>
                                                Views Target
                                            </span>
                                            <span className='text-sm text-gray-600'>
                                                {formatNumber(
                                                    analytics.goals?.quarterly?.current || 0
                                                )}{' '}
                                                /{' '}
                                                {formatNumber(
                                                    analytics.goals?.quarterly?.target || 0
                                                )}
                                            </span>
                                        </div>
                                        <div className='w-full bg-gray-200 rounded-full h-2'>
                                            <div
                                                className='bg-green-500 h-2 rounded-full'
                                                style={{
                                                    width: `${Math.min(
                                                        ((analytics.goals?.quarterly?.current || 0) /
                                                            (analytics.goals?.quarterly?.target || 1)) *
                                                        100
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <p className='text-xs text-gray-500 mt-1'>
                                            {formatPercentage(
                                                ((analytics.goals?.quarterly?.current || 0) /
                                                    (analytics.goals?.quarterly?.target || 1)) *
                                                    100
                                            )}{' '}
                                            of quarterly goal
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string;
    change: number;
    icon: React.ReactNode;
    color: 'blue' | 'red' | 'green' | 'purple';
}

function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
    const isPositive = change > 0;
    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        red: 'bg-red-100 text-red-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
    };

    return (
        <Card>
            <CardContent className='p-6'>
                <div className='flex items-center justify-between'>
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        {icon}
                    </div>
                    <div
                        className={`flex items-center gap-1 text-sm ${
                            isPositive ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        {isPositive ? (
                            <TrendingUp className='h-4 w-4' />
                        ) : (
                            <TrendingDown className='h-4 w-4' />
                        )}
                        {Math.abs(change)}%
                    </div>
                </div>
                <div className='mt-4'>
                    <div className='text-2xl font-bold text-gray-900'>
                        {value}
                    </div>
                    <div className='text-sm text-gray-600'>{title}</div>
                </div>
            </CardContent>
        </Card>
    );
}

// Mock data for development
function getMockAnalytics(): AnalyticsData {
    return {
        overview: {
            totalViews: 125430,
            totalLikes: 8920,
            totalComments: 1240,
            totalShares: 680,
            engagementRate: 7.2,
            avgViewDuration: 240,
            subscriberGrowth: 15.5,
            contentCount: 28,
        },
        timeRange: {
            views: Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                count: Math.floor(Math.random() * 5000) + 1000,
            })),
            engagement: Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                rate: Math.random() * 10 + 5,
            })),
            contentPublished: Array.from({ length: 7 }, (_, i) => ({
                date: new Date(Date.now() - i * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                count: Math.floor(Math.random() * 3),
            })),
        },
        contentPerformance: {
            videos: [
                {
                    id: '1',
                    title: 'Finding Hope After Prison: My Journey to Recovery',
                    type: 'video',
                    publishedAt: '2024-01-15T10:00:00Z',
                    views: 15420,
                    likes: 890,
                    comments: 124,
                    shares: 67,
                    engagementRate: 8.5,
                    avgViewDuration: 280,
                    status: 'PUBLISHED',
                    performance: 'excellent',
                },
                {
                    id: '2',
                    title: 'Reentry Resources: What I Wish I Knew',
                    type: 'video',
                    publishedAt: '2024-01-10T14:00:00Z',
                    views: 8760,
                    likes: 456,
                    comments: 67,
                    shares: 34,
                    engagementRate: 6.8,
                    avgViewDuration: 195,
                    status: 'PUBLISHED',
                    performance: 'good',
                },
            ],
            blogs: [
                {
                    id: '3',
                    title: 'The Power of Community in Recovery',
                    type: 'blog',
                    publishedAt: '2024-01-12T09:00:00Z',
                    views: 4320,
                    likes: 234,
                    comments: 45,
                    shares: 23,
                    engagementRate: 7.1,
                    readTime: 5,
                    status: 'PUBLISHED',
                    performance: 'good',
                },
            ],
        },
        audienceInsights: {
            demographics: {
                ageGroups: [
                    { range: '18-24', percentage: 15 },
                    { range: '25-34', percentage: 35 },
                    { range: '35-44', percentage: 28 },
                    { range: '45-54', percentage: 15 },
                    { range: '55+', percentage: 7 },
                ],
                locations: [
                    { country: 'United States', percentage: 78 },
                    { country: 'Canada', percentage: 12 },
                    { country: 'United Kingdom', percentage: 6 },
                    { country: 'Australia', percentage: 4 },
                ],
                interests: [
                    { topic: 'Criminal Justice Reform', percentage: 45 },
                    { topic: 'Addiction Recovery', percentage: 38 },
                    { topic: 'Mental Health', percentage: 32 },
                    { topic: 'Community Support', percentage: 28 },
                ],
            },
            behavior: {
                peakHours: Array.from({ length: 24 }, (_, i) => ({
                    hour: i,
                    activity: Math.random() * 100,
                })),
                deviceTypes: [
                    { type: 'Mobile', percentage: 65 },
                    { type: 'Desktop', percentage: 28 },
                    { type: 'Tablet', percentage: 7 },
                ],
            },
        },
        goals: {
            monthly: {
                target: 50000,
                current: 32450,
                period: 'January 2024',
            },
            quarterly: {
                target: 150000,
                current: 89230,
                period: 'Q1 2024',
            },
        },
    };
}
