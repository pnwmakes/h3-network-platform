'use client';

import { useState } from 'react';
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
} from 'lucide-react';

interface ScheduledContent {
    id: string;
    title: string;
    type: 'VIDEO' | 'BLOG';
    date: Date;
    time: string;
    status: 'SCHEDULED' | 'PUBLISHED' | 'DRAFT';
}

export function ScheduleCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Mock scheduled content data
    const scheduledContent: ScheduledContent[] = [
        {
            id: '1',
            title: 'Building Community Through Stories',
            type: 'VIDEO',
            date: new Date(2025, 9, 16), // October 16, 2025
            time: '10:00 AM',
            status: 'SCHEDULED',
        },
        {
            id: '2',
            title: 'Finding Your Voice in Advocacy',
            type: 'BLOG',
            date: new Date(2025, 9, 18), // October 18, 2025
            time: '2:00 PM',
            status: 'SCHEDULED',
        },
        {
            id: '3',
            title: 'Overcoming Shame: A Conversation About Healing',
            type: 'VIDEO',
            date: new Date(2025, 9, 20), // October 20, 2025
            time: '11:00 AM',
            status: 'DRAFT',
        },
    ];

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
        return scheduledContent.filter(
            (content) => content.date.toDateString() === date.toDateString()
        );
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
                                    item.type === 'VIDEO'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-green-100 text-green-800'
                                }`}
                            >
                                {item.title}
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
                <Button>
                    <Plus className='h-4 w-4 mr-2' />
                    Schedule Content
                </Button>
            </div>

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
                                                {item.type === 'VIDEO' ? (
                                                    <Video className='h-4 w-4 text-blue-500 mr-2' />
                                                ) : (
                                                    <FileText className='h-4 w-4 text-green-500 mr-2' />
                                                )}
                                                <span className='text-sm font-medium'>
                                                    {item.type}
                                                </span>
                                            </div>
                                            <Badge
                                                variant={
                                                    item.status === 'PUBLISHED'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {item.status}
                                            </Badge>
                                        </div>
                                        <h4 className='font-medium text-sm mb-1'>
                                            {item.title}
                                        </h4>
                                        <div className='flex items-center text-xs text-gray-500'>
                                            <Clock className='h-3 w-3 mr-1' />
                                            {item.time}
                                        </div>
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
                            .filter((item) => item.date >= new Date())
                            .sort((a, b) => a.date.getTime() - b.date.getTime())
                            .slice(0, 5)
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className='flex items-center justify-between p-3 border rounded-lg'
                                >
                                    <div className='flex items-center space-x-3'>
                                        {item.type === 'VIDEO' ? (
                                            <Video className='h-5 w-5 text-blue-500' />
                                        ) : (
                                            <FileText className='h-5 w-5 text-green-500' />
                                        )}
                                        <div>
                                            <h4 className='font-medium text-sm'>
                                                {item.title}
                                            </h4>
                                            <p className='text-xs text-gray-500'>
                                                {item.date.toLocaleDateString()}{' '}
                                                at {item.time}
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
                                        <Button variant='outline' size='sm'>
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
