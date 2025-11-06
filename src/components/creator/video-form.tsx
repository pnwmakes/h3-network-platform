'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface VideoFormProps {
    video?: {
        id: string;
        title: string;
        description?: string | null;
        youtubeId: string;
        youtubeUrl: string;
        showId?: string | null;
        showName?: string | null;
        tags: string[];
        topic?: string | null;
        status: string;
        scheduledAt?: Date | null;
        thumbnailUrl?: string | null;
        episodeNumber?: number | null;
        seasonNumber?: number | null;
        contentTopics?: string[];
        guestNames?: string[];
        guestBios?: string[];
        sponsorNames?: string[];
        sponsorMessages?: string[];
    };
}

const videoTopics = [
    { value: 'GENERAL', label: 'General' },
    { value: 'REENTRY', label: 'Reentry' },
    { value: 'ADDICTION', label: 'Addiction Recovery' },
    { value: 'CRIMINAL_JUSTICE_REFORM', label: 'Criminal Justice Reform' },
    { value: 'MENTAL_HEALTH', label: 'Mental Health' },
];

const statusOptions = [
    { value: 'DRAFT', label: 'Save as Draft' },
    { value: 'SCHEDULED', label: 'Schedule for Later' },
    { value: 'PUBLISHED', label: 'Publish Now' },
];

