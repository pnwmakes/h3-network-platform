'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BarChart3,
    Video,
    FileText,
    Calendar,
    Settings,
    Plus,
    Eye,
    TrendingUp,
} from 'lucide-react';
// Components will be imported as they're created
// import { CreatorStats } from './CreatorStats';
import { ContentManager } from './ContentManager';
import { ContentTemplates } from './ContentTemplates';
import ScheduleCalendar from './ScheduleCalendar';
import { ScheduleContentModal } from './ScheduleContentModal';
import { AutoPublishMonitor } from './AutoPublishMonitor';
import { ProfileSettings } from './ProfileSettings';

interface RawScheduledContent {
    id: string;
    publishAt: string;
    status: string;
    contentType: string;
    video?: {
        id: string;
        title: string;
        thumbnailUrl?: string;
        status: string;
    };
    blog?: {
        id: string;
        title: string;
        featuredImage?: string;
        status: string;
    };
}

interface ScheduledContent {
    id: string;
    publishAt: string;
    status: string;
    contentType: 'video' | 'blog';
    content: {
        id: string;
        title: string;
    };
}

interface CreatorProfile {
    id: string;
    displayName: string;
    bio: string;
    avatar: string;
    avatarUrl?: string;
    showName?: string;
    funnyFact?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    isActive: boolean;
    profileComplete: boolean;
}

