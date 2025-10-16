'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, FileText } from 'lucide-react';

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

interface ScheduleCalendarProps {
    onScheduleClick: (date: Date) => void;
    scheduledContent?: ScheduledContent[];
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({
    onScheduleClick,
    scheduledContent = [],
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [draggedContent, setDraggedContent] =
        useState<ScheduledContent | null>(null);
    const [draggedOverDate, setDraggedOverDate] = useState<Date | null>(null);

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startingDayOfWeek = firstDayOfMonth.getDay();

    const goToPreviousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const getContentForDate = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        if (!Array.isArray(scheduledContent)) {
            return [];
        }
        return scheduledContent.filter((content) => {
            const contentDate = new Date(content.publishAt)
                .toISOString()
                .split('T')[0];
            return contentDate === dateStr;
        });
    };

    const handleDragStart = (e: React.DragEvent, content: ScheduledContent) => {
        setDraggedContent(content);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, date: Date) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDraggedOverDate(date);
    };

    const handleDragLeave = () => {
        setDraggedOverDate(null);
    };

    const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
        e.preventDefault();
        setDraggedOverDate(null);

        if (!draggedContent) return;

        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);
        if (targetDate < todayDate) return;

        const originalDateTime = new Date(draggedContent.publishAt);
        const newDateTime = new Date(targetDate);
        newDateTime.setHours(originalDateTime.getHours());
        newDateTime.setMinutes(originalDateTime.getMinutes());

        try {
            const response = await fetch(
                `/api/creator/schedule/${draggedContent.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        publishAt: newDateTime.toISOString(),
                    }),
                }
            );

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error rescheduling content:', error);
        }

        setDraggedContent(null);
    };

    const calendarDays = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
        calendarDays.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(new Date(year, month, day));
    }

    const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ];

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className='bg-white rounded-lg shadow border'>
            <div className='flex items-center justify-between p-4 border-b'>
                <button
                    onClick={goToPreviousMonth}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                >
                    <ChevronLeft className='w-5 h-5' />
                </button>

                <h2 className='text-lg font-semibold text-gray-900'>
                    {monthNames[month]} {year}
                </h2>

                <button
                    onClick={goToNextMonth}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                >
                    <ChevronRight className='w-5 h-5' />
                </button>
            </div>

            <div className='grid grid-cols-7 border-b border-gray-200'>
                {dayNames.map((day) => (
                    <div
                        key={day}
                        className='p-3 text-center text-sm font-medium text-gray-500'
                    >
                        {day}
                    </div>
                ))}
            </div>

            <div className='grid grid-cols-7'>
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return (
                            <div
                                key={index}
                                className='h-24 border-b border-r border-gray-100'
                            ></div>
                        );
                    }

                    const isToday =
                        date.toDateString() === today.toDateString();
                    const isPast = date < today && !isToday;
                    const dayContent = getContentForDate(date);
                    const isDraggedOver =
                        draggedOverDate &&
                        draggedOverDate.toDateString() ===
                            date.toDateString() &&
                        !isPast;

                    return (
                        <div
                            key={index}
                            className={`h-24 border-b border-r border-gray-100 p-1 transition-all ${
                                !isPast
                                    ? 'cursor-pointer hover:bg-gray-50'
                                    : 'cursor-not-allowed'
                            } ${isToday ? 'bg-blue-50' : ''} ${
                                isPast ? 'bg-gray-50 opacity-60' : ''
                            } ${
                                isDraggedOver
                                    ? 'ring-2 ring-blue-400 bg-blue-100'
                                    : ''
                            }`}
                            onClick={() => {
                                if (!isPast) {
                                    onScheduleClick(date);
                                }
                            }}
                            onDragOver={(e) => handleDragOver(e, date)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, date)}
                        >
                            <div
                                className={`text-sm font-medium mb-1 ${
                                    isToday
                                        ? 'text-blue-600'
                                        : isPast
                                        ? 'text-gray-400'
                                        : 'text-gray-900'
                                }`}
                            >
                                {date.getDate()}
                            </div>

                            <div className='space-y-1'>
                                {dayContent.slice(0, 2).map((content) => (
                                    <div
                                        key={content.id}
                                        className={`text-xs px-1 py-0.5 rounded truncate flex items-center gap-1 cursor-move transition-opacity ${
                                            content.contentType === 'video'
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-green-100 text-green-700'
                                        } ${
                                            draggedContent &&
                                            draggedContent.id === content.id
                                                ? 'opacity-50'
                                                : ''
                                        }`}
                                        title={content.content.title}
                                        draggable
                                        onDragStart={(e) =>
                                            handleDragStart(e, content)
                                        }
                                    >
                                        {content.contentType === 'video' ? (
                                            <Video className='w-3 h-3' />
                                        ) : (
                                            <FileText className='w-3 h-3' />
                                        )}
                                        <span className='truncate'>
                                            {content.content.title.length > 12
                                                ? content.content.title.substring(
                                                      0,
                                                      12
                                                  ) + '...'
                                                : content.content.title}
                                        </span>
                                    </div>
                                ))}

                                {dayContent.length > 2 && (
                                    <div className='text-xs text-gray-500 px-1'>
                                        +{dayContent.length - 2} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className='p-4 border-t border-gray-200 bg-gray-50'>
                <div className='flex items-center justify-between text-xs text-gray-600'>
                    <div className='flex items-center gap-4'>
                        <div className='flex items-center gap-1'>
                            <Video className='w-3 h-3 text-red-600' />
                            <span>Video</span>
                        </div>
                        <div className='flex items-center gap-1'>
                            <FileText className='w-3 h-3 text-green-600' />
                            <span>Blog</span>
                        </div>
                    </div>
                    <div className='text-gray-500'>
                        Drag content to reschedule • Click date to add content
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleCalendar;
