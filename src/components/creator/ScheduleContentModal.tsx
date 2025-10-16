'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Video,
    FileText,
    Calendar,
    Clock,
    Loader2,
    Search,
    X,
} from 'lucide-react';
import Image from 'next/image';

interface AvailableContent {
    id: string;
    title: string;
    description?: string;
    excerpt?: string;
    thumbnailUrl?: string;
    featuredImage?: string;
    status: string;
    createdAt: string;
    tags: string[];
    topic?: string;
    showName?: string;
    readTime?: number;
}

interface ScheduleContentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSchedule: (
        contentId: string,
        contentType: 'VIDEO' | 'BLOG',
        publishAt: Date,
        notes?: string
    ) => Promise<void>;
    selectedDate?: Date;
}

export function ScheduleContentModal({
    isOpen,
    onClose,
    onSchedule,
    selectedDate,
}: ScheduleContentModalProps) {
    const [availableVideos, setAvailableVideos] = useState<AvailableContent[]>(
        []
    );
    const [availableBlogs, setAvailableBlogs] = useState<AvailableContent[]>(
        []
    );
    const [loading, setLoading] = useState(false);
    const [scheduling, setScheduling] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [selectedContent, setSelectedContent] = useState<{
        id: string;
        type: 'VIDEO' | 'BLOG';
        title: string;
    } | null>(null);
    const [publishDate, setPublishDate] = useState('');
    const [publishTime, setPublishTime] = useState('09:00');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchAvailableContent();

            // Set default date and time if selectedDate is provided
            if (selectedDate) {
                const dateStr = selectedDate.toISOString().split('T')[0];
                setPublishDate(dateStr);
            }
        }
    }, [isOpen, selectedDate]);

    const fetchAvailableContent = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/creator/schedule/available');
            const data = await response.json();

            if (data.success) {
                setAvailableVideos(data.availableContent.videos);
                setAvailableBlogs(data.availableContent.blogs);
            }
        } catch (error) {
            console.error('Error fetching available content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async () => {
        if (!selectedContent || !publishDate || !publishTime) {
            return;
        }

        setScheduling(true);
        try {
            const publishDateTime = new Date(`${publishDate}T${publishTime}`);
            await onSchedule(
                selectedContent.id,
                selectedContent.type,
                publishDateTime,
                notes
            );

            // Reset form
            setSelectedContent(null);
            setPublishDate('');
            setPublishTime('09:00');
            setNotes('');
            onClose();
        } catch (error) {
            console.error('Error scheduling content:', error);
        } finally {
            setScheduling(false);
        }
    };

    const filterContent = (content: AvailableContent[]) => {
        if (!searchTerm) return content;
        return content.filter(
            (item) =>
                item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.tags.some((tag) =>
                    tag.toLowerCase().includes(searchTerm.toLowerCase())
                )
        );
    };

    const ContentCard = ({
        content,
        type,
    }: {
        content: AvailableContent;
        type: 'VIDEO' | 'BLOG';
    }) => (
        <div
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedContent?.id === content.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() =>
                setSelectedContent({
                    id: content.id,
                    type,
                    title: content.title,
                })
            }
        >
            <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0'>
                    {type === 'VIDEO' ? (
                        <div className='w-16 h-12 bg-gray-200 rounded overflow-hidden relative'>
                            {content.thumbnailUrl && (
                                <Image
                                    src={content.thumbnailUrl}
                                    alt={content.title}
                                    fill
                                    className='object-cover'
                                />
                            )}
                        </div>
                    ) : (
                        <div className='w-16 h-12 bg-green-100 rounded flex items-center justify-center'>
                            <FileText className='h-6 w-6 text-green-600' />
                        </div>
                    )}
                </div>

                <div className='flex-1 min-w-0'>
                    <h4 className='font-medium text-sm line-clamp-2 mb-1'>
                        {content.title}
                    </h4>

                    {(content.description || content.excerpt) && (
                        <p className='text-xs text-gray-600 line-clamp-2 mb-2'>
                            {content.description || content.excerpt}
                        </p>
                    )}

                    <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-2'>
                            <Badge variant='outline' className='text-xs'>
                                {content.status}
                            </Badge>
                            {content.showName && (
                                <span className='text-xs text-gray-500'>
                                    {content.showName}
                                </span>
                            )}
                            {content.readTime && (
                                <span className='text-xs text-gray-500'>
                                    {content.readTime} min read
                                </span>
                            )}
                        </div>

                        {selectedContent?.id === content.id && (
                            <div className='w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                                <div className='w-2 h-2 bg-white rounded-full'></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
                {/* Header */}
                <div className='flex items-center justify-between p-6 border-b'>
                    <h2 className='text-lg font-semibold flex items-center'>
                        <Calendar className='h-5 w-5 mr-2' />
                        Schedule Content
                    </h2>
                    <Button variant='ghost' size='sm' onClick={onClose}>
                        <X className='h-4 w-4' />
                    </Button>
                </div>

                {/* Content */}
                <div className='p-6'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                        {/* Content Selection */}
                        <div className='space-y-4'>
                            <div>
                                <Label className='text-base font-medium'>
                                    Select Content to Schedule
                                </Label>
                                <p className='text-sm text-gray-600'>
                                    Choose from your available drafts and
                                    published content
                                </p>
                            </div>

                            {/* Search */}
                            <div className='relative'>
                                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                                <Input
                                    placeholder='Search content...'
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className='pl-10'
                                />
                            </div>

                            {loading ? (
                                <div className='flex items-center justify-center py-8'>
                                    <Loader2 className='h-6 w-6 animate-spin' />
                                </div>
                            ) : (
                                <Tabs defaultValue='videos' className='w-full'>
                                    <TabsList className='grid w-full grid-cols-2'>
                                        <TabsTrigger value='videos'>
                                            Videos (
                                            {
                                                filterContent(availableVideos)
                                                    .length
                                            }
                                            )
                                        </TabsTrigger>
                                        <TabsTrigger value='blogs'>
                                            Blogs (
                                            {
                                                filterContent(availableBlogs)
                                                    .length
                                            }
                                            )
                                        </TabsTrigger>
                                    </TabsList>

                                    <TabsContent
                                        value='videos'
                                        className='mt-4'
                                    >
                                        <div className='space-y-3 max-h-80 overflow-y-auto'>
                                            {filterContent(availableVideos)
                                                .length > 0 ? (
                                                filterContent(
                                                    availableVideos
                                                ).map((video) => (
                                                    <ContentCard
                                                        key={video.id}
                                                        content={video}
                                                        type='VIDEO'
                                                    />
                                                ))
                                            ) : (
                                                <div className='text-center py-8 text-gray-500'>
                                                    <Video className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                                                    <p>
                                                        No videos available for
                                                        scheduling
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value='blogs' className='mt-4'>
                                        <div className='space-y-3 max-h-80 overflow-y-auto'>
                                            {filterContent(availableBlogs)
                                                .length > 0 ? (
                                                filterContent(
                                                    availableBlogs
                                                ).map((blog) => (
                                                    <ContentCard
                                                        key={blog.id}
                                                        content={blog}
                                                        type='BLOG'
                                                    />
                                                ))
                                            ) : (
                                                <div className='text-center py-8 text-gray-500'>
                                                    <FileText className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                                                    <p>
                                                        No blogs available for
                                                        scheduling
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            )}
                        </div>

                        {/* Scheduling Options */}
                        <div className='space-y-4'>
                            <div>
                                <Label className='text-base font-medium'>
                                    Schedule Details
                                </Label>
                                <p className='text-sm text-gray-600'>
                                    Set when this content should be published
                                </p>
                            </div>

                            {selectedContent && (
                                <Card className='bg-blue-50 border-blue-200'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center space-x-2'>
                                            {selectedContent.type ===
                                            'VIDEO' ? (
                                                <Video className='h-4 w-4 text-blue-600' />
                                            ) : (
                                                <FileText className='h-4 w-4 text-blue-600' />
                                            )}
                                            <span className='text-sm font-medium text-blue-900'>
                                                Selected:{' '}
                                                {selectedContent.title}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <Label htmlFor='publishDate'>
                                        Publish Date
                                    </Label>
                                    <Input
                                        id='publishDate'
                                        type='date'
                                        value={publishDate}
                                        onChange={(e) =>
                                            setPublishDate(e.target.value)
                                        }
                                        min={
                                            new Date()
                                                .toISOString()
                                                .split('T')[0]
                                        }
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='publishTime'>
                                        Publish Time
                                    </Label>
                                    <Input
                                        id='publishTime'
                                        type='time'
                                        value={publishTime}
                                        onChange={(e) =>
                                            setPublishTime(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor='notes'>Notes (Optional)</Label>
                                <Textarea
                                    id='notes'
                                    placeholder='Add any scheduling notes or reminders...'
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    rows={3}
                                />
                            </div>

                            {selectedContent && publishDate && (
                                <Card className='bg-green-50 border-green-200'>
                                    <CardContent className='p-4'>
                                        <div className='flex items-center space-x-2 mb-2'>
                                            <Clock className='h-4 w-4 text-green-600' />
                                            <span className='text-sm font-medium text-green-900'>
                                                Scheduled for:
                                            </span>
                                        </div>
                                        <p className='text-sm text-green-800'>
                                            {new Date(
                                                `${publishDate}T${publishTime}`
                                            ).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: 'numeric',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className='flex items-center justify-end space-x-3 p-6 border-t bg-gray-50'>
                    <Button variant='outline' onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSchedule}
                        disabled={
                            !selectedContent || !publishDate || scheduling
                        }
                    >
                        {scheduling ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Scheduling...
                            </>
                        ) : (
                            <>
                                <Calendar className='mr-2 h-4 w-4' />
                                Schedule Content
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
