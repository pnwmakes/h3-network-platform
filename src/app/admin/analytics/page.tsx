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
        totalViews: number;
        totalLikes: number;
        totalComments: number;
        totalShares: number;
        averageWatchTime: string;
        engagementRate: string;
    };
    performance: {
        topContent: Array<{
            id: string;
            title: string;
            type: string;
            views: number;
            engagement: number;
            thumbnail: string;
        }>;
        viewsOverTime: Array<{
            date: string;
            views: number;
            engagement: number;
        }>;
    };
    audience: {
        demographics: {
            ageGroups: Array<{
                range: string;
                percentage: number;
            }>;
            locations: Array<{
                country: string;
                percentage: number;
            }>;
        };
        engagement: {
            peakHours: Array<{
                hour: number;
                engagement: number;
            }>;
        };
    };
    goals: Array<{
        id: string;
        title: string;
        target: number;
        current: number;
        progress: number;
        deadline: string;
        status: string;
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
            const data = await response.json();

            if (data.success) {
                // For now, use creator analytics as a base for admin analytics
                const response2 = await fetch('/api/creator/analytics');
                const creatorData = await response2.json();
                
                if (creatorData.success) {
                    setAnalytics(creatorData.analytics);
                } else {
                    throw new Error('Failed to fetch analytics');
                }
            } else {
                throw new Error(data.error || 'Failed to fetch analytics');
            }
        } catch (error) {
            console.error('Analytics fetch error:', error);
            setError('Failed to load analytics data');
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
        
        const dataStr = JSON.stringify(analytics, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `h3-analytics-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
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
                        <h2 className='text-xl font-semibold mb-4'>Error Loading Analytics</h2>
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
                            <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
                                Super Admin Access
                            </Badge>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={handleRefresh}
                                disabled={refreshing}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={exportData}
                            >
                                <Download className='h-4 w-4 mr-2' />
                                Export
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
                                    <p className='text-sm font-medium text-gray-600'>Total Views</p>
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
                                    <p className='text-sm font-medium text-gray-600'>Engagement Rate</p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {analytics?.overview.engagementRate}%
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
                                    <p className='text-sm font-medium text-gray-600'>Avg Watch Time</p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {analytics?.overview.averageWatchTime}
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
                                    <p className='text-sm font-medium text-gray-600'>Total Interactions</p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {((analytics?.overview.totalLikes || 0) + 
                                          (analytics?.overview.totalComments || 0) + 
                                          (analytics?.overview.totalShares || 0)).toLocaleString()}
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
                                {analytics?.performance.topContent.slice(0, 5).map((content, index) => (
                                    <div key={content.id} className='flex items-center space-x-4'>
                                        <div className='flex-shrink-0'>
                                            <div className='w-12 h-8 bg-gray-200 rounded flex items-center justify-center'>
                                                {content.type === 'video' ? (
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
                                                {content.views.toLocaleString()} views • {(content.engagement * 100).toFixed(1)}% engagement
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
                                    <h4 className='text-sm font-medium text-gray-900 mb-2'>Age Groups</h4>
                                    <div className='space-y-2'>
                                        {analytics?.audience.demographics.ageGroups.map((group) => (
                                            <div key={group.range} className='flex items-center justify-between'>
                                                <span className='text-sm text-gray-600'>{group.range}</span>
                                                <div className='flex items-center space-x-2'>
                                                    <div className='w-20 bg-gray-200 rounded-full h-2'>
                                                        <div 
                                                            className='bg-blue-600 h-2 rounded-full' 
                                                            style={{ width: `${group.percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className='text-sm font-medium'>{group.percentage}%</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h4 className='text-sm font-medium text-gray-900 mb-2'>Top Locations</h4>
                                    <div className='space-y-2'>
                                        {analytics?.audience.demographics.locations.slice(0, 4).map((location) => (
                                            <div key={location.country} className='flex items-center justify-between'>
                                                <span className='text-sm text-gray-600'>{location.country}</span>
                                                <span className='text-sm font-medium'>{location.percentage}%</span>
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
                                <div key={goal.id} className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <h4 className='text-sm font-medium text-gray-900'>{goal.title}</h4>
                                        <Badge 
                                            variant={goal.status === 'on-track' ? 'default' : 'secondary'}
                                            className={goal.status === 'on-track' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                                        >
                                            {goal.status === 'on-track' ? 'On Track' : 'Behind'}
                                        </Badge>
                                    </div>
                                    <div className='space-y-1'>
                                        <div className='flex items-center justify-between text-sm'>
                                            <span className='text-gray-600'>
                                                {typeof goal.current === 'number' && goal.current < 1 
                                                    ? (goal.current * 100).toFixed(1) + '%'
                                                    : goal.current.toLocaleString()
                                                } / {typeof goal.target === 'number' && goal.target < 1 
                                                    ? (goal.target * 100).toFixed(1) + '%' 
                                                    : goal.target.toLocaleString()
                                                }
                                            </span>
                                            <span className='font-medium'>{goal.progress.toFixed(1)}%</span>
                                        </div>
                                        <div className='w-full bg-gray-200 rounded-full h-2'>
                                            <div 
                                                className={`h-2 rounded-full ${goal.status === 'on-track' ? 'bg-green-600' : 'bg-yellow-600'}`}
                                                style={{ width: `${Math.min(goal.progress, 100)}%` }}
                                            ></div>
                                        </div>
                                        <p className='text-xs text-gray-500'>Due: {new Date(goal.deadline).toLocaleDateString()}</p>
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