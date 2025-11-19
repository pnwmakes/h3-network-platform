'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    BarChart3,
    TrendingUp,
    Users,
    Video,
    FileText,
    Eye,
    Clock,
    Download,
    RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
    overview: {
        totalUsers: number;
        totalContent: number;
        totalCreators: number;
        totalRevenue: number;
        newUsersThisMonth: number;
        newContentThisMonth: number;
        activeUsersToday: number;
        totalViews: number;
        totalLikes: number;
        avgEngagementRate: number;
    };
    topContent: Array<{
        id: string;
        title: string;
        views: number;
        likes: number;
        type: string;
        creator: {
            name: string;
        };
    }>;
    userGrowth: Array<{
        month: string;
        users: number;
    }>;
    contentByCategory: Array<{
        category: string;
        count: number;
        avgViews: number;
        avgLikes: number;
    }>;
    recentActivity: {
        users: Array<{
            id: string;
            name: string;
            email: string;
            createdAt: string;
            role: string;
        }>;
        content: Array<{
            id: string;
            title: string;
            status: string;
            createdAt: string;
            type: string;
            creator: {
                name: string;
            };
        }>;
    };
    goals: Array<{
        name: string;
        current: number;
        target: number;
        progress: number;
    }>;
}

export default function AdminAnalytics() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        if (session.user.role !== 'SUPER_ADMIN') {
            router.push('/');
            return;
        }

        fetchAnalytics();
    }, [session, status, router]);

    const fetchAnalytics = async () => {
        try {
            setError(null);
            const response = await fetch('/api/admin/analytics');

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                        `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            // Check if it's an error response
            if (data.error) {
                throw new Error(data.error);
            }

            // The API returns analytics data directly, not wrapped in a success object
            setAnalytics(data);
        } catch (error) {
            console.error('Analytics fetch error:', error);
            setError(
                error instanceof Error
                    ? error.message
                    : 'Failed to load analytics data'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    };

    const exportData = () => {
        if (!analytics) return;

        // Create CSV content with multiple sections
        let csvContent = '';
        const date = new Date().toLocaleDateString();

        // Header section
        csvContent += `H3 Network Platform Analytics Report\n`;
        csvContent += `Generated on: ${date}\n\n`;

        // Platform Overview
        csvContent += `PLATFORM OVERVIEW\n`;
        csvContent += `Metric,Value\n`;
        csvContent += `Total Users,${analytics.overview.totalUsers.toLocaleString()}\n`;
        csvContent += `Total Content,${analytics.overview.totalContent.toLocaleString()}\n`;
        csvContent += `Total Creators,${analytics.overview.totalCreators.toLocaleString()}\n`;
        csvContent += `Total Views,${analytics.overview.totalViews.toLocaleString()}\n`;
        csvContent += `Total Likes,${analytics.overview.totalLikes.toLocaleString()}\n`;
        csvContent += `Engagement Rate,${analytics.overview.avgEngagementRate}%\n`;
        csvContent += `New Users This Month,${analytics.overview.newUsersThisMonth.toLocaleString()}\n`;
        csvContent += `New Content This Month,${analytics.overview.newContentThisMonth.toLocaleString()}\n`;
        csvContent += `Active Users Today,${analytics.overview.activeUsersToday.toLocaleString()}\n\n`;

        // Top Performing Content
        csvContent += `TOP PERFORMING CONTENT\n`;
        csvContent += `Title,Type,Creator,Views,Likes\n`;
        analytics.topContent.forEach((content) => {
            csvContent += `"${content.title}",${content.type},"${
                content.creator.name
            }",${content.views.toLocaleString()},${content.likes.toLocaleString()}\n`;
        });
        csvContent += `\n`;

        // Content by Category
        csvContent += `CONTENT BY TOPIC\n`;
        csvContent += `Topic,Count,Average Views,Average Likes\n`;
        analytics.contentByCategory.forEach((category) => {
            csvContent += `${category.category},${
                category.count
            },${category.avgViews.toLocaleString()},${category.avgLikes.toLocaleString()}\n`;
        });
        csvContent += `\n`;

        // User Growth
        csvContent += `USER GROWTH (Last 12 Months)\n`;
        csvContent += `Month,New Users\n`;
        analytics.userGrowth.forEach((growth) => {
            csvContent += `${growth.month},${growth.users.toLocaleString()}\n`;
        });
        csvContent += `\n`;

        // Goals Progress
        csvContent += `GOALS PROGRESS\n`;
        csvContent += `Goal,Current,Target,Progress %\n`;
        analytics.goals.forEach((goal) => {
            csvContent += `"${
                goal.name
            }",${goal.current.toLocaleString()},${goal.target.toLocaleString()},${Math.round(
                goal.progress
            )}%\n`;
        });
        csvContent += `\n`;

        // Recent Users
        csvContent += `RECENT USERS\n`;
        csvContent += `Name,Email,Role,Registration Date\n`;
        analytics.recentActivity.users.forEach((user) => {
            const regDate = new Date(user.createdAt).toLocaleDateString();
            csvContent += `"${user.name || 'N/A'}","${user.email}",${
                user.role
            },${regDate}\n`;
        });
        csvContent += `\n`;

        // Recent Content
        csvContent += `RECENT CONTENT\n`;
        csvContent += `Title,Type,Creator,Status,Created Date\n`;
        analytics.recentActivity.content.forEach((content) => {
            const createdDate = new Date(
                content.createdAt
            ).toLocaleDateString();
            csvContent += `"${content.title}",${content.type},"${content.creator.name}",${content.status},${createdDate}\n`;
        });

        // Create and download CSV file
        const blob = new Blob([csvContent], {
            type: 'text/csv;charset=utf-8;',
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute(
            'download',
            `H3-Analytics-Report-${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <Card className='w-96'>
                    <CardContent className='p-6 text-center'>
                        <h2 className='text-xl font-semibold mb-4'>
                            Error Loading Analytics
                        </h2>
                        <p className='text-gray-600 mb-4'>{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white shadow-sm border-b'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center py-4'>
                        <div className='flex items-center space-x-4'>
                            <Link
                                href='/admin/dashboard'
                                className='text-gray-500 hover:text-gray-700'
                            >
                                <ChevronLeft className='h-5 w-5' />
                            </Link>
                            <BarChart3 className='h-8 w-8 text-blue-600' />
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900'>
                                    Platform Analytics
                                </h1>
                                <p className='text-sm text-gray-500'>
                                    Comprehensive platform performance insights
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                            <Badge
                                variant='outline'
                                className='bg-blue-50 text-blue-700 border-blue-200'
                            >
                                Super Admin Access
                            </Badge>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                <RefreshCw
                                    className={`h-4 w-4 mr-2 ${
                                        refreshing ? 'animate-spin' : ''
                                    }`}
                                />
                                Refresh
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={exportData}
                            >
                                <Download className='h-4 w-4 mr-2' />
                                Export CSV
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Overview Stats */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Total Views
                                    </p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {analytics?.overview.totalViews.toLocaleString()}
                                    </p>
                                </div>
                                <Eye className='h-8 w-8 text-blue-600' />
                            </div>
                            <p className='text-xs text-green-600 mt-2'>
                                ↗ +12% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Engagement Rate
                                    </p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {analytics?.overview.avgEngagementRate}%
                                    </p>
                                </div>
                                <TrendingUp className='h-8 w-8 text-green-600' />
                            </div>
                            <p className='text-xs text-green-600 mt-2'>
                                ↗ +5.2% from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Avg Watch Time
                                    </p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        2:34
                                    </p>
                                </div>
                                <Clock className='h-8 w-8 text-purple-600' />
                            </div>
                            <p className='text-xs text-gray-500 mt-2'>
                                Stable from last month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Total Interactions
                                    </p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {analytics?.overview.totalLikes.toLocaleString()}
                                    </p>
                                </div>
                                <Users className='h-8 w-8 text-orange-600' />
                            </div>
                            <p className='text-xs text-green-600 mt-2'>
                                ↗ +18% from last month
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Content */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performing Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                {analytics?.topContent
                                    .slice(0, 5)
                                    .map((content, index) => (
                                        <div
                                            key={content.id}
                                            className='flex items-center space-x-4'
                                        >
                                            <div className='flex-shrink-0'>
                                                <div className='w-12 h-8 bg-gray-200 rounded flex items-center justify-center'>
                                                    {content.type ===
                                                    'video' ? (
                                                        <Video className='h-4 w-4 text-gray-500' />
                                                    ) : (
                                                        <FileText className='h-4 w-4 text-gray-500' />
                                                    )}
                                                </div>
                                            </div>
                                            <div className='flex-1 min-w-0'>
                                                <p className='text-sm font-medium text-gray-900 truncate'>
                                                    {content.title}
                                                </p>
                                                <p className='text-xs text-gray-500'>
                                                    {content.views.toLocaleString()}{' '}
                                                    views • {content.likes}{' '}
                                                    likes
                                                </p>
                                            </div>
                                            <div className='text-sm font-medium text-gray-900'>
                                                #{index + 1}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Audience Demographics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div>
                                    <h4 className='text-sm font-medium text-gray-900 mb-2'>
                                        Content by Topic
                                    </h4>
                                    <div className='space-y-2'>
                                        {analytics?.contentByCategory
                                            .slice(0, 6)
                                            .map((category) => (
                                                <div
                                                    key={category.category}
                                                    className='flex items-center justify-between'
                                                >
                                                    <span className='text-sm text-gray-600'>
                                                        {category.category}
                                                    </span>
                                                    <div className='flex items-center space-x-2'>
                                                        <span className='text-sm font-medium'>
                                                            {category.count}{' '}
                                                            items
                                                        </span>
                                                        <span className='text-xs text-gray-500'>
                                                            ({category.avgViews}{' '}
                                                            avg views)
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className='text-sm font-medium text-gray-900 mb-2'>
                                        Recent Activity
                                    </h4>
                                    <div className='space-y-2'>
                                        {analytics?.recentActivity.content
                                            .slice(0, 4)
                                            .map((content) => (
                                                <div
                                                    key={content.id}
                                                    className='flex items-center justify-between'
                                                >
                                                    <div>
                                                        <span className='text-sm text-gray-600 truncate'>
                                                            {content.title}
                                                        </span>
                                                        <p className='text-xs text-gray-500'>
                                                            {
                                                                content.creator
                                                                    .name
                                                            }
                                                        </p>
                                                    </div>
                                                    <span className='text-xs text-gray-500'>
                                                        {content.status}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Goals Progress */}
                <Card>
                    <CardHeader>
                        <CardTitle>Platform Goals & KPIs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            {analytics?.goals.map((goal) => (
                                <div key={goal.name} className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <h4 className='text-sm font-medium text-gray-900'>
                                            {goal.name}
                                        </h4>
                                        <Badge
                                            variant={
                                                goal.progress >= 75
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                            className={
                                                goal.progress >= 75
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                            }
                                        >
                                            {goal.progress >= 75
                                                ? 'On Track'
                                                : 'Behind'}
                                        </Badge>
                                    </div>
                                    <div className='space-y-1'>
                                        <div className='flex items-center justify-between text-sm'>
                                            <span className='text-gray-600'>
                                                {typeof goal.current ===
                                                    'number' && goal.current < 1
                                                    ? (
                                                          goal.current * 100
                                                      ).toFixed(1) + '%'
                                                    : goal.current.toLocaleString()}{' '}
                                                /{' '}
                                                {typeof goal.target ===
                                                    'number' && goal.target < 1
                                                    ? (
                                                          goal.target * 100
                                                      ).toFixed(1) + '%'
                                                    : goal.target.toLocaleString()}
                                            </span>
                                            <span className='font-medium'>
                                                {goal.progress.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className='w-full bg-gray-200 rounded-full h-2'>
                                            <div
                                                className={`h-2 rounded-full ${
                                                    goal.progress >= 75
                                                        ? 'bg-green-600'
                                                        : 'bg-yellow-600'
                                                }`}
                                                style={{
                                                    width: `${Math.min(
                                                        goal.progress,
                                                        100
                                                    )}%`,
                                                }}
                                            ></div>
                                        </div>
                                        <p className='text-xs text-gray-500'>
                                            Target:{' '}
                                            {goal.target.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
