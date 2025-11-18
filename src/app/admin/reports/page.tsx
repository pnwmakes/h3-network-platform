'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    ChevronLeft,
    FileText,
    Users,
    Video,
    Download,
    RefreshCw,
    Activity,
} from 'lucide-react';

interface ReportsData {
    overview: {
        totalUsers: number;
        activeUsers: number;
        totalContent: number;
        pendingContent: number;
    };
    userActivity: {
        newRegistrations: {
            lastWeek: number;
            lastMonth: number;
        };
        usersByRole: Array<{
            role: string;
            _count: { role: number };
        }>;
    };
    contentActivity: {
        contentByStatus: {
            videos: Array<{
                status: string;
                _count: { status: number };
            }>;
            blogs: Array<{
                status: string;
                _count: { status: number };
            }>;
        };
        recentContent: {
            videos: Array<{
                id: string;
                title: string;
                status: string;
                createdAt: string;
                creator: { displayName: string };
            }>;
            blogs: Array<{
                id: string;
                title: string;
                status: string;
                createdAt: string;
                creator: { displayName: string };
            }>;
        };
    };
    creatorActivity: {
        totalCreators: number;
        activeCreators: number;
        topCreators: Array<{
            id: string;
            displayName: string;
            _count: {
                videos: number;
                blogs: number;
            };
        }>;
    };
    systemHealth: {
        databaseStatus: string;
        lastBackup: string;
        storageUsed: string;
        bandwidth: string;
        uptime: string;
    };
}

