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
    Video,
    Upload,
    Plus,
    X,
    Youtube,
    Save,
    ArrowLeft,
    AlertCircle,
    CheckCircle,
} from 'lucide-react';

interface VideoFormData {
    title: string;
    description: string;
    youtubeUrl: string;
    youtubeId: string;
    topic: string;
    showName: string;
    seasonNumber: number;
    episodeNumber: number;
    tags: string[];
    contentTopics: string[];
    guestNames: string[];
    guestBios: string[];
    sponsorNames: string[];
    sponsorMessages: string[];
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

const VIDEO_TOPICS = [
    'ADDICTION',
    'REENTRY',
    'ADVOCACY',
    'JUSTICE',
    'COMMUNITY',
    'PERSONAL_GROWTH',
    'GENERAL',
];

function VideoUploadPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const isEditing = Boolean(editId);

    const [formData, setFormData] = useState<VideoFormData>({
        title: '',
        description: '',
        youtubeUrl: '',
        youtubeId: '',
        topic: 'GENERAL',
        showName: 'Noah & Rita Show',
        seasonNumber: 1,
        episodeNumber: 1,
        tags: [],
        contentTopics: [],
        guestNames: [],
        guestBios: [],
        sponsorNames: [],
        sponsorMessages: [],
    });

    const [newTag, setNewTag] = useState('');
    const [newGuest, setNewGuest] = useState({ name: '', bio: '' });
    const [newSponsor, setNewSponsor] = useState({ name: '', message: '' });
    const [selectedContentTopics, setSelectedContentTopics] = useState<
        string[]
    >([]);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load existing video data for editing
    useEffect(() => {
        if (isEditing && editId) {
            loadVideoForEditing(editId);
        }
    }, [isEditing, editId]);

