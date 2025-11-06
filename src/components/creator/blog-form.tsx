'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface BlogFormProps {
    blog?: {
        id: string;
        title: string;
        content?: string | null;
        excerpt?: string | null;
        featuredImage?: string | null;
        tags: string[];
        topic?: string | null;
        status: string;
        scheduledAt?: Date | null;
        readTime?: number | null;
    };
}

const blogTopics = [
    { value: 'GENERAL', label: 'General' },
    { value: 'REENTRY', label: 'Reentry' },
    { value: 'ADDICTION', label: 'Addiction Recovery' },
    { value: 'CRIMINAL_JUSTICE_REFORM', label: 'Criminal Justice Reform' },
    { value: 'MENTAL_HEALTH', label: 'Mental Health' },
    { value: 'FAMILY', label: 'Family & Relationships' },
];

const statusOptions = [
    { value: 'DRAFT', label: 'Save as Draft' },
    { value: 'SCHEDULED', label: 'Schedule for Later' },
    { value: 'PUBLISHED', label: 'Publish Now' },
];

export function BlogForm({ blog }: BlogFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: blog?.title || '',
        content: blog?.content || '',
        excerpt: blog?.excerpt || '',
        featuredImage: blog?.featuredImage || '',
        tags: blog?.tags?.join(', ') || '',
        topic: blog?.topic || 'GENERAL',
        status: blog?.status || 'DRAFT',
        scheduledAt: blog?.scheduledAt
            ? new Date(blog.scheduledAt).toISOString().slice(0, 16)
            : '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validate required fields
            if (!formData.title || !formData.content) {
                alert(
                    'Please fill in all required fields (Title and Content).'
                );
                setIsSubmitting(false);
                return;
            }

            if (formData.status === 'SCHEDULED' && !formData.scheduledAt) {
                alert('Please select a date and time for scheduled content.');
                setIsSubmitting(false);
                return;
            }

            const blogData = {
                title: formData.title.trim(),
                content: formData.content.trim(),
                excerpt:
                    formData.excerpt.trim() ||
                    formData.content.slice(0, 200) + '...',
                featuredImage: formData.featuredImage.trim(),
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
                readTime: Math.ceil(
                    formData.content.trim().split(' ').length / 200
                ), // Approximate reading time
            };

            const endpoint = blog
                ? `/api/creator/blogs/${blog.id}`
                : '/api/creator/blogs';
            const method = blog ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blogData),
            });

            if (response.ok) {
                router.push('/creator/blogs');
                router.refresh();
            } else {
                const errorData = await response.json();
                alert(
                    `Error: ${errorData.error || 'Failed to save blog post'}`
                );
            }
        } catch (error) {
            console.error('Error submitting blog:', error);
            alert('An error occurred while saving the blog post.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='max-w-4xl mx-auto'>
            <form onSubmit={handleSubmit} className='space-y-8'>
                {/* Back Button */}
                <button
                    type='button'
                    onClick={() => router.back()}
                    className='inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                >
                    <ArrowLeftIcon className='h-4 w-4 mr-2' />
                    Back
                </button>

                <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
                    {/* Main Content */}
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Title */}
                        <div>
                            <label
                                htmlFor='title'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Blog Title *
                            </label>
                            <input
                                type='text'
                                id='title'
                                required
                                value={formData.title}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                                placeholder='Enter your blog title'
                            />
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label
                                htmlFor='excerpt'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Excerpt
                            </label>
                            <textarea
                                id='excerpt'
                                rows={3}
                                value={formData.excerpt}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        excerpt: e.target.value,
                                    }))
                                }
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                                placeholder='Brief summary of your blog post (optional - will be auto-generated if left blank)'
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label
                                htmlFor='content'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Content *
                            </label>
                            <textarea
                                id='content'
                                rows={20}
                                required
                                value={formData.content}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        content: e.target.value,
                                    }))
                                }
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                                placeholder='Write your blog content here... You can use markdown formatting.'
                            />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className='space-y-6'>
                        {/* Featured Image */}
                        <div>
                            <label
                                htmlFor='featuredImage'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Featured Image URL
                            </label>
                            <input
                                type='url'
                                id='featuredImage'
                                value={formData.featuredImage}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        featuredImage: e.target.value,
                                    }))
                                }
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                                placeholder='https://example.com/image.jpg'
                            />
                        </div>

                        {/* Topic */}
                        <div>
                            <label
                                htmlFor='topic'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Primary Topic
                            </label>
                            <select
                                id='topic'
                                value={formData.topic}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        topic: e.target.value,
                                    }))
                                }
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            >
                                {blogTopics.map((topic) => (
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
                                    setFormData((prev) => ({
                                        ...prev,
                                        tags: e.target.value,
                                    }))
                                }
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                                placeholder='recovery, hope, justice (comma-separated)'
                            />
                            <p className='mt-1 text-xs text-gray-500'>
                                Separate tags with commas
                            </p>
                        </div>

                        {/* Publishing Options */}
                        <div>
                            <label
                                htmlFor='status'
                                className='block text-sm font-medium text-gray-700'
                            >
                                Publishing Status
                            </label>
                            <select
                                id='status'
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                    }))
                                }
                                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                            >
                                {statusOptions.map((status) => (
                                    <option
                                        key={status.value}
                                        value={status.value}
                                    >
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Scheduled Date/Time */}
                        {formData.status === 'SCHEDULED' && (
                            <div>
                                <label
                                    htmlFor='scheduledAt'
                                    className='block text-sm font-medium text-gray-700'
                                >
                                    Schedule Date & Time
                                </label>
                                <input
                                    type='datetime-local'
                                    id='scheduledAt'
                                    required={formData.status === 'SCHEDULED'}
                                    value={formData.scheduledAt}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            scheduledAt: e.target.value,
                                        }))
                                    }
                                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500'
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className='pt-6'>
                            <button
                                type='submit'
                                disabled={isSubmitting}
                                className='w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                {isSubmitting
                                    ? 'Saving...'
                                    : blog
                                    ? 'Update Blog Post'
                                    : formData.status === 'PUBLISHED'
                                    ? 'Publish Blog Post'
                                    : formData.status === 'SCHEDULED'
                                    ? 'Schedule Blog Post'
                                    : 'Save Draft'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
