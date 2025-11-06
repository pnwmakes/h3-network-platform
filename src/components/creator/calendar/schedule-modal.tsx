'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    XMarkIcon,
    VideoCameraIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';

interface ScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date | null;
    availableContent: Array<{
        id: string;
        title: string;
        type: 'VIDEO' | 'BLOG';
        thumbnailUrl?: string;
        featuredImage?: string;
        status: string;
    }>;
    onSchedule: (
        contentId: string,
        contentType: 'VIDEO' | 'BLOG',
        date: Date,
        time: string,
        notes?: string
    ) => Promise<void>;
}

export function ScheduleModal({
    isOpen,
    onClose,
    selectedDate,
    availableContent,
    onSchedule,
}: ScheduleModalProps) {
    const [selectedContent, setSelectedContent] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('09:00');
    const [notes, setNotes] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [contentFilter, setContentFilter] = useState<
        'ALL' | 'VIDEO' | 'BLOG'
    >('ALL');

    if (!isOpen || !selectedDate) return null;

    const filteredContent = availableContent.filter((content) => {
        if (contentFilter === 'ALL') return true;
        return content.type === contentFilter;
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedContent || !selectedDate || !selectedTime) return;

        setIsSubmitting(true);
        try {
            const content = availableContent.find(
                (c) => c.id === selectedContent
            );
            if (content) {
                await onSchedule(
                    content.id,
                    content.type,
                    selectedDate,
                    selectedTime,
                    notes || undefined
                );
                onClose();
                // Reset form
                setSelectedContent('');
                setSelectedTime('09:00');
                setNotes('');
            }
        } catch (error) {
            console.error('Error scheduling content:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedContentItem = availableContent.find(
        (c) => c.id === selectedContent
    );

    return (
        <div className='fixed inset-0 z-50 overflow-y-auto'>
            <div className='flex min-h-screen items-center justify-center p-4'>
                <div
                    className='fixed inset-0 bg-black bg-opacity-25'
                    onClick={onClose}
                />

                <div className='relative bg-white rounded-lg shadow-xl w-full max-w-md'>
                    {/* Header */}
                    <div className='flex items-center justify-between p-6 border-b'>
                        <h3 className='text-lg font-semibold text-gray-900'>
                            Schedule Content
                        </h3>
                        <button
                            onClick={onClose}
                            className='text-gray-400 hover:text-gray-500'
                        >
                            <XMarkIcon className='h-6 w-6' />
                        </button>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className='p-6 space-y-6'>
                        {/* Selected Date */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Publish Date
                            </label>
                            <div className='text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md'>
                                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                            </div>
                        </div>

                        {/* Content Filter */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Content Type
                            </label>
                            <div className='flex space-x-1 bg-gray-100 rounded-lg p-1'>
                                {(['ALL', 'VIDEO', 'BLOG'] as const).map(
                                    (type) => (
                                        <button
                                            key={type}
                                            type='button'
                                            onClick={() => {
                                                setContentFilter(type);
                                                setSelectedContent(''); // Reset selection
                                            }}
                                            className={`flex-1 py-1 px-3 text-sm font-medium rounded-md transition-colors ${
                                                contentFilter === type
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {type === 'ALL'
                                                ? 'All'
                                                : type.charAt(0) +
                                                  type.slice(1).toLowerCase()}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>

                        {/* Content Selection */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Select Content
                            </label>
                            <div className='max-h-48 overflow-y-auto border rounded-md'>
                                {filteredContent.length === 0 ? (
                                    <div className='p-4 text-center text-gray-500'>
                                        No unscheduled content available
                                    </div>
                                ) : (
                                    filteredContent.map((content) => (
                                        <label
                                            key={content.id}
                                            className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 ${
                                                selectedContent === content.id
                                                    ? 'bg-blue-50'
                                                    : ''
                                            }`}
                                        >
                                            <input
                                                type='radio'
                                                name='content'
                                                value={content.id}
                                                checked={
                                                    selectedContent ===
                                                    content.id
                                                }
                                                onChange={(e) =>
                                                    setSelectedContent(
                                                        e.target.value
                                                    )
                                                }
                                                className='text-blue-600'
                                            />
                                            <div className='ml-3 flex-1'>
                                                <div className='flex items-center'>
                                                    {content.type ===
                                                    'VIDEO' ? (
                                                        <VideoCameraIcon className='h-4 w-4 text-red-600 mr-2' />
                                                    ) : (
                                                        <PencilIcon className='h-4 w-4 text-green-600 mr-2' />
                                                    )}
                                                    <span className='text-sm font-medium text-gray-900'>
                                                        {content.title}
                                                    </span>
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
                        </div>

                        {/* Time Selection */}
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
                                value={selectedTime}
                                onChange={(e) =>
                                    setSelectedTime(e.target.value)
                                }
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                required
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label
                                htmlFor='notes'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Notes (optional)
                            </label>
                            <textarea
                                id='notes'
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder='Add any scheduling notes or reminders...'
                                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            />
                        </div>

                        {/* Selected Content Preview */}
                        {selectedContentItem && (
                            <div className='bg-gray-50 rounded-lg p-4'>
                                <h4 className='text-sm font-medium text-gray-900 mb-2'>
                                    Scheduling Preview
                                </h4>
                                <div className='text-sm text-gray-600 space-y-1'>
                                    <div>
                                        <strong>Content:</strong>{' '}
                                        {selectedContentItem.title}
                                    </div>
                                    <div>
                                        <strong>Type:</strong>{' '}
                                        {selectedContentItem.type}
                                    </div>
                                    <div>
                                        <strong>Date:</strong>{' '}
                                        {format(selectedDate, 'MMM d, yyyy')}
                                    </div>
                                    <div>
                                        <strong>Time:</strong>{' '}
                                        {format(
                                            new Date(
                                                `2000-01-01T${selectedTime}`
                                            ),
                                            'h:mm a'
                                        )}
                                    </div>
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
                                disabled={!selectedContent || isSubmitting}
                                className='flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isSubmitting ? 'Scheduling...' : 'Schedule'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
