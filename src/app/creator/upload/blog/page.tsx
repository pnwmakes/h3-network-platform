'use client';

import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    FileText,
    Upload,
    Plus,
    X,
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
    Image as ImageIcon,
} from 'lucide-react';

interface BlogFormData {
    title: string;
    content: string;
    excerpt: string;
    topic: string;
    tags: string[];
    contentTopics: string[];
    readTime: number;
}

const CONTENT_TOPICS = [
    'Addiction Recovery',
    'Criminal Justice Reform',
    'Reentry Support',
    'Mental Health',
    'Personal Growth',
    'Community Service',
    'Advocacy',
    'Legal Issues',
    'Family Support',
    'Employment',
    'Housing',
    'Education',
    'Healthcare',
    'Spirituality',
    'Relationships',
];

const BLOG_TOPICS = [
    'ADDICTION',
    'REENTRY',
    'ADVOCACY',
    'JUSTICE',
    'COMMUNITY',
    'PERSONAL_GROWTH',
    'GENERAL',
];

function BlogUploadPage() {
    const router = useRouter();

    const [formData, setFormData] = useState<BlogFormData>({
        title: '',
        content: '',
        excerpt: '',
        topic: 'GENERAL',
        tags: [],
        contentTopics: [],
        readTime: 5,
    });

    const [newTag, setNewTag] = useState('');
    const [selectedContentTopics, setSelectedContentTopics] = useState<
        string[]
    >([]);
    const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(
        null
    );
    const [featuredImagePreview, setFeaturedImagePreview] =
        useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (
        field: keyof BlogFormData,
        value: string | number
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Auto-calculate read time based on content length
        if (field === 'content' && typeof value === 'string') {
            const wordCount = value.trim().split(/\s+/).length;
            const estimatedReadTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute
            setFormData((prev) => ({
                ...prev,
                readTime: Math.max(1, estimatedReadTime),
            }));
        }

        if (error) setError('');
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const toggleContentTopic = (topic: string) => {
        setSelectedContentTopics((prev) =>
            prev.includes(topic)
                ? prev.filter((t) => t !== topic)
                : [...prev, topic]
        );
    };

    const handleFeaturedImageChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                setError('Featured image must be less than 5MB');
                return;
            }

            setFeaturedImageFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setFeaturedImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validation
            if (!formData.title.trim()) {
                throw new Error('Title is required');
            }
            if (!formData.content.trim()) {
                throw new Error('Content is required');
            }

            // Upload featured image if selected
            let featuredImage = '';
            if (featuredImageFile) {
                console.log(
                    'Uploading featured image:',
                    featuredImageFile.name
                );

                const formDataUpload = new FormData();
                formDataUpload.append('file', featuredImageFile);
                formDataUpload.append('type', 'blog-featured');

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataUpload,
                });

                console.log('Upload response status:', uploadResponse.status);

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    console.error('Upload error:', errorData);
                    throw new Error(
                        errorData.error || 'Failed to upload featured image'
                    );
                }

                const uploadData = await uploadResponse.json();
                console.log('Upload successful:', uploadData);
                featuredImage = uploadData.url;
            }

            // Generate excerpt if not provided
            const excerpt =
                formData.excerpt.trim() ||
                formData.content.substring(0, 200) + '...';

            // Create blog
            const response = await fetch('/api/creator/blogs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    content: formData.content,
                    excerpt,
                    topic: formData.topic,
                    tags: formData.tags,
                    contentTopics: selectedContentTopics,
                    readTime: formData.readTime,
                    ...(featuredImage && { featuredImage }),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create blog');
            }

            setSuccess(
                'Blog saved as draft and submitted for approval successfully!'
            );

            // Redirect to creator dashboard after a delay
            setTimeout(() => {
                router.push('/creator/dashboard');
            }, 2000);
        } catch (error) {
            setError(
                error instanceof Error ? error.message : 'An error occurred'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Header */}
                <div className='mb-8'>
                    <Button
                        variant='ghost'
                        onClick={() => router.back()}
                        className='mb-4'
                    >
                        <ArrowLeft className='h-4 w-4 mr-2' />
                        Back
                    </Button>

                    <div className='flex items-center space-x-3 mb-2'>
                        <div className='p-3 bg-green-100 rounded-lg'>
                            <FileText className='h-8 w-8 text-green-600' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                Write Blog Post
                            </h1>
                            <p className='text-gray-600'>
                                Share your insights and experiences
                            </p>
                        </div>
                    </div>

                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
                        <div className='flex items-start space-x-3'>
                            <AlertCircle className='h-5 w-5 text-blue-600 mt-0.5' />
                            <div>
                                <h3 className='font-medium text-blue-900'>
                                    Content Review Process
                                </h3>
                                <p className='text-sm text-blue-700 mt-1'>
                                    Your blog will be submitted as a draft and
                                    reviewed by our admin team before being
                                    published. You&apos;ll receive a
                                    notification once it&apos;s approved.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert className='mb-6 border-red-200 bg-red-50'>
                        <AlertCircle className='h-4 w-4 text-red-600' />
                        <AlertDescription className='text-red-700'>
                            {error}
                        </AlertDescription>
                    </Alert>
                )}

                {success && (
                    <Alert className='mb-6 border-green-200 bg-green-50'>
                        <CheckCircle className='h-4 w-4 text-green-600' />
                        <AlertDescription className='text-green-700'>
                            {success}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <div className='space-y-8'>
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <FileText className='h-5 w-5 mr-2 text-green-600' />
                                    Blog Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div>
                                    <Label htmlFor='title'>Blog Title *</Label>
                                    <Input
                                        id='title'
                                        value={formData.title}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'title',
                                                e.target.value
                                            )
                                        }
                                        placeholder='Enter a compelling blog title'
                                        className='mt-1'
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='excerpt'>Excerpt</Label>
                                    <Textarea
                                        id='excerpt'
                                        value={formData.excerpt}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'excerpt',
                                                e.target.value
                                            )
                                        }
                                        placeholder='Brief summary of your blog post (optional - will be auto-generated if empty)'
                                        rows={2}
                                        className='mt-1'
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='content'>Content *</Label>
                                    <Textarea
                                        id='content'
                                        value={formData.content}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'content',
                                                e.target.value
                                            )
                                        }
                                        placeholder='Write your blog content here...'
                                        rows={12}
                                        className='mt-1'
                                    />
                                    <p className='text-sm text-gray-500 mt-2'>
                                        Estimated read time: {formData.readTime}{' '}
                                        minute
                                        {formData.readTime !== 1 ? 's' : ''}
                                    </p>
                                </div>

                                <div>
                                    <Label htmlFor='topic'>Primary Topic</Label>
                                    <Select
                                        value={formData.topic}
                                        onValueChange={(value) =>
                                            handleInputChange('topic', value)
                                        }
                                    >
                                        <SelectTrigger className='mt-1'>
                                            <SelectValue placeholder='Select a topic' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BLOG_TOPICS.map((topic) => (
                                                <SelectItem
                                                    key={topic}
                                                    value={topic}
                                                >
                                                    {topic
                                                        .replace('_', ' ')
                                                        .toLowerCase()
                                                        .replace(/\b\w/g, (l) =>
                                                            l.toUpperCase()
                                                        )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Content Topics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Content Topics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className='text-sm text-gray-600 mb-4'>
                                    Select all topics that apply to your blog
                                    post:
                                </p>
                                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                                    {CONTENT_TOPICS.map((topic) => (
                                        <label
                                            key={topic}
                                            className='flex items-center space-x-2 cursor-pointer'
                                        >
                                            <input
                                                type='checkbox'
                                                checked={selectedContentTopics.includes(
                                                    topic
                                                )}
                                                onChange={() =>
                                                    toggleContentTopic(topic)
                                                }
                                                className='rounded border-gray-300'
                                            />
                                            <span className='text-sm'>
                                                {topic}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tags */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tags</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex space-x-2'>
                                    <Input
                                        value={newTag}
                                        onChange={(e) =>
                                            setNewTag(e.target.value)
                                        }
                                        placeholder='Add a tag'
                                        onKeyPress={(e) =>
                                            e.key === 'Enter' &&
                                            (e.preventDefault(), addTag())
                                        }
                                    />
                                    <Button
                                        type='button'
                                        onClick={addTag}
                                        variant='outline'
                                    >
                                        <Plus className='h-4 w-4' />
                                    </Button>
                                </div>

                                <div className='flex flex-wrap gap-2'>
                                    {formData.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant='secondary'
                                            className='flex items-center space-x-1'
                                        >
                                            <span>{tag}</span>
                                            <button
                                                type='button'
                                                onClick={() => removeTag(tag)}
                                                className='ml-1 hover:text-red-600'
                                            >
                                                <X className='h-3 w-3' />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Featured Image Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Featured Image (Optional)</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex items-center space-x-4'>
                                    {featuredImagePreview ? (
                                        <div className='relative'>
                                            <Image
                                                src={featuredImagePreview}
                                                alt='Featured image preview'
                                                width={200}
                                                height={120}
                                                className='object-cover rounded-lg'
                                            />
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                className='absolute -top-2 -right-2'
                                                onClick={() => {
                                                    setFeaturedImageFile(null);
                                                    setFeaturedImagePreview('');
                                                }}
                                            >
                                                <X className='h-3 w-3' />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className='w-48 h-28 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
                                            <ImageIcon className='h-8 w-8 text-gray-400' />
                                        </div>
                                    )}

                                    <div>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            onChange={handleFeaturedImageChange}
                                            className='hidden'
                                            id='featured-image-upload'
                                        />
                                        <label htmlFor='featured-image-upload'>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                asChild
                                            >
                                                <span className='cursor-pointer'>
                                                    <Upload className='h-4 w-4 mr-2' />
                                                    Upload Featured Image
                                                </span>
                                            </Button>
                                        </label>
                                        <p className='text-xs text-gray-500 mt-2'>
                                            Recommended: 16:9 aspect ratio,
                                            under 5MB
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Submit Actions */}
                        <Card>
                            <CardContent className='pt-6'>
                                <div className='flex space-x-4'>
                                    <Button
                                        type='submit'
                                        disabled={isLoading}
                                        className='flex-1'
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                                                Submitting...
                                            </>
                                        ) : (
                                            <>
                                                <Save className='h-4 w-4 mr-2' />
                                                Submit for Approval
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() =>
                                            router.push('/creator/dashboard')
                                        }
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                </div>

                                <p className='text-sm text-gray-500 mt-3 text-center'>
                                    Your blog will be saved as a draft and
                                    submitted to admins for review before
                                    publication.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function BlogUploadPageWrapper() {
    return (
        <Suspense fallback={
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        }>
            <BlogUploadPage />
        </Suspense>
    );
}
