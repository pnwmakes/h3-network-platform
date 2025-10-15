'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
    Users,
    Video,
    FileText,
    TrendingUp,
    Settings,
    Shield,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface AdminStats {
    totalUsers: number;
    totalCreators: number;
    totalVideos: number;
    totalBlogs: number;
    pendingContent: number;
    activeCreators: number;
    monthlyViews: number;
    registrationsThisMonth: number;
}

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        // Check if user is super admin
        if (session.user.role !== 'SUPER_ADMIN') {
            router.push('/');
            return;
        }

        fetchAdminStats();
    }, [session, status, router]);

    const fetchAdminStats = async () => {
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            } else {
                console.error('Failed to fetch admin stats:', data.error);
            }
        } catch (error) {
            console.error('Admin stats fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Card className='w-96'>
                    <CardContent className='p-6 text-center'>
                        <h2 className='text-xl font-semibold mb-4'>
                            Unable to Load Dashboard
                        </h2>
                        <p className='text-gray-600 mb-4'>
                            There was an issue loading the admin dashboard.
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Retry
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
                            <Shield className='h-8 w-8 text-blue-600' />
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900'>
                                    Admin Dashboard
                                </h1>
                                <p className='text-sm text-gray-500'>
                                    H3 Network Platform Management
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center space-x-4'>
                            <Badge
                                variant='outline'
                                className='bg-blue-50 text-blue-700 border-blue-200'
                            >
                                Super Admin
                            </Badge>
                            <div className='text-right'>
                                <p className='text-sm font-medium text-gray-900'>
                                    {session?.user?.name}
                                </p>
                                <p className='text-xs text-gray-500'>
                                    {session?.user?.email}
                                </p>
                            </div>
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
                                        Total Users
                                    </p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {stats.totalUsers}
                                    </p>
                                </div>
                                <Users className='h-8 w-8 text-blue-600' />
                            </div>
                            <div className='mt-4 flex items-center'>
                                <Badge variant='secondary' className='text-xs'>
                                    +{stats.registrationsThisMonth} this month
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Active Creators
                                    </p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {stats.activeCreators}
                                    </p>
                                </div>
                                <Video className='h-8 w-8 text-green-600' />
                            </div>
                            <div className='mt-4 flex items-center'>
                                <Badge variant='secondary' className='text-xs'>
                                    {stats.totalCreators} total creators
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Total Content
                                    </p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {stats.totalVideos + stats.totalBlogs}
                                    </p>
                                </div>
                                <FileText className='h-8 w-8 text-purple-600' />
                            </div>
                            <div className='mt-4 flex items-center space-x-2'>
                                <Badge variant='secondary' className='text-xs'>
                                    {stats.totalVideos} videos
                                </Badge>
                                <Badge variant='secondary' className='text-xs'>
                                    {stats.totalBlogs} blogs
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className='p-6'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium text-gray-600'>
                                        Monthly Views
                                    </p>
                                    <p className='text-3xl font-bold text-gray-900'>
                                        {stats.monthlyViews.toLocaleString()}
                                    </p>
                                </div>
                                <TrendingUp className='h-8 w-8 text-orange-600' />
                            </div>
                            <div className='mt-4 flex items-center'>
                                <Badge variant='secondary' className='text-xs'>
                                    Platform engagement
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Pending Content Alert */}
                {stats.pendingContent > 0 && (
                    <Card className='mb-8 border-orange-200 bg-orange-50'>
                        <CardContent className='p-6'>
                            <div className='flex items-center space-x-3'>
                                <AlertTriangle className='h-6 w-6 text-orange-600' />
                                <div className='flex-1'>
                                    <h3 className='text-lg font-medium text-orange-900'>
                                        Content Awaiting Review
                                    </h3>
                                    <p className='text-orange-700'>
                                        {stats.pendingContent} pieces of content
                                        are waiting for approval.
                                    </p>
                                </div>
                                <Button
                                    variant='outline'
                                    className='border-orange-300 text-orange-700 hover:bg-orange-100'
                                    onClick={() =>
                                        router.push('/admin/content')
                                    }
                                >
                                    Review Content
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Admin Actions */}
                <Tabs defaultValue='overview' className='space-y-6'>
                    <TabsList className='grid w-full grid-cols-5'>
                        <TabsTrigger value='overview'>Overview</TabsTrigger>
                        <TabsTrigger value='users'>Users</TabsTrigger>
                        <TabsTrigger value='content'>Content</TabsTrigger>
                        <TabsTrigger value='creators'>Creators</TabsTrigger>
                        <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value='overview' className='space-y-6'>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            <Card
                                className='hover:shadow-md transition-shadow cursor-pointer'
                                onClick={() => router.push('/admin/users')}
                            >
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        User Management
                                    </CardTitle>
                                    <Users className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <p className='text-2xl font-bold'>
                                        {stats.totalUsers}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Manage user accounts and permissions
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className='hover:shadow-md transition-shadow cursor-pointer'
                                onClick={() => router.push('/admin/content')}
                            >
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Content Approval
                                    </CardTitle>
                                    <CheckCircle className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <p className='text-2xl font-bold'>
                                        {stats.pendingContent}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Review and approve creator content
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className='hover:shadow-md transition-shadow cursor-pointer'
                                onClick={() =>
                                    router.push('/admin/creator-management')
                                }
                            >
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Creator Management
                                    </CardTitle>
                                    <Video className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <p className='text-2xl font-bold'>
                                        {stats.totalCreators}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Manage creator onboarding and profiles
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className='hover:shadow-md transition-shadow cursor-pointer'
                                onClick={() => router.push('/admin/analytics')}
                            >
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Platform Analytics
                                    </CardTitle>
                                    <TrendingUp className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <p className='text-2xl font-bold'>
                                        {stats.monthlyViews.toLocaleString()}
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        View platform performance metrics
                                    </p>
                                </CardContent>
                            </Card>

                            <Card
                                className='hover:shadow-md transition-shadow cursor-pointer'
                                onClick={() => router.push('/admin/settings')}
                            >
                                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Platform Settings
                                    </CardTitle>
                                    <Settings className='h-4 w-4 text-muted-foreground' />
                                </CardHeader>
                                <CardContent>
                                    <p className='text-2xl font-bold'>
                                        Configure
                                    </p>
                                    <p className='text-xs text-muted-foreground'>
                                        Manage platform configuration
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value='users'>
                        <Card>
                            <CardHeader>
                                <CardTitle>User Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-gray-600 mb-4'>
                                    This section will contain user management
                                    tools.
                                </p>
                                <Button
                                    onClick={() => router.push('/admin/users')}
                                >
                                    Go to User Management
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='content'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Content Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-gray-600 mb-4'>
                                    Review and manage all platform content.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.push('/admin/content')
                                    }
                                >
                                    Review Content
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='creators'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Creator Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-gray-600 mb-4'>
                                    Manage creator applications and profiles.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.push('/admin/creator-management')
                                    }
                                >
                                    Manage Creators
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='analytics'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-gray-600 mb-4'>
                                    View detailed platform performance metrics.
                                </p>
                                <Button
                                    onClick={() =>
                                        router.push('/admin/analytics')
                                    }
                                >
                                    View Analytics
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