export default function AdminReports() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [reports, setReports] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [generatedAt, setGeneratedAt] = useState<string>('');

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

        fetchReports();
    }, [session, status, router]);

    const fetchReports = async () => {
        try {
            setError(null);
            const response = await fetch('/api/admin/reports');
            const data = await response.json();

            if (data.success) {
                setReports(data.reports);
                setGeneratedAt(data.generatedAt);
            } else {
                throw new Error(data.error || 'Failed to fetch reports');
            }
        } catch (error) {
            console.error('Reports fetch error:', error);
            setError('Failed to load reports data');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchReports();
        setRefreshing(false);
    };

    const exportReport = (reportType: string) => {
        if (!reports) return;
        
        const reportData = reportType === 'full' ? reports : reports[reportType as keyof ReportsData];
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `h3-${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
        
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
                        <h2 className='text-xl font-semibold mb-4'>Error Loading Reports</h2>
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
                            <FileText className='h-8 w-8 text-blue-600' />
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900'>
                                    Platform Reports
                                </h1>
                                <p className='text-sm text-gray-500'>
                                    Generated {generatedAt ? new Date(generatedAt).toLocaleString() : 'now'}
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
                                onClick={() => exportReport('full')}
                            >
                                <Download className='h-4 w-4 mr-2' />
                                Export All
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
                                    <p className='text-sm font-medium text-gray-600'>Total Users</p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {reports?.overview.totalUsers}
                                    </p>
                                </div>
                                <Users className='h-8 w-8 text-blue-600' />
                            </div>
                            <p className='text-xs text-gray-500 mt-2'>
                                {reports?.userActivity.newRegistrations.lastMonth} new this month
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>Total Content</p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {reports?.overview.totalContent}
                                    </p>
                                </div>
                                <FileText className='h-8 w-8 text-green-600' />
                            </div>
                            <p className='text-xs text-gray-500 mt-2'>
                                {reports?.overview.pendingContent} pending approval
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>Active Users</p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {reports?.overview.activeUsers}
                                    </p>
                                </div>
                                <Activity className='h-8 w-8 text-purple-600' />
                            </div>
                            <p className='text-xs text-green-600 mt-2'>
                                {reports?.overview.activeUsers && reports?.overview.totalUsers 
                                    ? Math.round((reports.overview.activeUsers / reports.overview.totalUsers) * 100)
                                    : 0}% of total users
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>Active Creators</p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {reports?.creatorActivity.activeCreators}
                                    </p>
                                </div>
                                <Video className='h-8 w-8 text-orange-600' />
                            </div>
                            <p className='text-xs text-gray-500 mt-2'>
                                of {reports?.creatorActivity.totalCreators} total creators
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Reports */}
                <Tabs defaultValue='users' className='space-y-6'>
                    <TabsList className='grid w-full grid-cols-4'>
                        <TabsTrigger value='users'>Users</TabsTrigger>
                        <TabsTrigger value='content'>Content</TabsTrigger>
                        <TabsTrigger value='creators'>Creators</TabsTrigger>
                        <TabsTrigger value='system'>System</TabsTrigger>
                    </TabsList>

                    <TabsContent value='users' className='space-y-6'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between'>
                                    <CardTitle>User Activity</CardTitle>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => exportReport('userActivity')}
                                    >
                                        <Download className='h-4 w-4 mr-2' />
                                        Export
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-medium'>New registrations (7 days)</span>
                                            <span className='text-lg font-bold text-green-600'>
                                                {reports?.userActivity.newRegistrations.lastWeek}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-medium'>New registrations (30 days)</span>
                                            <span className='text-lg font-bold text-blue-600'>
                                                {reports?.userActivity.newRegistrations.lastMonth}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Users by Role</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-3'>
                                        {reports?.userActivity.usersByRole.map((roleData) => (
                                            <div key={roleData.role} className='flex items-center justify-between'>
                                                <div className='flex items-center space-x-2'>
                                                    <Badge variant='outline'>
                                                        {roleData.role}
                                                    </Badge>
                                                </div>
                                                <span className='font-medium'>
                                                    {roleData._count.role}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value='content' className='space-y-6'>
                        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                            <Card>
                                <CardHeader className='flex flex-row items-center justify-between'>
                                    <CardTitle>Content by Status</CardTitle>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() => exportReport('contentActivity')}
                                    >
                                        <Download className='h-4 w-4 mr-2' />
                                        Export
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-4'>
                                        <div>
                                            <h4 className='text-sm font-medium text-gray-900 mb-2'>Videos</h4>
                                            <div className='space-y-2'>
                                                {reports?.contentActivity.contentByStatus.videos.map((statusData) => (
                                                    <div key={statusData.status} className='flex items-center justify-between'>
                                                        <Badge variant='outline'>
                                                            {statusData.status}
                                                        </Badge>
                                                        <span className='font-medium'>
                                                            {statusData._count.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className='text-sm font-medium text-gray-900 mb-2'>Blogs</h4>
                                            <div className='space-y-2'>
                                                {reports?.contentActivity.contentByStatus.blogs.map((statusData) => (
                                                    <div key={statusData.status} className='flex items-center justify-between'>
                                                        <Badge variant='outline'>
                                                            {statusData.status}
                                                        </Badge>
                                                        <span className='font-medium'>
                                                            {statusData._count.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Recent Content</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='space-y-4'>
                                        <div>
                                            <h4 className='text-sm font-medium text-gray-900 mb-2'>Latest Videos</h4>
                                            <div className='space-y-2'>
                                                {reports?.contentActivity.recentContent.videos.slice(0, 3).map((video) => (
                                                    <div key={video.id} className='text-sm'>
                                                        <p className='font-medium text-gray-900 truncate'>
                                                            {video.title}
                                                        </p>
                                                        <p className='text-gray-500 text-xs'>
                                                            by {video.creator.displayName} • {new Date(video.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <h4 className='text-sm font-medium text-gray-900 mb-2'>Latest Blogs</h4>
                                            <div className='space-y-2'>
                                                {reports?.contentActivity.recentContent.blogs.slice(0, 3).map((blog) => (
                                                    <div key={blog.id} className='text-sm'>
                                                        <p className='font-medium text-gray-900 truncate'>
                                                            {blog.title}
                                                        </p>
                                                        <p className='text-gray-500 text-xs'>
                                                            by {blog.creator.displayName} • {new Date(blog.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value='creators' className='space-y-6'>
                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between'>
                                <CardTitle>Top Creators</CardTitle>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => exportReport('creatorActivity')}
                                >
                                    <Download className='h-4 w-4 mr-2' />
                                    Export
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className='overflow-x-auto'>
                                    <table className='w-full'>
                                        <thead>
                                            <tr className='border-b'>
                                                <th className='text-left py-2'>Creator</th>
                                                <th className='text-right py-2'>Videos</th>
                                                <th className='text-right py-2'>Blogs</th>
                                                <th className='text-right py-2'>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports?.creatorActivity.topCreators.slice(0, 10).map((creator) => (
                                                <tr key={creator.id} className='border-b'>
                                                    <td className='py-2 font-medium'>
                                                        {creator.displayName}
                                                    </td>
                                                    <td className='py-2 text-right'>
                                                        {creator._count.videos}
                                                    </td>
                                                    <td className='py-2 text-right'>
                                                        {creator._count.blogs}
                                                    </td>
                                                    <td className='py-2 text-right font-medium'>
                                                        {creator._count.videos + creator._count.blogs}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='system' className='space-y-6'>
                        <Card>
                            <CardHeader className='flex flex-row items-center justify-between'>
                                <CardTitle>System Health</CardTitle>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => exportReport('systemHealth')}
                                >
                                    <Download className='h-4 w-4 mr-2' />
                                    Export
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-medium'>Database Status</span>
                                            <Badge variant='default' className='bg-green-100 text-green-800'>
                                                {reports?.systemHealth.databaseStatus}
                                            </Badge>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-medium'>System Uptime</span>
                                            <span className='font-medium text-green-600'>
                                                {reports?.systemHealth.uptime}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-medium'>Storage Used</span>
                                            <span className='font-medium'>
                                                {reports?.systemHealth.storageUsed}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className='space-y-4'>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-medium'>Bandwidth Usage</span>
                                            <span className='font-medium'>
                                                {reports?.systemHealth.bandwidth}
                                            </span>
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <span className='text-sm font-medium'>Last Backup</span>
                                            <span className='font-medium text-blue-600'>
                                                {reports?.systemHealth.lastBackup 
                                                    ? new Date(reports.systemHealth.lastBackup).toLocaleString()
                                                    : 'N/A'
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}