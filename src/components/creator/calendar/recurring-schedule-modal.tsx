'use client';

import React, { useState } from 'react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface RecurringScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableContent: Array<{
        id: string;
        title: string;
        type: 'VIDEO' | 'BLOG';
        thumbnailUrl?: string;
        featuredImage?: string;
        status: string;
    }>;
    onScheduleRecurring: (config: RecurringConfig) => Promise<void>;
}

interface RecurringConfig {
    contentIds: string[];
    startDate: Date;
    pattern: 'daily' | 'weekly' | 'monthly';
    interval: number; // Every N days/weeks/months
    weekdays?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
    monthDay?: number; // For monthly: day of month
    endType: 'never' | 'after' | 'on';
    endCount?: number; // Number of occurrences
    endDate?: Date; // End by date
    time: string;
    notes?: string;
}

export function RecurringScheduleModal({
    isOpen,
    onClose,
    availableContent,
    onScheduleRecurring,
}: RecurringScheduleModalProps) {
    const [selectedContent, setSelectedContent] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>(
        format(new Date(), 'yyyy-MM-dd')
    );
    const [pattern, setPattern] = useState<'daily' | 'weekly' | 'monthly'>(
        'weekly'
    );
    const [interval, setInterval] = useState<number>(1);
    const [weekdays, setWeekdays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
    const [monthDay, setMonthDay] = useState<number>(1);
    const [endType, setEndType] = useState<'never' | 'after' | 'on'>('after');
    const [endCount, setEndCount] = useState<number>(10);
    const [endDate, setEndDate] = useState<string>(
        format(addMonths(new Date(), 3), 'yyyy-MM-dd')
    );
    const [time, setTime] = useState<string>('09:00');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const weekdayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
    ];

    const toggleWeekday = (day: number) => {
        setWeekdays((prev) =>
            prev.includes(day)
                ? prev.filter((d) => d !== day)
                : [...prev, day].sort()
        );
    };

    const toggleContent = (contentId: string) => {
        setSelectedContent((prev) =>
            prev.includes(contentId)
                ? prev.filter((id) => id !== contentId)
                : [...prev, contentId]
        );
    };

    const generatePreviewDates = () => {
        const dates: Date[] = [];
        const start = new Date(startDate);
        let current = new Date(start);

        // Generate up to 5 preview dates
        for (let i = 0; i < 5 && dates.length < 5; i++) {
            if (pattern === 'daily') {
                if (i > 0) {
                    current = addDays(current, interval);
                }
                dates.push(new Date(current));
            } else if (pattern === 'weekly') {
                if (i === 0) {
                    // Find the first occurrence
                    const dayOfWeek = current.getDay();
                    const nextWeekday =
                        weekdays.find((w) => w >= dayOfWeek) || weekdays[0];
                    if (nextWeekday !== undefined) {
                        const daysToAdd =
                            nextWeekday === weekdays[0] &&
                            nextWeekday < dayOfWeek
                                ? 7 - dayOfWeek + nextWeekday
                                : nextWeekday - dayOfWeek;
                        current = addDays(current, daysToAdd);
                        dates.push(new Date(current));
                    }
                } else {
                    // Add subsequent weeks
                    current = addWeeks(current, interval);
                    weekdays.forEach((wd) => {
                        const weekStart = new Date(current);
                        weekStart.setDate(
                            weekStart.getDate() - weekStart.getDay() + wd
                        );
                        if (dates.length < 5) {
                            dates.push(new Date(weekStart));
                        }
                    });
                }
            } else if (pattern === 'monthly') {
                if (i > 0) {
                    current = addMonths(current, interval);
                }
                const monthlyDate = new Date(current);
                monthlyDate.setDate(monthDay);
                dates.push(monthlyDate);
            }
        }

        return dates.slice(0, 5);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedContent.length === 0) return;

        setIsSubmitting(true);
        try {
            const config: RecurringConfig = {
                contentIds: selectedContent,
                startDate: new Date(startDate),
                pattern,
                interval,
                weekdays: pattern === 'weekly' ? weekdays : undefined,
                monthDay: pattern === 'monthly' ? monthDay : undefined,
                endType,
                endCount: endType === 'after' ? endCount : undefined,
                endDate: endType === 'on' ? new Date(endDate) : undefined,
                time,
                notes: notes || undefined,
            };

            await onScheduleRecurring(config);
            onClose();

            // Reset form
            setSelectedContent([]);
            setNotes('');
        } catch (error) {
            console.error('Error scheduling recurring content:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const previewDates = generatePreviewDates();

    return (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
            <div className='flex min-h-screen items-center justify-center p-4'>
                <div
                    className='fixed inset-0 bg-black bg-opacity-25'
                    onClick={onClose}
                />

                <div className='relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-screen overflow-y-auto'>
                    {/* Header */}
                    <div className='flex items-center justify-between p-6 border-b'>
                        <div className='flex items-center space-x-2'>
                            <ArrowPathIcon className='h-6 w-6 text-blue-600' />
                            <h3 className='text-lg font-semibold text-gray-900'>
                                Recurring Schedule
                            </h3>
                        </div>
                        <button
                            onClick={onClose}
                            className='text-gray-400 hover:text-gray-500'
                        >
                            <XMarkIcon className='h-6 w-6' />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className='p-6 space-y-6'>
                        {/* Content Selection */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Select Content for Series
                            </label>
                            <div className='max-h-48 overflow-y-auto border rounded-md'>
                                {availableContent.length === 0 ? (
                                    <div className='p-4 text-center text-gray-500'>
                                        No unscheduled content available
                                    </div>
                                ) : (
                                    availableContent.map((content) => (
                                        <label
                                            key={content.id}
                                            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                                                selectedContent.includes(
                                                    content.id
                                                )
                                                    ? 'bg-blue-50'
                                                    : ''
                                            }`}
                                        >
                                            <input
                                                type='checkbox'
                                                checked={selectedContent.includes(
                                                    content.id
                                                )}
                                                onChange={() =>
                                                    toggleContent(content.id)
                                                }
                                                className='text-blue-600'
                                            />
                                            <div className='ml-3 flex-1'>
                                                <div className='text-sm font-medium text-gray-900'>
                                                    {content.title}
                                                </div>
                                                <div className='text-xs text-gray-500 mt-1'>
                                                    {content.type} •{' '}
                                                    {content.status}
                                                </div>
                                            </div>
                                        </label>
                                    ))
                                )}
                            </div>
                            {selectedContent.length > 0 && (
                                <div className='mt-2 text-sm text-gray-600'>
                                    {selectedContent.length} item(s) selected
                                </div>
                            )}
                        </div>

                        {/* Start Date */}
                        <div>
                            <label
                                htmlFor='startDate'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Start Date
                            </label>
                            <input
                                type='date'
                                id='startDate'
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                min={format(new Date(), 'yyyy-MM-dd')}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                required
                            />
                        </div>

                        {/* Recurrence Pattern */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Repeat Pattern
                            </label>
                            <div className='grid grid-cols-3 gap-3'>
                                {(['daily', 'weekly', 'monthly'] as const).map(
                                    (p) => (
                                        <label
                                            key={p}
                                            className='flex items-center'
                                        >
                                            <input
                                                type='radio'
                                                name='pattern'
                                                value={p}
                                                checked={pattern === p}
                                                onChange={(e) =>
                                                    setPattern(
                                                        e.target.value as
                                                            | 'daily'
                                                            | 'weekly'
                                                            | 'monthly'
                                                    )
                                                }
                                                className='text-blue-600'
                                            />
                                            <span className='ml-2 text-sm text-gray-700 capitalize'>
                                                {p}
                                            </span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Interval */}
                        <div>
                            <label
                                htmlFor='interval'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Every {interval}{' '}
                                {pattern === 'daily'
                                    ? 'day(s)'
                                    : pattern === 'weekly'
                                    ? 'week(s)'
                                    : 'month(s)'}
                            </label>
                            <input
                                type='number'
                                id='interval'
                                min='1'
                                max='12'
                                value={interval}
                                onChange={(e) =>
                                    setInterval(parseInt(e.target.value))
                                }
                                className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                required
                            />
                        </div>

                        {/* Weekly Options */}
                        {pattern === 'weekly' && (
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    On these days
                                </label>
                                <div className='flex flex-wrap gap-2'>
                                    {weekdayNames.map((day, index) => (
                                        <button
                                            key={index}
                                            type='button'
                                            onClick={() => toggleWeekday(index)}
                                            className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                                weekdays.includes(index)
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {day.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Monthly Options */}
                        {pattern === 'monthly' && (
                            <div>
                                <label
                                    htmlFor='monthDay'
                                    className='block text-sm font-medium text-gray-700 mb-1'
                                >
                                    On day of month
                                </label>
                                <input
                                    type='number'
                                    id='monthDay'
                                    min='1'
                                    max='31'
                                    value={monthDay}
                                    onChange={(e) =>
                                        setMonthDay(parseInt(e.target.value))
                                    }
                                    className='w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    required
                                />
                            </div>
                        )}

                        {/* Time */}
                        <div>
                            <label
                                htmlFor='time'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Publish Time
                            </label>
                            <input
                                type='time'
                                id='time'
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                required
                            />
                        </div>

                        {/* End Options */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                End
                            </label>
                            <div className='space-y-3'>
                                <label className='flex items-center'>
                                    <input
                                        type='radio'
                                        name='endType'
                                        value='never'
                                        checked={endType === 'never'}
                                        onChange={(e) =>
                                            setEndType(
                                                e.target.value as
                                                    | 'never'
                                                    | 'after'
                                                    | 'on'
                                            )
                                        }
                                        className='text-blue-600'
                                    />
                                    <span className='ml-2 text-sm text-gray-700'>
                                        Never
                                    </span>
                                </label>
                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='endType'
                                        value='after'
                                        checked={endType === 'after'}
                                        onChange={(e) =>
                                            setEndType(
                                                e.target.value as
                                                    | 'never'
                                                    | 'after'
                                                    | 'on'
                                            )
                                        }
                                        className='text-blue-600'
                                    />
                                    <span className='text-sm text-gray-700'>
                                        After
                                    </span>
                                    <input
                                        type='number'
                                        min='1'
                                        value={endCount}
                                        onChange={(e) =>
                                            setEndCount(
                                                parseInt(e.target.value)
                                            )
                                        }
                                        disabled={endType !== 'after'}
                                        className='w-16 px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100'
                                    />
                                    <span className='text-sm text-gray-700'>
                                        occurrences
                                    </span>
                                </label>
                                <label className='flex items-center space-x-2'>
                                    <input
                                        type='radio'
                                        name='endType'
                                        value='on'
                                        checked={endType === 'on'}
                                        onChange={(e) =>
                                            setEndType(
                                                e.target.value as
                                                    | 'never'
                                                    | 'after'
                                                    | 'on'
                                            )
                                        }
                                        className='text-blue-600'
                                    />
                                    <span className='text-sm text-gray-700'>
                                        On
                                    </span>
                                    <input
                                        type='date'
                                        value={endDate}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        disabled={endType !== 'on'}
                                        min={startDate}
                                        className='px-2 py-1 border border-gray-300 rounded text-sm disabled:bg-gray-100'
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label
                                htmlFor='notes'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Series Notes (optional)
                            </label>
                            <textarea
                                id='notes'
                                rows={2}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder='Add notes about this recurring series...'
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            />
                        </div>

                        {/* Preview */}
                        {previewDates.length > 0 && (
                            <div className='bg-gray-50 rounded-lg p-4'>
                                <h4 className='text-sm font-medium text-gray-900 mb-2'>
                                    Schedule Preview (first{' '}
                                    {previewDates.length} dates)
                                </h4>
                                <div className='space-y-1'>
                                    {previewDates.map((date, index) => (
                                        <div
                                            key={index}
                                            className='text-sm text-gray-600'
                                        >
                                            {format(date, 'EEE, MMM d, yyyy')}{' '}
                                            at{' '}
                                            {format(
                                                new Date(`2000-01-01T${time}`),
                                                'h:mm a'
                                            )}
                                        </div>
                                    ))}
                                    {endType === 'after' && endCount > 5 && (
                                        <div className='text-xs text-gray-500 italic'>
                                            ...and {endCount - 5} more
                                            occurrences
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className='flex space-x-3 pt-4'>
                            <button
                                type='button'
                                onClick={onClose}
                                className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                            >
                                Cancel
                            </button>
                            <button
                                type='submit'
                                disabled={
                                    selectedContent.length === 0 || isSubmitting
                                }
                                className='flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isSubmitting
                                    ? 'Creating Series...'
                                    : 'Create Recurring Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