export function CreatorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<CreatorProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [scheduledContent, setScheduledContent] = useState<
        ScheduledContent[]
    >([]);

    const fetchScheduledContent = async () => {
        try {
            const response = await fetch('/api/creator/schedule', {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });
            if (response.ok) {
                const data = await response.json();
                // Extract scheduledContent from the response and transform it
                const rawContent = data.scheduledContent || [];
                const transformedContent = Array.isArray(rawContent)
                    ? rawContent.map((item: RawScheduledContent) => {
                          const contentType = item.contentType.toLowerCase() as
                              | 'video'
                              | 'blog';
                          const contentData = item.video || item.blog;
                          return {
                              id: item.id,
                              publishAt: item.publishAt,
                              status: item.status,
                              contentType,
                              content: {
                                  id: contentData?.id || '',
                                  title: contentData?.title || 'Untitled',
                                  thumbnailUrl:
                                      item.video?.thumbnailUrl ||
                                      item.blog?.featuredImage,
                              },
                          };
                      })
                    : [];
                setScheduledContent(transformedContent);
            } else {
                console.error(
                    'Failed to fetch scheduled content:',
                    response.status
                );
                setScheduledContent([]);
            }
        } catch (error) {
            console.error('Failed to fetch scheduled content:', error);
        }
    };

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        // Check if user is a creator or super admin
        if (
            session.user.role !== 'CREATOR' &&
            session.user.role !== 'SUPER_ADMIN'
        ) {
            router.push('/dashboard');
            return;
        }

        fetchProfile();
        fetchScheduledContent();
    }, [session, status, router]);

    const fetchProfile = async () => {
        try {
            const response = await fetch('/api/creator/profile');
            const data = await response.json();

            if (data.success) {
                setProfile(data.creator);
            } else {
                console.error('Failed to fetch profile:', data.error);
            }
        } catch (error) {
            console.error('Profile fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateContent = (type: 'video' | 'blog') => {
        if (type === 'video') {
            router.push('/creator/upload/video');
        } else {
            router.push('/creator/upload/blog');
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Card className='w-96'>
                    <CardContent className='p-6 text-center'>
                        <h2 className='text-xl font-semibold mb-4'>
                            Profile Not Found
                        </h2>
                        <p className='text-gray-600 mb-4'>
                            There was an issue loading your creator profile.
                        </p>
                        <Button
                            onClick={() => router.push('/creator/onboarding')}
                        >
                            Complete Onboarding
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
                            <div className='h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold'>
                                {profile.displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900'>
                                    Welcome back, {profile.displayName}!
                                </h1>
                                <p className='text-gray-600'>
                                    {profile.showName &&
                                        `${profile.showName} • `}
                                    H3 Network Creator
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() =>
                                    router.push(`/creators/${profile.id}`)
                                }
                            >
                                <Eye className='h-4 w-4 mr-2' />
                                Preview Profile
                            </Button>
                            <Button
                                size='sm'
                                onClick={() => setActiveTab('content')}
                            >
                                <Plus className='h-4 w-4 mr-2' />
                                Create Content
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className='w-full'
                >
                    <TabsList className='grid w-full grid-cols-5'>
                        <TabsTrigger value='overview'>
                            <BarChart3 className='h-4 w-4 mr-2' />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value='content'>
                            <Video className='h-4 w-4 mr-2' />
                            Content
                        </TabsTrigger>
                        <TabsTrigger value='schedule'>
                            <Calendar className='h-4 w-4 mr-2' />
                            Schedule
                        </TabsTrigger>
                        <TabsTrigger value='templates'>
                            <FileText className='h-4 w-4 mr-2' />
                            Templates
                        </TabsTrigger>
                        <TabsTrigger value='settings'>
                            <Settings className='h-4 w-4 mr-2' />
                            Settings
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value='overview' className='mt-6'>
                        <div className='grid gap-6'>
                            {/* Quick Stats */}
                            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                                <Card>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center'>
                                            <Video className='h-8 w-8 text-blue-500' />
                                            <div className='ml-4'>
                                                <p className='text-sm font-medium text-gray-600'>
                                                    Total Videos
                                                </p>
                                                <p className='text-2xl font-bold'>
                                                    12
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center'>
                                            <FileText className='h-8 w-8 text-green-500' />
                                            <div className='ml-4'>
                                                <p className='text-sm font-medium text-gray-600'>
                                                    Blog Posts
                                                </p>
                                                <p className='text-2xl font-bold'>
                                                    8
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center'>
                                            <Eye className='h-8 w-8 text-purple-500' />
                                            <div className='ml-4'>
                                                <p className='text-sm font-medium text-gray-600'>
                                                    Total Views
                                                </p>
                                                <p className='text-2xl font-bold'>
                                                    2,543
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className='p-6'>
                                        <div className='flex items-center'>
                                            <TrendingUp className='h-8 w-8 text-orange-500' />
                                            <div className='ml-4'>
                                                <p className='text-sm font-medium text-gray-600'>
                                                    This Month
                                                </p>
                                                <p className='text-2xl font-bold'>
                                                    +24%
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* <CreatorStats /> */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Analytics Coming Soon</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='text-gray-600'>
                                        Detailed analytics will be available
                                        here.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                    <TabsContent value='content' className='mt-6'>
                        <ContentManager onCreateNew={handleCreateContent} />
                    </TabsContent>
                    <TabsContent value='schedule' className='mt-6'>
                        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                            <div className='lg:col-span-2'>
                                <ScheduleCalendar
                                    onScheduleClick={(date) => {
                                        setSelectedDate(date);
                                        setShowScheduleModal(true);
                                    }}
                                    scheduledContent={scheduledContent}
                                />
                            </div>
                            <div className='lg:col-span-1'>
                                <AutoPublishMonitor />
                            </div>
                        </div>
                    </TabsContent>{' '}
                    <TabsContent value='templates' className='mt-6'>
                        <ContentTemplates />
                    </TabsContent>
                    <TabsContent value='settings' className='mt-6'>
                        <ProfileSettings
                            profile={{
                                ...profile,
                                avatar:
                                    profile.avatar ||
                                    profile.avatarUrl ||
                                    '/default-avatar.png',
                            }}
                            onProfileUpdate={setProfile}
                        />
                    </TabsContent>
                </Tabs>
            </div>

            {/* Schedule Content Modal */}
            <ScheduleContentModal
                isOpen={showScheduleModal}
                selectedDate={selectedDate || undefined}
                onClose={() => {
                    setShowScheduleModal(false);
                    setSelectedDate(null);
                }}
                onSchedule={async (
                    contentId,
                    contentType,
                    publishAt,
                    notes
                ) => {
                    try {
                        const response = await fetch('/api/creator/schedule', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                contentId,
                                contentType,
                                publishAt: publishAt.toISOString(),
                                notes,
                            }),
                        });

                        if (response.ok) {
                            setShowScheduleModal(false);
                            setSelectedDate(null);
                            fetchScheduledContent();
                        } else {
                            console.error('Failed to schedule content');
                        }
                    } catch (error) {
                        console.error('Error scheduling content:', error);
                    }
                }}
            />
        </div>
    );
}