    const loadVideoForEditing = async (videoId: string) => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/creator/videos/${videoId}`);
            const data = await response.json();

            if (data.success) {
                const video = data.video;
                setFormData({
                    title: video.title,
                    description: video.description,
                    youtubeUrl: video.youtubeUrl,
                    youtubeId: video.youtubeId,
                    topic: video.topic,
                    showName: video.showName || '',
                    seasonNumber: video.seasonNumber || 1,
                    episodeNumber: video.episodeNumber || 1,
                    tags: video.tags,
                    contentTopics: video.contentTopics,
                    guestNames: video.guestNames,
                    guestBios: video.guestBios,
                    sponsorNames: video.sponsorNames,
                    sponsorMessages: video.sponsorMessages,
                });
                setSelectedContentTopics(video.contentTopics);
                setThumbnailPreview(video.thumbnailUrl);
            } else {
                setError('Failed to load video for editing');
            }
        } catch (error) {
            console.error('Error loading video:', error);
            setError('Failed to load video for editing');
        } finally {
            setIsLoading(false);
        }
    };

    // Extract YouTube ID from URL - improved version
    const extractYouTubeId = (url: string): string => {
        if (!url) return '';

        // Remove any whitespace
        url = url.trim();

        // Handle different YouTube URL formats
        const patterns = [
            // youtube.com/watch?v=VIDEO_ID
            /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
            // youtu.be/VIDEO_ID
            /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            // youtube.com/embed/VIDEO_ID
            /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            // youtube.com/v/VIDEO_ID
            /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1] && match[1].length === 11) {
                console.log('Extracted YouTube ID:', match[1]);
                return match[1];
            }
        }

        console.warn('Could not extract YouTube ID from URL:', url);
        return '';
    };

    const handleInputChange = (
        field: keyof VideoFormData,
        value: string | number
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Auto-extract YouTube ID when URL changes
        if (field === 'youtubeUrl' && typeof value === 'string') {
            const youtubeId = extractYouTubeId(value);
            setFormData((prev) => ({ ...prev, youtubeId }));
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

    const addGuest = () => {
        if (newGuest.name.trim()) {
            setFormData((prev) => ({
                ...prev,
                guestNames: [...prev.guestNames, newGuest.name.trim()],
                guestBios: [...prev.guestBios, newGuest.bio.trim()],
            }));
            setNewGuest({ name: '', bio: '' });
        }
    };

    const removeGuest = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            guestNames: prev.guestNames.filter((_, i) => i !== index),
            guestBios: prev.guestBios.filter((_, i) => i !== index),
        }));
    };

    const addSponsor = () => {
        if (newSponsor.name.trim()) {
            setFormData((prev) => ({
                ...prev,
                sponsorNames: [...prev.sponsorNames, newSponsor.name.trim()],
                sponsorMessages: [
                    ...prev.sponsorMessages,
                    newSponsor.message.trim(),
                ],
            }));
            setNewSponsor({ name: '', message: '' });
        }
    };

    const removeSponsor = (index: number) => {
        setFormData((prev) => ({
            ...prev,
            sponsorNames: prev.sponsorNames.filter((_, i) => i !== index),
            sponsorMessages: prev.sponsorMessages.filter((_, i) => i !== index),
        }));
    };

    const toggleContentTopic = (topic: string) => {
        setSelectedContentTopics((prev) =>
            prev.includes(topic)
                ? prev.filter((t) => t !== topic)
                : [...prev, topic]
        );
        setFormData((prev) => ({
            ...prev,
            contentTopics: selectedContentTopics.includes(topic)
                ? selectedContentTopics.filter((t) => t !== topic)
                : [...selectedContentTopics, topic],
        }));
    };

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                setError('Thumbnail must be less than 5MB');
                return;
            }

            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setThumbnailPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent, asDraft = true) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validation
            if (!formData.title.trim()) {
                throw new Error('Title is required');
            }
            if (!formData.youtubeUrl.trim()) {
                throw new Error('YouTube URL is required');
            }
            if (!formData.youtubeId) {
                throw new Error('Invalid YouTube URL');
            }

            // Upload thumbnail if selected (new file)
            let thumbnailUrl = thumbnailPreview; // Keep existing thumbnail if editing
            if (thumbnailFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', thumbnailFile);
                formDataUpload.append('type', 'thumbnail');

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataUpload,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload thumbnail');
                }

                const uploadData = await uploadResponse.json();
                thumbnailUrl = uploadData.url;
            }

            // Create or update video
            const url = isEditing
                ? `/api/creator/videos/${editId}`
                : '/api/creator/videos';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    contentTopics: selectedContentTopics,
                    ...(thumbnailUrl && { thumbnailUrl }),
                    status: asDraft ? 'DRAFT' : 'PUBLISHED', // For future use
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                        `Failed to ${isEditing ? 'update' : 'create'} video`
                );
            }

            setSuccess(
                `Video ${isEditing ? 'updated' : 'created'} ${
                    asDraft ? 'and submitted for approval' : 'successfully'
                } successfully!`
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
                        <div className='p-3 bg-blue-100 rounded-lg'>
                            <Video className='h-8 w-8 text-blue-600' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                {isEditing ? 'Edit Video' : 'Upload Video'}
                            </h1>
                            <p className='text-gray-600'>
                                {isEditing
                                    ? 'Update your video content and settings'
                                    : 'Share your story with the H3 Network community'}
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
                                    Your video will be submitted as a draft and
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

                <form onSubmit={(e) => handleSubmit(e, true)}>
                    <div className='space-y-8'>
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <Youtube className='h-5 w-5 mr-2 text-red-600' />
                                    Video Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='md:col-span-2'>
                                        <Label htmlFor='youtubeUrl'>
                                            YouTube URL *
                                        </Label>
                                        <Input
                                            id='youtubeUrl'
                                            value={formData.youtubeUrl}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'youtubeUrl',
                                                    e.target.value
                                                )
                                            }
                                            placeholder='https://www.youtube.com/watch?v=...'
                                            className='mt-1'
                                        />
                                        {formData.youtubeId && (
                                            <p className='text-sm text-green-600 mt-1'>
                                                ✓ Valid YouTube URL detected
                                                (ID: {formData.youtubeId})
                                            </p>
                                        )}
                                    </div>

                                    <div className='md:col-span-2'>
                                        <Label htmlFor='title'>
                                            Video Title *
                                        </Label>
                                        <Input
                                            id='title'
                                            value={formData.title}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'title',
                                                    e.target.value
                                                )
                                            }
                                            placeholder='Enter a compelling video title'
                                            className='mt-1'
                                        />
                                    </div>

                                    <div className='md:col-span-2'>
                                        <Label htmlFor='description'>
                                            Description
                                        </Label>
                                        <Textarea
                                            id='description'
                                            value={formData.description}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'description',
                                                    e.target.value
                                                )
                                            }
                                            placeholder='Describe your video content...'
                                            rows={4}
                                            className='mt-1'
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Show Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Show Details</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                                    <div>
                                        <Label htmlFor='showName'>
                                            Show Name
                                        </Label>
                                        <Input
                                            id='showName'
                                            value={formData.showName}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'showName',
                                                    e.target.value
                                                )
                                            }
                                            placeholder='e.g., Noah & Rita Show'
                                            className='mt-1'
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor='seasonNumber'>
                                            Season
                                        </Label>
                                        <Input
                                            id='seasonNumber'
                                            type='number'
                                            value={formData.seasonNumber}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'seasonNumber',
                                                    parseInt(e.target.value) ||
                                                        1
                                                )
                                            }
                                            min='1'
                                            className='mt-1'
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor='episodeNumber'>
                                            Episode
                                        </Label>
                                        <Input
                                            id='episodeNumber'
                                            type='number'
                                            value={formData.episodeNumber}
                                            onChange={(e) =>
                                                handleInputChange(
                                                    'episodeNumber',
                                                    parseInt(e.target.value) ||
                                                        1
                                                )
                                            }
                                            min='1'
                                            className='mt-1'
                                        />
                                    </div>
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
                                            {VIDEO_TOPICS.map((topic) => (
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
                                    Select all topics that apply to your video
                                    content:
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

                        {/* Guests */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Guests (Optional)</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Label htmlFor='guestName'>
                                            Guest Name
                                        </Label>
                                        <Input
                                            id='guestName'
                                            value={newGuest.name}
                                            onChange={(e) =>
                                                setNewGuest((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            placeholder='Guest name'
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor='guestBio'>
                                            Guest Bio
                                        </Label>
                                        <Input
                                            id='guestBio'
                                            value={newGuest.bio}
                                            onChange={(e) =>
                                                setNewGuest((prev) => ({
                                                    ...prev,
                                                    bio: e.target.value,
                                                }))
                                            }
                                            placeholder='Brief bio'
                                        />
                                    </div>
                                </div>
                                <Button
                                    type='button'
                                    onClick={addGuest}
                                    variant='outline'
                                    className='w-full'
                                >
                                    <Plus className='h-4 w-4 mr-2' />
                                    Add Guest
                                </Button>

                                <div className='space-y-2'>
                                    {formData.guestNames.map((guest, index) => (
                                        <div
                                            key={index}
                                            className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                                        >
                                            <div>
                                                <p className='font-medium'>
                                                    {guest}
                                                </p>
                                                <p className='text-sm text-gray-600'>
                                                    {formData.guestBios[index]}
                                                </p>
                                            </div>
                                            <Button
                                                type='button'
                                                variant='ghost'
                                                size='sm'
                                                onClick={() =>
                                                    removeGuest(index)
                                                }
                                            >
                                                <X className='h-4 w-4' />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sponsors */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sponsors (Optional)</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Label htmlFor='sponsorName'>
                                            Sponsor Name
                                        </Label>
                                        <Input
                                            id='sponsorName'
                                            value={newSponsor.name}
                                            onChange={(e) =>
                                                setNewSponsor((prev) => ({
                                                    ...prev,
                                                    name: e.target.value,
                                                }))
                                            }
                                            placeholder='Sponsor name'
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor='sponsorMessage'>
                                            Sponsor Message
                                        </Label>
                                        <Input
                                            id='sponsorMessage'
                                            value={newSponsor.message}
                                            onChange={(e) =>
                                                setNewSponsor((prev) => ({
                                                    ...prev,
                                                    message: e.target.value,
                                                }))
                                            }
                                            placeholder='Sponsor message'
                                        />
                                    </div>
                                </div>
                                <Button
                                    type='button'
                                    onClick={addSponsor}
                                    variant='outline'
                                    className='w-full'
                                >
                                    <Plus className='h-4 w-4 mr-2' />
                                    Add Sponsor
                                </Button>

                                <div className='space-y-2'>
                                    {formData.sponsorNames.map(
                                        (sponsor, index) => (
                                            <div
                                                key={index}
                                                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                                            >
                                                <div>
                                                    <p className='font-medium'>
                                                        {sponsor}
                                                    </p>
                                                    <p className='text-sm text-gray-600'>
                                                        {
                                                            formData
                                                                .sponsorMessages[
                                                                index
                                                            ]
                                                        }
                                                    </p>
                                                </div>
                                                <Button
                                                    type='button'
                                                    variant='ghost'
                                                    size='sm'
                                                    onClick={() =>
                                                        removeSponsor(index)
                                                    }
                                                >
                                                    <X className='h-4 w-4' />
                                                </Button>
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thumbnail Upload */}
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Custom Thumbnail (Optional)
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex items-center space-x-4'>
                                    {thumbnailPreview ? (
                                        <div className='relative'>
                                            <Image
                                                src={thumbnailPreview}
                                                alt='Thumbnail preview'
                                                width={128}
                                                height={72}
                                                className='object-cover rounded-lg'
                                            />
                                            <Button
                                                type='button'
                                                variant='outline'
                                                size='sm'
                                                className='absolute -top-2 -right-2'
                                                onClick={() => {
                                                    setThumbnailFile(null);
                                                    setThumbnailPreview('');
                                                }}
                                            >
                                                <X className='h-3 w-3' />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className='w-32 h-18 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center'>
                                            <Upload className='h-6 w-6 text-gray-400' />
                                        </div>
                                    )}

                                    <div>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            onChange={handleThumbnailChange}
                                            className='hidden'
                                            id='thumbnail-upload'
                                        />
                                        <label htmlFor='thumbnail-upload'>
                                            <Button
                                                type='button'
                                                variant='outline'
                                                asChild
                                            >
                                                <span className='cursor-pointer'>
                                                    <Upload className='h-4 w-4 mr-2' />
                                                    Upload Thumbnail
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
                                                {isEditing
                                                    ? 'Updating...'
                                                    : 'Submitting...'}
                                            </>
                                        ) : (
                                            <>
                                                <Save className='h-4 w-4 mr-2' />
                                                {isEditing
                                                    ? 'Update Video'
                                                    : 'Submit for Approval'}
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
                                    {isEditing
                                        ? 'Your changes will be saved and may require re-approval if the video was previously published.'
                                        : 'Your video will be saved as a draft and submitted to admins for review before publication.'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function VideoUploadPageWrapper() {
    return (
        <Suspense
            fallback={
                <div className='flex items-center justify-center min-h-screen'>
                    <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
                </div>
            }
        >
            <VideoUploadPage />
        </Suspense>
    );
}
