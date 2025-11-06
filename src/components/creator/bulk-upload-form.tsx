'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Creator {
    id: string;
    displayName: string;
}

interface Show {
    id: string;
    name: string;
}

interface BulkUploadFormProps {
    creator: Creator;
    shows: Show[];
}

interface VideoEntry {
    id: string;
    title: string;
    description: string;
    youtubeId: string;
    showId: string;
    tags: string;
    scheduledFor?: string;
    topic: string;
}

const videoTopics = [
    { value: 'GENERAL', label: 'General' },
    { value: 'REENTRY', label: 'Reentry' },
    { value: 'ADDICTION', label: 'Addiction Recovery' },
    { value: 'CRIMINAL_JUSTICE_REFORM', label: 'Criminal Justice Reform' },
    { value: 'MENTAL_HEALTH', label: 'Mental Health' },
];

export function BulkUploadForm({ creator, shows }: BulkUploadFormProps) {
    const router = useRouter();
    const [videos, setVideos] = useState<VideoEntry[]>([
        {
            id: '1',
            title: '',
            description: '',
            youtubeId: '',
            showId: shows[0]?.id || '',
            tags: '',
            topic: 'GENERAL',
        },
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addVideoEntry = () => {
        const newVideo: VideoEntry = {
            id: Date.now().toString(),
            title: '',
            description: '',
            youtubeId: '',
            showId: shows[0]?.id || '',
            tags: '',
            topic: 'GENERAL',
        };
        setVideos([...videos, newVideo]);
    };

    const removeVideoEntry = (id: string) => {
        if (videos.length > 1) {
            setVideos(videos.filter((video) => video.id !== id));
        }
    };

    const updateVideoEntry = (id: string, field: string, value: string) => {
        setVideos(
            videos.map((video) =>
                video.id === id ? { ...video, [field]: value } : video
            )
        );
    };

    const extractYouTubeId = (url: string) => {
        const regex =
            /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = url.match(regex);
        return match ? match[1] : url; // Return the ID if found, otherwise return the original string
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            const invalidVideos = videos.filter(
                (video) => !video.title.trim() || !video.youtubeId.trim()
            );

            if (invalidVideos.length > 0) {
                alert(
                    'Please fill in all required fields (Title and YouTube URL/ID) for all videos.'
                );
                setIsSubmitting(false);
                return;
            }

            // Process videos and extract YouTube IDs
            const processedVideos = videos.map((video) => ({
                ...video,
                youtubeId: extractYouTubeId(video.youtubeId.trim()),
                tags: video.tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                creatorId: creator.id,
            }));

            const response = await fetch('/api/creator/videos/bulk-upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    videos: processedVideos,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to upload videos');
            }

            await response.json();

            // Redirect to videos list with success message
            router.push('/creator/videos?uploaded=true');
        } catch (error) {
            console.error('Error uploading videos:', error);
            alert('Failed to upload videos. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='space-y-8'>
            <div className='bg-blue-50 border border-blue-200 rounded-md p-4'>
                <div className='flex'>
                    <div className='ml-3'>
                        <h3 className='text-sm font-medium text-blue-800'>
                            Bulk Upload Tips
                        </h3>
                        <div className='mt-2 text-sm text-blue-700'>
                            <ul className='list-disc pl-5 space-y-1'>
                                <li>
                                    YouTube URLs will be automatically processed
                                    to extract video IDs
                                </li>
                                <li>Tags should be separated by commas</li>
                                <li>
                                    Videos can be scheduled for future release
                                </li>
                                <li>
                                    All videos will be set to DRAFT status
                                    initially
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className='space-y-6'>
                {videos.map((video, index) => (
                    <div
                        key={video.id}
                        className='bg-white border border-gray-200 rounded-lg p-6'
                    >
                        <div className='flex items-center justify-between mb-4'>
                            <h3 className='text-lg font-medium text-gray-900'>
                                Video {index + 1}
                            </h3>
                            {videos.length > 1 && (
                                <button
                                    type='button'
                                    onClick={() => removeVideoEntry(video.id)}
                                    className='text-red-600 hover:text-red-500'
                                >
                                    <TrashIcon className='h-5 w-5' />
                                </button>
                            )}
                        </div>

                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2'>
                            {/* Title */}
                            <div className='sm:col-span-2'>
                                <label
                                    htmlFor={`title-${video.id}`}
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Title *
                                </label>
                                <input
                                    type='text'
                                    id={`title-${video.id}`}
                                    value={video.title}
                                    onChange={(e) =>
                                        updateVideoEntry(
                                            video.id,
                                            'title',
                                            e.target.value
                                        )
                                    }
                                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                    required
                                />
                            </div>

                            {/* YouTube URL/ID */}
                            <div>
                                <label
                                    htmlFor={`youtube-${video.id}`}
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    YouTube URL or Video ID *
                                </label>
                                <input
                                    type='text'
                                    id={`youtube-${video.id}`}
                                    value={video.youtubeId}
                                    onChange={(e) =>
                                        updateVideoEntry(
                                            video.id,
                                            'youtubeId',
                                            e.target.value
                                        )
                                    }
                                    placeholder='https://youtube.com/watch?v=... or dQw4w9WgXcQ'
                                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                    required
                                />
                            </div>

                            {/* Show */}
                            <div>
                                <label
                                    htmlFor={`show-${video.id}`}
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Show
                                </label>
                                <select
                                    id={`show-${video.id}`}
                                    value={video.showId}
                                    onChange={(e) =>
                                        updateVideoEntry(
                                            video.id,
                                            'showId',
                                            e.target.value
                                        )
                                    }
                                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                >
                                    {shows.map((show) => (
                                        <option key={show.id} value={show.id}>
                                            {show.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Topic */}
                            <div>
                                <label
                                    htmlFor={`topic-${video.id}`}
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Topic
                                </label>
                                <select
                                    id={`topic-${video.id}`}
                                    value={video.topic}
                                    onChange={(e) =>
                                        updateVideoEntry(
                                            video.id,
                                            'topic',
                                            e.target.value
                                        )
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

                            {/* Tags */}
                            <div>
                                <label
                                    htmlFor={`tags-${video.id}`}
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Tags
                                </label>
                                <input
                                    type='text'
                                    id={`tags-${video.id}`}
                                    value={video.tags}
                                    onChange={(e) =>
                                        updateVideoEntry(
                                            video.id,
                                            'tags',
                                            e.target.value
                                        )
                                    }
                                    placeholder='recovery, reentry, hope'
                                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                                <p className='mt-1 text-sm text-gray-500'>
                                    Separate tags with commas
                                </p>
                            </div>

                            {/* Schedule */}
                            <div>
                                <label
                                    htmlFor={`schedule-${video.id}`}
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Schedule for (optional)
                                </label>
                                <input
                                    type='datetime-local'
                                    id={`schedule-${video.id}`}
                                    value={video.scheduledFor || ''}
                                    onChange={(e) =>
                                        updateVideoEntry(
                                            video.id,
                                            'scheduledFor',
                                            e.target.value
                                        )
                                    }
                                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>

                            {/* Description */}
                            <div className='sm:col-span-2'>
                                <label
                                    htmlFor={`description-${video.id}`}
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Description
                                </label>
                                <textarea
                                    id={`description-${video.id}`}
                                    rows={4}
                                    value={video.description}
                                    onChange={(e) =>
                                        updateVideoEntry(
                                            video.id,
                                            'description',
                                            e.target.value
                                        )
                                    }
                                    className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500'
                                    placeholder='Describe your video content...'
                                />
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Video Button */}
                <div className='flex justify-center'>
                    <button
                        type='button'
                        onClick={addVideoEntry}
                        className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    >
                        <PlusIcon className='-ml-1 mr-2 h-5 w-5' />
                        Add Another Video
                    </button>
                </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end space-x-3'>
                <button
                    type='button'
                    onClick={() => router.back()}
                    className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                >
                    Cancel
                </button>
                <button
                    type='submit'
                    disabled={isSubmitting}
                    className='px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    {isSubmitting
                        ? 'Uploading...'
                        : `Upload ${videos.length} Video${
                              videos.length > 1 ? 's' : ''
                          }`}
                </button>
            </div>
        </form>
    );
}