export function VideoForm({ video }: VideoFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: video?.title || '',
        description: video?.description || '',
        youtubeUrl: video?.youtubeUrl || '',
        youtubeId: video?.youtubeId || '',
        showId: video?.showId || '',
        showName: video?.showName || '',
        tags: video?.tags?.join(', ') || '',
        topic: video?.topic || 'GENERAL',
        status: video?.status || 'DRAFT',
        scheduledAt: video?.scheduledAt
            ? new Date(video.scheduledAt).toISOString().slice(0, 16)
            : '',
        episodeNumber: video?.episodeNumber?.toString() || '',
        seasonNumber: video?.seasonNumber?.toString() || '',
        contentTopics: video?.contentTopics?.join(', ') || '',
        guestNames: video?.guestNames?.join(', ') || '',
        guestBios: video?.guestBios?.join(', ') || '',
        sponsorNames: video?.sponsorNames?.join(', ') || '',
        sponsorMessages: video?.sponsorMessages?.join(', ') || '',
        thumbnailUrl: video?.thumbnailUrl || '',
    });

    const extractYouTubeId = (url: string) => {
        const regex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : url;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.youtubeUrl) {
                alert(
                    'Please fill in all required fields (Title and YouTube URL).'
                );
                setIsSubmitting(false);
                return;
            }
            if (formData.status === 'SCHEDULED' && !formData.scheduledAt) {
                alert('Please select a date and time for scheduled content.');
                setIsSubmitting(false);
                return;
            }

            const videoData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                youtubeUrl: formData.youtubeUrl.trim(),
                youtubeId: extractYouTubeId(formData.youtubeUrl.trim()),
                showName: formData.showName.trim(),
                tags: formData.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                topic: formData.topic,
                status: formData.status,
                scheduledAt:
                    formData.status === 'SCHEDULED'
                        ? formData.scheduledAt
                        : null,
                episodeNumber: formData.episodeNumber
                    ? parseInt(formData.episodeNumber)
                    : null,
                seasonNumber: formData.seasonNumber
                    ? parseInt(formData.seasonNumber)
                    : null,
                contentTopics: formData.contentTopics
                    .split(',')
                    .map((topic) => topic.trim())
                    .filter(Boolean),
                guestNames: formData.guestNames
                    .split(',')
                    .map((name) => name.trim())
                    .filter(Boolean),
                guestBios: formData.guestBios
                    .split(',')
                    .map((bio) => bio.trim())
                    .filter(Boolean),
                sponsorNames: formData.sponsorNames
                    .split(',')
                    .map((name) => name.trim())
                    .filter(Boolean),
                sponsorMessages: formData.sponsorMessages
                    .split(',')
                    .map((msg) => msg.trim())
                    .filter(Boolean),
                thumbnailUrl: formData.thumbnailUrl.trim(),
            };

            const endpoint = video
                ? `/api/creator/videos/${video.id}`
                : '/api/creator/videos';
            const method = video ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(videoData),
            });

            if (!response.ok) {
                throw new Error('Failed to save video');
            }

            // Redirect back to videos list with success message
            router.push('/creator/videos?saved=true');
        } catch (error) {
            console.error('Error saving video:', error);
            alert('Failed to save video. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='bg-white shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-gray-200'>
                    <h2 className='text-lg font-medium text-gray-900'>
                        Video Details
                    </h2>
                </div>
                <div className='px-6 py-6 space-y-6'>
                    {/* Title */}
                    <div>
                        <label
                            htmlFor='title'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Title *
                        </label>
                        <input
                            type='text'
                            id='title'
                            value={formData.title}
                            onChange={(e) =>
                                handleChange('title', e.target.value)
                            }
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label
                            htmlFor='description'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Description
                        </label>
                        <textarea
                            id='description'
                            rows={4}
                            value={formData.description}
                            onChange={(e) =>
                                handleChange('description', e.target.value)
                            }
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                            placeholder='Describe your video content...'
                        />
                    </div>

                    {/* YouTube URL */}
                    <div>
                        <label
                            htmlFor='youtubeUrl'
                            className='block text-sm font-medium text-gray-700'
                        >
                            YouTube URL *
                        </label>
                        <input
                            type='text'
                            id='youtubeUrl'
                            value={formData.youtubeUrl}
                            onChange={(e) =>
                                handleChange('youtubeUrl', e.target.value)
                            }
                            placeholder='https://youtube.com/watch?v=...'
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                            required
                        />
                    </div>

                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                        {/* Show Name */}
                        <div>
                            <label
                                htmlFor='showName'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Show Name
                            </label>
                            <input
                                type='text'
                                id='showName'
                                value={formData.showName}
                                onChange={(e) =>
                                    handleChange('showName', e.target.value)
                                }
                                placeholder='H3 Network Show'
                                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                            />
                        </div>

                        {/* Topic */}
                        <div>
                            <label
                                htmlFor='topic'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Topic
                            </label>
                            <select
                                id='topic'
                                value={formData.topic}
                                onChange={(e) =>
                                    handleChange('topic', e.target.value)
                                }
                                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                            >
                                {videoTopics.map((topic) => (
                                    <option
                                        key={topic.value}
                                        value={topic.value}
                                    >
                                        {topic.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                        {/* Episode Number */}
                        <div>
                            <label
                                htmlFor='episodeNumber'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Episode Number
                            </label>
                            <input
                                type='number'
                                id='episodeNumber'
                                value={formData.episodeNumber}
                                onChange={(e) =>
                                    handleChange(
                                        'episodeNumber',
                                        e.target.value
                                    )
                                }
                                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                min='1'
                            />
                        </div>

                        {/* Season Number */}
                        <div>
                            <label
                                htmlFor='seasonNumber'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Season Number
                            </label>
                            <input
                                type='number'
                                id='seasonNumber'
                                value={formData.seasonNumber}
                                onChange={(e) =>
                                    handleChange('seasonNumber', e.target.value)
                                }
                                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                min='1'
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label
                            htmlFor='tags'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Tags
                        </label>
                        <input
                            type='text'
                            id='tags'
                            value={formData.tags}
                            onChange={(e) =>
                                handleChange('tags', e.target.value)
                            }
                            placeholder='recovery, reentry, hope'
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        />
                        <p className='mt-1 text-sm text-gray-500'>
                            Separate tags with commas
                        </p>
                    </div>

                    {/* Content Topics */}
                    <div>
                        <label
                            htmlFor='contentTopics'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Content Topics
                        </label>
                        <input
                            type='text'
                            id='contentTopics'
                            value={formData.contentTopics}
                            onChange={(e) =>
                                handleChange('contentTopics', e.target.value)
                            }
                            placeholder='criminal justice reform, addiction recovery'
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        />
                        <p className='mt-1 text-sm text-gray-500'>
                            Separate topics with commas
                        </p>
                    </div>
                </div>
            </div>

            {/* Guest and Sponsor Information */}
            <div className='bg-white shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-gray-200'>
                    <h2 className='text-lg font-medium text-gray-900'>
                        Guest & Sponsor Information
                    </h2>
                </div>
                <div className='px-6 py-6 space-y-6'>
                    {/* Guest Names */}
                    <div>
                        <label
                            htmlFor='guestNames'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Guest Names
                        </label>
                        <input
                            type='text'
                            id='guestNames'
                            value={formData.guestNames}
                            onChange={(e) =>
                                handleChange('guestNames', e.target.value)
                            }
                            placeholder='John Doe, Jane Smith'
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        />
                        <p className='mt-1 text-sm text-gray-500'>
                            Separate names with commas
                        </p>
                    </div>

                    {/* Guest Bios */}
                    <div>
                        <label
                            htmlFor='guestBios'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Guest Bios
                        </label>
                        <textarea
                            id='guestBios'
                            rows={3}
                            value={formData.guestBios}
                            onChange={(e) =>
                                handleChange('guestBios', e.target.value)
                            }
                            placeholder='Brief bio for John Doe, Brief bio for Jane Smith'
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        />
                        <p className='mt-1 text-sm text-gray-500'>
                            Separate bios with commas
                        </p>
                    </div>

                    {/* Sponsor Names */}
                    <div>
                        <label
                            htmlFor='sponsorNames'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Sponsor Names
                        </label>
                        <input
                            type='text'
                            id='sponsorNames'
                            value={formData.sponsorNames}
                            onChange={(e) =>
                                handleChange('sponsorNames', e.target.value)
                            }
                            placeholder='Sponsor Company, Another Sponsor'
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        />
                        <p className='mt-1 text-sm text-gray-500'>
                            Separate names with commas
                        </p>
                    </div>

                    {/* Sponsor Messages */}
                    <div>
                        <label
                            htmlFor='sponsorMessages'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Sponsor Messages
                        </label>
                        <textarea
                            id='sponsorMessages'
                            rows={3}
                            value={formData.sponsorMessages}
                            onChange={(e) =>
                                handleChange('sponsorMessages', e.target.value)
                            }
                            placeholder='Special thanks to our sponsor...'
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        />
                        <p className='mt-1 text-sm text-gray-500'>
                            Separate messages with commas
                        </p>
                    </div>

                    {/* Thumbnail URL */}
                    <div>
                        <label
                            htmlFor='thumbnailUrl'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Custom Thumbnail URL
                        </label>
                        <input
                            type='url'
                            id='thumbnailUrl'
                            value={formData.thumbnailUrl}
                            onChange={(e) =>
                                handleChange('thumbnailUrl', e.target.value)
                            }
                            placeholder='https://example.com/thumbnail.jpg'
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        />
                        <p className='mt-1 text-sm text-gray-500'>
                            Leave blank to use YouTube&apos;s default thumbnail
                        </p>
                    </div>
                </div>
            </div>

            {/* Publishing Options */}
            <div className='bg-white shadow-sm rounded-lg'>
                <div className='px-6 py-4 border-b border-gray-200'>
                    <h2 className='text-lg font-medium text-gray-900'>
                        Publishing Options
                    </h2>
                </div>
                <div className='px-6 py-6 space-y-6'>
                    {/* Status */}
                    <div>
                        <label
                            htmlFor='status'
                            className='block text-sm font-medium text-gray-700'
                        >
                            Status
                        </label>
                        <select
                            id='status'
                            value={formData.status}
                            onChange={(e) =>
                                handleChange('status', e.target.value)
                            }
                            className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Schedule */}
                    {formData.status === 'SCHEDULED' && (
                        <div>
                            <label
                                htmlFor='scheduledAt'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Schedule for
                            </label>
                            <input
                                type='datetime-local'
                                id='scheduledAt'
                                value={formData.scheduledAt}
                                onChange={(e) =>
                                    handleChange('scheduledAt', e.target.value)
                                }
                                className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                required={formData.status === 'SCHEDULED'}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className='flex justify-between'>
                <button
                    type='button'
                    onClick={() => router.back()}
                    className='inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                >
                    <ArrowLeftIcon className='-ml-1 mr-2 h-5 w-5' />
                    Back
                </button>
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className='inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {isSubmitting
                        ? 'Saving...'
                        : video
                        ? 'Update Video'
                        : 'Save Video'}
                </button>
            </div>
        </form>
    );
}
