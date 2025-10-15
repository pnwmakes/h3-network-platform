'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
    FileCheck,
    FileX,
    Clock,
    Video,
    FileText,
    ExternalLink,
    User,
    Calendar,
    MessageSquare,
    ChevronLeft,
    ChevronDown,
    ChevronUp,
    Eye,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface PendingContent {
    id: string;
    type: 'VIDEO' | 'BLOG';
    title: string;
    description: string;
    status: string;
    createdAt: string;
    youtubeUrl?: string;
    youtubeId?: string;
    content?: string;
    creator: {
        displayName: string;
        user: {
            name: string;
            email: string;
        };
    };
    // Template fields
    showName?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    contentTopics: string[];
    guestNames: string[];
    guestBios: string[];
    sponsorNames: string[];
    sponsorMessages: string[];
}

export default function ContentModerationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [pendingContent, setPendingContent] = useState<PendingContent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<{ [key: string]: string }>({});

    const fetchPendingContent = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/admin/content/pending');
            const data = await response.json();

            if (response.ok) {
                setPendingContent(data.content);
            } else {
                throw new Error(
                    data.error || 'Failed to fetch pending content'
                );
            }
        } catch (error) {
            console.error('Error fetching pending content:', error);
            setError('Failed to fetch pending content');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user) {
            router.push('/auth/signin');
            return;
        }

        if (session.user.role !== 'SUPER_ADMIN') {
            router.push('/');
            return;
        }

        fetchPendingContent();
    }, [session, status, router, fetchPendingContent]);

    const handleApproval = async (
        contentId: string,
        action: 'approve' | 'reject'
    ) => {
        try {
            setProcessingId(contentId);
            const response = await fetch(
                `/api/admin/content/${contentId}/${action}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        feedback: feedback[contentId] || '',
                    }),
                }
            );

            const result = await response.json();
            if (result.success) {
                // Remove the processed content from the list
                setPendingContent((prev) =>
                    prev.filter((item) => item.id !== contentId)
                );
                // Clear feedback
                setFeedback((prev) => {
                    const newFeedback = { ...prev };
                    delete newFeedback[contentId];
                    return newFeedback;
                });
            } else {
                alert(`Failed to ${action} content: ` + result.error);
            }
        } catch (error) {
            console.error(`Content ${action} error:`, error);
            alert(`Failed to ${action} content`);
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getYouTubeEmbedUrl = (url: string) => {
        if (!url) return '';
        const videoId = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
        );
        return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : '';
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Card className='w-96'>
                    <CardContent className='p-6 text-center'>
                        <h2 className='text-xl font-semibold mb-4 text-red-600'>
                            Error
                        </h2>
                        <p className='text-gray-600 mb-4'>{error}</p>
                        <Button onClick={() => fetchPendingContent()}>
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const videos = pendingContent.filter((item) => item.type === 'VIDEO');
    const blogs = pendingContent.filter((item) => item.type === 'BLOG');

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white shadow-sm border-b'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center py-4'>
                        <div className='flex items-center space-x-4'>
                            <Link
                                href='/admin/dashboard'
                                className='text-gray-500 hover:text-gray-700'
                            >
                                <ChevronLeft className='h-5 w-5' />
                            </Link>
                            <Clock className='h-8 w-8 text-orange-600' />
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900'>
                                    Content Moderation
                                </h1>
                                <p className='text-sm text-gray-500'>
                                    Review and approve creator content
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant='outline'
                            className='bg-orange-50 text-orange-700 border-orange-200'
                        >
                            {pendingContent.length} Pending Review
                        </Badge>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {pendingContent.length === 0 ? (
                    <Card>
                        <CardContent className='p-12 text-center'>
                            <FileCheck className='h-16 w-16 text-green-500 mx-auto mb-4' />
                            <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                                All Caught Up!
                            </h2>
                            <p className='text-gray-600'>
                                No content pending approval at this time.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs defaultValue='all' className='space-y-6'>
                        <TabsList>
                            <TabsTrigger value='all'>
                                All ({pendingContent.length})
                            </TabsTrigger>
                            <TabsTrigger value='videos'>
                                Videos ({videos.length})
                            </TabsTrigger>
                            <TabsTrigger value='blogs'>
                                Blogs ({blogs.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value='all' className='space-y-6'>
                            {pendingContent.map((item) => (
                                <ContentCard
                                    key={item.id}
                                    item={item}
                                    onApprove={(id) =>
                                        handleApproval(id, 'approve')
                                    }
                                    onReject={(id) =>
                                        handleApproval(id, 'reject')
                                    }
                                    processing={processingId === item.id}
                                    feedback={feedback[item.id] || ''}
                                    onFeedbackChange={(value) =>
                                        setFeedback((prev) => ({
                                            ...prev,
                                            [item.id]: value,
                                        }))
                                    }
                                    formatDate={formatDate}
                                    getYouTubeEmbedUrl={getYouTubeEmbedUrl}
                                />
                            ))}
                        </TabsContent>

                        <TabsContent value='videos' className='space-y-6'>
                            {videos.map((item) => (
                                <ContentCard
                                    key={item.id}
                                    item={item}
                                    onApprove={(id) =>
                                        handleApproval(id, 'approve')
                                    }
                                    onReject={(id) =>
                                        handleApproval(id, 'reject')
                                    }
                                    processing={processingId === item.id}
                                    feedback={feedback[item.id] || ''}
                                    onFeedbackChange={(value) =>
                                        setFeedback((prev) => ({
                                            ...prev,
                                            [item.id]: value,
                                        }))
                                    }
                                    formatDate={formatDate}
                                    getYouTubeEmbedUrl={getYouTubeEmbedUrl}
                                />
                            ))}
                        </TabsContent>

                        <TabsContent value='blogs' className='space-y-6'>
                            {blogs.map((item) => (
                                <ContentCard
                                    key={item.id}
                                    item={item}
                                    onApprove={(id) =>
                                        handleApproval(id, 'approve')
                                    }
                                    onReject={(id) =>
                                        handleApproval(id, 'reject')
                                    }
                                    processing={processingId === item.id}
                                    feedback={feedback[item.id] || ''}
                                    onFeedbackChange={(value) =>
                                        setFeedback((prev) => ({
                                            ...prev,
                                            [item.id]: value,
                                        }))
                                    }
                                    formatDate={formatDate}
                                    getYouTubeEmbedUrl={getYouTubeEmbedUrl}
                                />
                            ))}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}

interface ContentCardProps {
    item: PendingContent;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    processing: boolean;
    feedback: string;
    onFeedbackChange: (value: string) => void;
    formatDate: (date: string) => string;
    getYouTubeEmbedUrl: (url: string) => string;
}

function ContentCard({
    item,
    onApprove,
    onReject,
    processing,
    feedback,
    onFeedbackChange,
    formatDate,
    getYouTubeEmbedUrl,
}: ContentCardProps) {
    const [showFullContent, setShowFullContent] = useState(false);

    return (
        <Card className='overflow-hidden'>
            <CardHeader>
                <div className='flex items-start justify-between'>
                    <div className='flex items-center space-x-3'>
                        {item.type === 'VIDEO' ? (
                            <Video className='h-6 w-6 text-blue-600' />
                        ) : (
                            <FileText className='h-6 w-6 text-green-600' />
                        )}
                        <div>
                            <CardTitle className='text-lg'>
                                {item.title}
                            </CardTitle>
                            <div className='flex items-center space-x-4 text-sm text-gray-500 mt-1'>
                                <span className='flex items-center'>
                                    <User className='h-4 w-4 mr-1' />
                                    {item.creator.displayName}
                                </span>
                                <span className='flex items-center'>
                                    <Calendar className='h-4 w-4 mr-1' />
                                    {formatDate(item.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Badge
                        variant='secondary'
                        className='bg-yellow-100 text-yellow-800'
                    >
                        {item.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className='space-y-4'>
                    {/* Content Preview */}
                    {item.type === 'VIDEO' && item.youtubeUrl && (
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <h4 className='font-medium'>YouTube Video</h4>
                                <Link
                                    href={item.youtubeUrl}
                                    target='_blank'
                                    className='flex items-center text-blue-600 hover:text-blue-800 text-sm'
                                >
                                    <ExternalLink className='h-4 w-4 mr-1' />
                                    View on YouTube
                                </Link>
                            </div>
                            <div className='aspect-video bg-gray-100 rounded-lg overflow-hidden'>
                                <iframe
                                    src={getYouTubeEmbedUrl(item.youtubeUrl)}
                                    className='w-full h-full'
                                    frameBorder='0'
                                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                                    allowFullScreen
                                />
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <h4 className='font-medium mb-2'>Description</h4>
                        <p className='text-gray-700 bg-gray-50 p-3 rounded-lg'>
                            {item.description || 'No description provided'}
                        </p>
                    </div>

                    {/* Full Blog Content - Only for blogs */}
                    {item.type === 'BLOG' && item.content && (
                        <div>
                            <div className='flex items-center justify-between mb-2'>
                                <h4 className='font-medium'>Blog Content</h4>
                                <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                        setShowFullContent(!showFullContent)
                                    }
                                    className='flex items-center gap-2'
                                >
                                    <Eye className='h-4 w-4' />
                                    {showFullContent
                                        ? 'Hide Content'
                                        : 'Read Full Content'}
                                    {showFullContent ? (
                                        <ChevronUp className='h-4 w-4' />
                                    ) : (
                                        <ChevronDown className='h-4 w-4' />
                                    )}
                                </Button>
                            </div>

                            {showFullContent && (
                                <div className='max-h-96 overflow-y-auto border rounded-lg p-4 bg-white'>
                                    <div className='prose prose-sm max-w-none'>
                                        {item.content
                                            .split('\n')
                                            .map((paragraph, index) =>
                                                paragraph.trim() ? (
                                                    <p
                                                        key={index}
                                                        className='mb-3 text-gray-700'
                                                    >
                                                        {paragraph}
                                                    </p>
                                                ) : (
                                                    <br key={index} />
                                                )
                                            )}
                                    </div>
                                </div>
                            )}

                            {!showFullContent && (
                                <div className='bg-gray-50 p-3 rounded-lg border'>
                                    <p className='text-gray-600 text-sm italic'>
                                        Click &quot;Read Full Content&quot; above to
                                        review the complete blog post before
                                        approval.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Content Details */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {/* Show Info */}
                        {item.showName && (
                            <div>
                                <h4 className='font-medium mb-1'>Show</h4>
                                <p className='text-sm text-gray-600'>
                                    {item.showName}
                                    {item.type === 'VIDEO' &&
                                        item.seasonNumber &&
                                        item.episodeNumber &&
                                        ` - S${item.seasonNumber}E${item.episodeNumber}`}
                                </p>
                            </div>
                        )}

                        {/* Topics */}
                        {item.contentTopics.length > 0 && (
                            <div>
                                <h4 className='font-medium mb-1'>Topics</h4>
                                <div className='flex flex-wrap gap-1'>
                                    {item.contentTopics.map((topic, index) => (
                                        <Badge
                                            key={index}
                                            variant='outline'
                                            className='text-xs'
                                        >
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Guests */}
                        {item.guestNames.length > 0 && (
                            <div>
                                <h4 className='font-medium mb-1'>Guests</h4>
                                <div className='space-y-1'>
                                    {item.guestNames.map((guest, index) => (
                                        <div key={index} className='text-sm'>
                                            <span className='font-medium'>
                                                {guest}
                                            </span>
                                            {item.guestBios[index] && (
                                                <p className='text-gray-600 text-xs'>
                                                    {item.guestBios[index]}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sponsors */}
                        {item.sponsorNames.length > 0 && (
                            <div>
                                <h4 className='font-medium mb-1'>Sponsors</h4>
                                <div className='space-y-1'>
                                    {item.sponsorNames.map((sponsor, index) => (
                                        <div key={index} className='text-sm'>
                                            <span className='font-medium'>
                                                {sponsor}
                                            </span>
                                            {item.sponsorMessages[index] && (
                                                <p className='text-gray-600 text-xs'>
                                                    {
                                                        item.sponsorMessages[
                                                            index
                                                        ]
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback Section */}
                    <div className='border-t pt-4'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            <MessageSquare className='h-4 w-4 inline mr-1' />
                            Feedback (optional)
                        </label>
                        <Textarea
                            value={feedback}
                            onChange={(e) => onFeedbackChange(e.target.value)}
                            placeholder='Add feedback for the creator...'
                            rows={2}
                            className='mb-4'
                        />

                        {/* Action Buttons */}
                        <div className='flex space-x-3'>
                            <Button
                                onClick={() => onApprove(item.id)}
                                disabled={processing}
                                className='flex-1 bg-green-600 hover:bg-green-700'
                            >
                                <FileCheck className='h-4 w-4 mr-2' />
                                {processing
                                    ? 'Processing...'
                                    : 'Approve & Publish'}
                            </Button>
                            <Button
                                onClick={() => onReject(item.id)}
                                disabled={processing}
                                variant='destructive'
                                className='flex-1'
                            >
                                <FileX className='h-4 w-4 mr-2' />
                                {processing ? 'Processing...' : 'Reject'}
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
