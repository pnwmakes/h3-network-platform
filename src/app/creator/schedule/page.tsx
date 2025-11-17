'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CalendarView } from '@/components/creator/calendar/calendar-view';
import { ScheduleModal } from '@/components/creator/calendar/schedule-modal';
import { RecurringScheduleModal } from '@/components/creator/calendar/recurring-schedule-modal';
import { TeamCollaboration } from '@/components/creator/calendar/team-collaboration';
import { MultiPlatformPublishing } from '@/components/creator/calendar/multi-platform-publishing';
import {
    PlusIcon,
    ArrowPathIcon,
    UserGroupIcon,
    GlobeAltIcon,
} from '@heroicons/react/24/outline';

interface ScheduledItem {
    id: string;
    title: string;
    contentType: 'VIDEO' | 'BLOG';
    publishAt: string;
    status: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'NEEDS_APPROVAL';
    thumbnailUrl?: string;
    featuredImage?: string;
    creatorId: string;
    creatorName: string;
    assignedReviewer?: {
        id: string;
        name: string;
        email: string;
    };
    comments?: Array<{
        id: string;
        content: string;
        author: {
            name: string;
            role: string;
        };
        createdAt: string;
    }>;
    approvalStatus?: 'pending' | 'approved' | 'changes_requested';
}

interface AvailableContent {
    id: string;
    title: string;
    type: 'VIDEO' | 'BLOG';
    thumbnailUrl?: string;
    featuredImage?: string;
    status: string;
}

interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'CREATOR' | 'EDITOR' | 'ADMIN';
    avatar?: string;
}

interface VideoData {
    id: string;
    title: string;
    thumbnailUrl?: string;
    status: string;
}

interface BlogData {
    id: string;
    title: string;
    featuredImage?: string;
    status: string;
}

interface RecurringConfig {
    contentIds: string[];
    startDate: Date;
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number;
    weekdays?: number[];
    monthDay?: number;
    endType: 'never' | 'after' | 'on';
    endCount?: number;
    endDate?: Date;
    time: string;
    notes?: string;
}

