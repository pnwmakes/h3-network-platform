'use client';

import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    startOfWeek,
    endOfWeek,
    addWeeks,
    subWeeks,
} from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { VideoCameraIcon, PencilIcon } from '@heroicons/react/24/solid';

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

interface CalendarViewProps {
    scheduledContent: ScheduledItem[];
    onDateSelect: (date: Date) => void;
    onItemClick: (item: ScheduledItem) => void;
    onItemDrop: (item: ScheduledItem, newDate: Date) => void;
    view: 'month' | 'week';
    onViewChange: (view: 'month' | 'week') => void;
}

export function CalendarView({
    scheduledContent,
    onDateSelect,
    onItemClick,
    onItemDrop,
    view,
    onViewChange,
}: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const navigatePrevious = () => {
        setCurrentDate((prev) =>
            view === 'month' ? subMonths(prev, 1) : subWeeks(prev, 1)
        );
    };

    const navigateNext = () => {
        setCurrentDate((prev) =>
            view === 'month' ? addMonths(prev, 1) : addWeeks(prev, 1)
        );
    };

    const getCalendarDays = () => {
        if (view === 'month') {
            const start = startOfWeek(startOfMonth(currentDate));
            const end = endOfWeek(endOfMonth(currentDate));
            return eachDayOfInterval({ start, end });
        } else {
            const start = startOfWeek(currentDate);
            const end = endOfWeek(currentDate);
            return eachDayOfInterval({ start, end });
        }
    };

    const getItemsForDate = (date: Date) => {
        return scheduledContent.filter((item) =>
            isSameDay(new Date(item.publishAt), date)
        );
    };

    const handleDrop = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        const itemId = e.dataTransfer.getData('itemId');
        const item = scheduledContent.find((i) => i.id === itemId);
        if (item) {
            onItemDrop(item, date);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const days = getCalendarDays();
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className='bg-white rounded-lg shadow'>
            {/* Calendar Header */}
            <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center space-x-4'>
                        <h2 className='text-lg font-semibold text-gray-900'>
                            {format(
                                currentDate,
                                view === 'month'
                                    ? 'MMMM yyyy'
                                    : "'Week of' MMM d, yyyy"
                            )}
                        </h2>
                        <div className='flex items-center space-x-1'>
                            <button
                                onClick={navigatePrevious}
                                className='p-2 hover:bg-gray-100 rounded-md'
                            >
                                <ChevronLeftIcon className='h-4 w-4' />
                            </button>
                            <button
                                onClick={navigateNext}
                                className='p-2 hover:bg-gray-100 rounded-md'
                            >
                                <ChevronRightIcon className='h-4 w-4' />
                            </button>
                        </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                        <div className='flex bg-gray-100 rounded-lg p-1'>
                            <button
                                onClick={() => onViewChange('month')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    view === 'month'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => onViewChange('week')}
                                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                    view === 'week'
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Week
                            </button>
                        </div>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className='px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700'
                        >
                            Today
                        </button>
                    </div>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className='p-6'>
                {/* Weekday Headers */}
                <div
                    className={`grid ${
                        view === 'month' ? 'grid-cols-7' : 'grid-cols-7'
                    } gap-px mb-2`}
                >
                    {weekdays.map((day) => (
                        <div
                            key={day}
                            className='py-2 text-center text-sm font-medium text-gray-500'
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div
                    className={`grid ${
                        view === 'month' ? 'grid-cols-7' : 'grid-cols-7'
                    } gap-px bg-gray-200`}
                >
                    {days.map((day) => {
                        const items = getItemsForDate(day);
                        const isCurrentMonth =
                            view === 'week' ||
                            day.getMonth() === currentDate.getMonth();

                        return (
                            <div
                                key={day.toString()}
                                className={`min-h-32 bg-white p-2 ${
                                    view === 'week' ? 'min-h-48' : ''
                                } ${
                                    !isCurrentMonth
                                        ? 'bg-gray-50 text-gray-400'
                                        : ''
                                }`}
                                onDrop={(e) => handleDrop(e, day)}
                                onDragOver={handleDragOver}
                                onClick={() => onDateSelect(day)}
                            >
                                <div
                                    className={`text-sm font-medium mb-2 ${
                                        isToday(day)
                                            ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                                            : ''
                                    }`}
                                >
                                    {format(day, 'd')}
                                </div>

                                {/* Scheduled Items */}
                                <div className='space-y-1'>
                                    {items
                                        .slice(0, view === 'month' ? 2 : 6)
                                        .map((item) => (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={(e) =>
                                                    e.dataTransfer.setData(
                                                        'itemId',
                                                        item.id
                                                    )
                                                }
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onItemClick(item);
                                                }}
                                                className={`p-2 rounded text-xs cursor-pointer hover:shadow-md transition-shadow ${
                                                    item.contentType === 'VIDEO'
                                                        ? 'bg-red-100 border border-red-200 hover:bg-red-200'
                                                        : 'bg-green-100 border border-green-200 hover:bg-green-200'
                                                } ${
                                                    item.status === 'FAILED'
                                                        ? 'opacity-50 border-red-400'
                                                        : item.status ===
                                                          'PUBLISHED'
                                                        ? 'opacity-75'
                                                        : ''
                                                }`}
                                            >
                                                <div className='flex items-center space-x-1'>
                                                    {item.contentType ===
                                                    'VIDEO' ? (
                                                        <VideoCameraIcon className='h-3 w-3 text-red-600' />
                                                    ) : (
                                                        <PencilIcon className='h-3 w-3 text-green-600' />
                                                    )}
                                                    <span className='font-medium truncate'>
                                                        {item.title}
                                                    </span>
                                                </div>
                                                <div className='text-xs text-gray-500 mt-1'>
                                                    {format(
                                                        new Date(
                                                            item.publishAt
                                                        ),
                                                        'h:mm a'
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    {items.length >
                                        (view === 'month' ? 2 : 6) && (
                                        <div className='text-xs text-gray-500 text-center py-1'>
                                            +
                                            {items.length -
                                                (view === 'month' ? 2 : 6)}{' '}
                                            more
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
