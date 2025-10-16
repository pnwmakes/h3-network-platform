'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Video,
    FileText,
    Clock,
    Edit,
    Trash2,
    RefreshCw,
} from 'lucide-react';
import { ScheduleContentModal } from './ScheduleContentModal';

interface ScheduledContent {
    id: string;
    contentType: 'VIDEO' | 'BLOG';
    publishAt: string;
    status: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'CANCELLED';
    notes?: string;
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

export function ScheduleCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [scheduledContent, setScheduledContent] = useState<ScheduledContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchScheduledContent();
    }, []);

    const fetchScheduledContent = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await fetch('/api/creator/schedule', {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            const data = await response.json();
            if (data.success) {
                setScheduledContent(data.scheduledContent);
            }
        } catch (error) {
            console.error('Error fetching scheduled content:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleScheduleContent = async (
        contentId: string,
        contentType: 'VIDEO' | 'BLOG',
        publishAt: Date,
        notes?: string
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

            const data = await response.json();
            if (data.success) {
                // Refresh the scheduled content list
                fetchScheduledContent();
            } else {
                alert(data.error || 'Failed to schedule content');
            }
        } catch (error) {
            console.error('Error scheduling content:', error);
            alert('Failed to schedule content');
        }
    };

    const handleDeleteSchedule = async (scheduleId: string) => {
        if (!confirm('Are you sure you want to cancel this scheduled content?')) {
            return;
        }

        try {
            const response = await fetch(`/api/creator/schedule/${scheduleId}`, {
                method: 'DELETE',
            });

            const data = await response.json();
            if (data.success) {
                fetchScheduledContent();
            } else {
                alert(data.error || 'Failed to cancel schedule');
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            alert('Failed to cancel schedule');
        }
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentDate((prev) => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    const getContentForDate = (date: Date) => {
        return scheduledContent.filter((content) => {
            const publishDate = new Date(content.publishAt);
            return publishDate.toDateString() === date.toDateString();
        });
    };

    const getContentTitle = (content: ScheduledContent) => {
        return content.video?.title || content.blog?.title || 'Untitled';
    };

    const getContentTime = (content: ScheduledContent) => {
        const publishDate = new Date(content.publishAt);
        return publishDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className='h-24 p-1'></div>);
        }

        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
            );
            const content = getContentForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected =
                date.toDateString() === selectedDate.toDateString();

            days.push(
                <div
                    key={day}
                    className={`h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
                        isToday ? 'bg-blue-50 border-blue-200' : ''
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedDate(date)}
                >
                    <div
                        className={`text-sm font-medium ${
                            isToday ? 'text-blue-600' : 'text-gray-900'
                        }`}
                    >
                        {day}
                    </div>
                    <div className='mt-1 space-y-1'>
                        {content.slice(0, 2).map((item) => (
                            <div
                                key={item.id}
                                className={`text-xs p-1 rounded truncate ${
                                    item.contentType === 'VIDEO'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                }`}
                            >
                                {getContentTitle(item)}
                            </div>
                        ))}
                        {content.length > 2 && (
                            <div className='text-xs text-gray-500'>
                                +{content.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const selectedDateContent = getContentForDate(selectedDate);

    return (
        <div className='space-y-6'>
            <div className='flex justify-between items-center'>
                <h2 className='text-xl font-semibold'>Content Calendar</h2>
                <div className='flex items-center space-x-2'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => fetchScheduledContent(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button onClick={() => setShowScheduleModal(true)}>
                        <Plus className='h-4 w-4 mr-2' />
                        Schedule Content
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className='flex items-center justify-center py-12'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
                </div>
            ) : (
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                {/* Calendar */}
                <Card className='lg:col-span-2'>
                    <CardHeader>
                        <div className='flex items-center justify-between'>
                            <CardTitle className='flex items-center'>
                                <Calendar className='h-5 w-5 mr-2' />
                                {currentDate.toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </CardTitle>
                            <div className='flex space-x-2'>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => navigateMonth('prev')}
                                >
                                    <ChevronLeft className='h-4 w-4' />
                                </Button>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() => navigateMonth('next')}
                                >
                                    <ChevronRight className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Calendar Grid */}
                        <div className='grid grid-cols-7 gap-0 mb-4'>
                            {[
                                'Sun',
                                'Mon',
                                'Tue',
                                'Wed',
                                'Thu',
                                'Fri',
                                'Sat',
                            ].map((day) => (
                                <div
                                    key={day}
                                    className='h-8 flex items-center justify-center text-sm font-medium text-gray-500 border-b'
                                >
                                    {day}
                                </div>
                            ))}
                        </div>
                        <div className='grid grid-cols-7 gap-0'>
                            {renderCalendarDays()}
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Date Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className='text-base'>
                            {selectedDate.toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedDateContent.length > 0 ? (
                            <div className='space-y-3'>
                                {selectedDateContent.map((item) => (
                                    <div
                                        key={item.id}
                                        className='p-3 border rounded-lg'
                                    >
                                        <div className='flex items-start justify-between mb-2'>
                                            <div className='flex items-center'>
                                                {item.contentType === 'VIDEO' ? (
                                                    <Video className='h-4 w-4 text-blue-500 mr-2' />
                                                ) : (
                                                    <FileText className='h-4 w-4 text-green-500 mr-2' />
                                                )}
                                                <span className='text-sm font-medium'>
                                                    {item.contentType}
                                                </span>
                                            </div>
                                            <div className='flex items-center space-x-2'>
                                                <Badge
                                                    variant={
                                                        item.status === 'PUBLISHED'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() => handleDeleteSchedule(item.id)}
                                                >
                                                    <Trash2 className='h-3 w-3' />
                                                </Button>
                                            </div>
                                        </div>
                                        <h4 className='font-medium text-sm mb-1'>
                                            {getContentTitle(item)}
                                        </h4>
                                        <div className='flex items-center text-xs text-gray-500'>
                                            <Clock className='h-3 w-3 mr-1' />
                                            {getContentTime(item)}
                                        </div>
                                        {item.notes && (
                                            <p className='text-xs text-gray-600 mt-2'>
                                                {item.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className='text-center text-gray-500 py-8'>
                                <Calendar className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                                <p className='text-sm'>
                                    No content scheduled for this date
                                </p>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    className='mt-2'
                                >
                                    <Plus className='h-4 w-4 mr-2' />
                                    Add Content
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Content */}
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Content</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className='space-y-3'>
                        {scheduledContent
                            .filter((item) => new Date(item.publishAt) >= new Date())
                            .sort((a, b) => new Date(a.publishAt).getTime() - new Date(b.publishAt).getTime())
                            .slice(0, 5)
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className='flex items-center justify-between p-3 border rounded-lg'
                                >
                                    <div className='flex items-center space-x-3'>
                                        {item.contentType === 'VIDEO' ? (
                                            <Video className='h-5 w-5 text-blue-500' />
                                        ) : (
                                            <FileText className='h-5 w-5 text-green-500' />
                                        )}
                                        <div>
                                            <h4 className='font-medium text-sm'>
                                                {getContentTitle(item)}
                                            </h4>
                                            <p className='text-xs text-gray-500'>
                                                {new Date(item.publishAt).toLocaleDateString()}{' '}
                                                at {getContentTime(item)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className='flex items-center space-x-2'>
                                        <Badge
                                            variant={
                                                item.status === 'PUBLISHED'
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {item.status}
                                        </Badge>
                                        <Button 
                                            variant='outline' 
                                            size='sm'
                                            onClick={() => handleDeleteSchedule(item.id)}
                                        >
                                            <Trash2 className='h-3 w-3' />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
                </div>
            )}

            {/* Schedule Content Modal */}
            <ScheduleContentModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                onSchedule={handleScheduleContent}
                selectedDate={selectedDate}
            />
        </div>
    );
}