export default function CreatorSchedulePage() {
    const { data: session } = useSession();
    const [view, setView] = useState<'month' | 'week'>('month');
    const [activeTab, setActiveTab] = useState<
        'calendar' | 'collaboration' | 'publishing'
    >('calendar');
    const [scheduledContent, setScheduledContent] = useState<ScheduledItem[]>(
        []
    );
    const [availableContent, setAvailableContent] = useState<
        AvailableContent[]
    >([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [showRecurringModal, setShowRecurringModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Debug logging
    console.log('Schedule page state:', {
        activeTab,
        showScheduleModal,
        showRecurringModal,
        loading,
        hasSession: !!session?.user,
    });

    // Load scheduled content
    useEffect(() => {
        const loadScheduledContent = async () => {
            try {
                const response = await fetch('/api/creator/schedule');
                if (response.ok) {
                    const data = await response.json();
                    setScheduledContent(data.scheduledContent || []);
                }
            } catch (error) {
                console.error('Error loading scheduled content:', error);
            }
        };

        const loadAvailableContent = async () => {
            try {
                // Load videos
                const videosResponse = await fetch('/api/creator/videos');
                const videosData = await videosResponse.json();

                // Load blogs
                const blogsResponse = await fetch('/api/creator/blogs');
                const blogsData = await blogsResponse.json();

                const videos = (videosData.videos || [])
                    .filter((v: VideoData) => v.status === 'DRAFT')
                    .map((v: VideoData) => ({
                        id: v.id,
                        title: v.title,
                        type: 'VIDEO' as const,
                        thumbnailUrl: v.thumbnailUrl,
                        status: v.status,
                    }));

                const blogs = (blogsData.blogs || [])
                    .filter((b: BlogData) => b.status === 'DRAFT')
                    .map((b: BlogData) => ({
                        id: b.id,
                        title: b.title,
                        type: 'BLOG' as const,
                        featuredImage: b.featuredImage,
                        status: b.status,
                    }));

                setAvailableContent([...videos, ...blogs]);
            } catch (error) {
                console.error('Error loading available content:', error);
            }
        };

        const loadTeamMembers = async () => {
            try {
                // Mock team members for now - in real app, load from API
                setTeamMembers([
                    {
                        id: '1',
                        name: 'Noah Schiff',
                        email: 'noah@h3network.org',
                        role: 'CREATOR',
                    },
                    {
                        id: '2',
                        name: 'Rita Williams',
                        email: 'rita@h3network.org',
                        role: 'CREATOR',
                    },
                    {
                        id: '3',
                        name: 'Editor User',
                        email: 'editor@h3network.org',
                        role: 'EDITOR',
                    },
                ]);
            } catch (error) {
                console.error('Error loading team members:', error);
            }
        };

        if (session?.user) {
            Promise.all([
                loadScheduledContent(),
                loadAvailableContent(),
                loadTeamMembers(),
            ]).finally(() => setLoading(false));
        } else if (session === null) {
            // No session, still show the UI for demo purposes
            setLoading(false);
        }
    }, [session]);

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setShowScheduleModal(true);
    };

    const handleItemClick = (item: ScheduledItem) => {
        console.log('Item clicked:', item);
        // TODO: Open item details modal
    };

    const handleItemDrop = async (item: ScheduledItem, newDate: Date) => {
        try {
            // Create new date with same time
            const originalDate = new Date(item.publishAt);
            const updatedDate = new Date(newDate);
            updatedDate.setHours(
                originalDate.getHours(),
                originalDate.getMinutes()
            );

            const response = await fetch(`/api/creator/schedule/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    publishAt: updatedDate.toISOString(),
                }),
            });

            if (response.ok) {
                // Refresh scheduled content
                setScheduledContent((prev) =>
                    prev.map((i) =>
                        i.id === item.id
                            ? { ...i, publishAt: updatedDate.toISOString() }
                            : i
                    )
                );
            }
        } catch (error) {
            console.error('Error updating schedule:', error);
        }
    };

    const handleSchedule = async (
        contentId: string,
        contentType: 'VIDEO' | 'BLOG',
        date: Date,
        time: string,
        notes?: string
    ) => {
        try {
            // Combine date and time
            const [hours, minutes] = time.split(':');
            const publishDate = new Date(date);
            publishDate.setHours(parseInt(hours), parseInt(minutes));

            const response = await fetch('/api/creator/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contentType,
                    contentId,
                    publishAt: publishDate.toISOString(),
                    notes,
                }),
            });

            if (response.ok) {
                // Refresh data
                const updatedResponse = await fetch('/api/creator/schedule');
                if (updatedResponse.ok) {
                    const data = await updatedResponse.json();
                    setScheduledContent(data.scheduledContent || []);
                }

                // Remove from available content
                setAvailableContent((prev) =>
                    prev.filter((c) => c.id !== contentId)
                );
            }
        } catch (error) {
            console.error('Error scheduling content:', error);
        }
    };

    const handleScheduleRecurring = async (config: RecurringConfig) => {
        try {
            const response = await fetch('/api/creator/schedule/recurring', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (response.ok) {
                // Refresh scheduled content
                const updatedResponse = await fetch('/api/creator/schedule');
                if (updatedResponse.ok) {
                    const data = await updatedResponse.json();
                    setScheduledContent(data.scheduledContent || []);
                }
            }
        } catch (error) {
            console.error('Error creating recurring schedule:', error);
        }
    };

    // Team collaboration handlers
    const handleAssignReviewer = async (itemId: string, reviewerId: string) => {
        // TODO: Implement reviewer assignment
        console.log('Assign reviewer:', itemId, reviewerId);
    };

    const handleApprove = async (itemId: string) => {
        // TODO: Implement content approval
        console.log('Approve item:', itemId);
    };

    const handleRequestChanges = async (itemId: string, comment: string) => {
        // TODO: Implement change requests
        console.log('Request changes:', itemId, comment);
    };

    const handleAddComment = async (itemId: string, comment: string) => {
        // TODO: Implement comments
        console.log('Add comment:', itemId, comment);
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center py-16'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-500'>Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Header - Mobile Optimized */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
                <div className='min-w-0 flex-1'>
                    <h1 className='text-2xl md:text-3xl font-bold text-gray-900 truncate'>
                        Content Calendar
                    </h1>
                    <p className='mt-1 text-gray-500 text-sm md:text-base'>
                        Schedule and manage your content releases across
                        platforms
                    </p>
                </div>

                <div className='flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 flex-shrink-0'>
                    <button
                        onClick={() => {
                            console.log('Recurring schedule button clicked');
                            setShowRecurringModal(true);
                        }}
                        className='inline-flex items-center justify-center px-4 py-3 min-h-11 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 touch-manipulation'
                    >
                        <ArrowPathIcon className='h-4 w-4 mr-2' />
                        <span className='hidden xs:inline'>
                            Recurring Schedule
                        </span>
                        <span className='xs:hidden'>Recurring</span>
                    </button>
                    <button
                        onClick={() => {
                            console.log('Schedule content button clicked');
                            setSelectedDate(new Date()); // Set a default date
                            setShowScheduleModal(true);
                        }}
                        className='inline-flex items-center justify-center px-4 py-3 min-h-11 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 touch-manipulation'
                    >
                        <PlusIcon className='h-4 w-4 mr-2' />
                        <span className='hidden xs:inline'>
                            Schedule Content
                        </span>
                        <span className='xs:hidden'>Schedule</span>
                    </button>
                </div>
            </div>

            {/* Tabs - Mobile Optimized */}
            <div className='border-b border-gray-200'>
                <nav className='-mb-px flex overflow-x-auto scrollbar-hide'>
                    <button
                        onClick={() => setActiveTab('calendar')}
                        className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 touch-manipulation min-h-11 ${
                            activeTab === 'calendar'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Calendar View
                    </button>
                    <button
                        onClick={() => {
                            console.log('Team collaboration tab clicked');
                            setActiveTab('collaboration');
                        }}
                        className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center whitespace-nowrap flex-shrink-0 touch-manipulation min-h-11 ${
                            activeTab === 'collaboration'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <UserGroupIcon className='h-4 w-4 mr-2' />
                        <span className='hidden sm:inline'>
                            Team Collaboration
                        </span>
                        <span className='sm:hidden'>Team</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('publishing')}
                        className={`py-3 px-4 border-b-2 font-medium text-sm flex items-center whitespace-nowrap flex-shrink-0 touch-manipulation min-h-11 ${
                            activeTab === 'publishing'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <GlobeAltIcon className='h-4 w-4 mr-2' />
                        <span className='hidden sm:inline'>
                            Multi-Platform Publishing
                        </span>
                        <span className='sm:hidden'>Publishing</span>
                    </button>
                </nav>
            </div>

            {/* Content */}
            {activeTab === 'calendar' ? (
                <CalendarView
                    scheduledContent={scheduledContent}
                    onDateSelect={handleDateSelect}
                    onItemClick={handleItemClick}
                    onItemDrop={handleItemDrop}
                    view={view}
                    onViewChange={setView}
                />
            ) : activeTab === 'collaboration' ? (
                <TeamCollaboration
                    scheduledItems={scheduledContent}
                    teamMembers={teamMembers}
                    currentUserId={session?.user?.id || ''}
                    onAssignReviewer={handleAssignReviewer}
                    onApprove={handleApprove}
                    onRequestChanges={handleRequestChanges}
                    onAddComment={handleAddComment}
                />
            ) : activeTab === 'publishing' ? (
                <div className='space-y-6'>
                    {scheduledContent.length === 0 ? (
                        <div className='text-center py-12'>
                            <GlobeAltIcon className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                            <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                No Scheduled Content
                            </h3>
                            <p className='text-gray-500'>
                                Schedule some content first to set up
                                multi-platform publishing.
                            </p>
                        </div>
                    ) : (
                        <div className='grid gap-6'>
                            {scheduledContent.slice(0, 3).map((item) => (
                                <MultiPlatformPublishing
                                    key={item.id}
                                    content={{
                                        id: item.id,
                                        title: item.title,
                                        contentType: item.contentType,
                                        publishAt: item.publishAt,
                                        thumbnailUrl: item.thumbnailUrl,
                                        featuredImage: item.featuredImage,
                                    }}
                                    platforms={[
                                        {
                                            id: 'youtube',
                                            name: 'YouTube',
                                            icon: '📺',
                                            connected: true,
                                            enabled: true,
                                            features: [
                                                'Video Upload',
                                                'Scheduling',
                                                'Playlists',
                                                'Analytics',
                                            ],
                                            maxTitleLength: 100,
                                            maxDescriptionLength: 5000,
                                            supportedFormats: [
                                                'mp4',
                                                'mov',
                                                'avi',
                                            ],
                                        },
                                        {
                                            id: 'twitter',
                                            name: 'Twitter/X',
                                            icon: '🐦',
                                            connected: true,
                                            enabled: false,
                                            features: [
                                                'Text Posts',
                                                'Media Sharing',
                                                'Threads',
                                                'Scheduling',
                                            ],
                                            maxTitleLength: 280,
                                        },
                                        {
                                            id: 'facebook',
                                            name: 'Facebook',
                                            icon: '📘',
                                            connected: false,
                                            enabled: false,
                                            features: [
                                                'Page Posts',
                                                'Video Sharing',
                                                'Cross-posting',
                                                'Analytics',
                                            ],
                                            maxTitleLength: 255,
                                            maxDescriptionLength: 2000,
                                        },
                                        {
                                            id: 'linkedin',
                                            name: 'LinkedIn',
                                            icon: '💼',
                                            connected: false,
                                            enabled: false,
                                            features: [
                                                'Professional Posts',
                                                'Article Publishing',
                                                'Video Sharing',
                                            ],
                                            maxTitleLength: 150,
                                            maxDescriptionLength: 1300,
                                        },
                                    ]}
                                    onPublishToPlatform={async (
                                        platformId: string
                                    ) => {
                                        console.log(
                                            'Publishing to:',
                                            platformId
                                        );
                                        // TODO: Implement actual publishing logic
                                    }}
                                    onUpdatePlatformSettings={() => {
                                        // TODO: Save platform settings
                                    }}
                                />
                            ))}

                            {scheduledContent.length > 3 && (
                                <div className='text-center py-4'>
                                    <p className='text-gray-500'>
                                        Showing first 3 scheduled items. More
                                        publishing options available per item.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : null}

            {/* Modals */}
            <ScheduleModal
                isOpen={showScheduleModal}
                onClose={() => {
                    setShowScheduleModal(false);
                    setSelectedDate(null);
                }}
                selectedDate={selectedDate}
                availableContent={availableContent}
                onSchedule={handleSchedule}
            />

            <RecurringScheduleModal
                isOpen={showRecurringModal}
                onClose={() => setShowRecurringModal(false)}
                availableContent={availableContent}
                onScheduleRecurring={handleScheduleRecurring}
            />
        </div>
    );
}
