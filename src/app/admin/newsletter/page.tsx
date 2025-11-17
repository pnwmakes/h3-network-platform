'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertCircle,
    CheckCircle2,
    Mail,
    Send,
    Plus,
    Users,
    BarChart3,
    Calendar,
    Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface Newsletter {
    id: string;
    title: string;
    subject: string;
    content: string;
    type: 'SPECIAL_EVENT' | 'MAJOR_UPDATE' | 'MONTHLY_SUMMARY' | 'NEW_CONTENT';
    status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED' | 'CANCELLED';
    scheduledAt: string | null;
    sentAt: string | null;
    recipientCount: number | null;
    openCount: number;
    clickCount: number;
    createdAt: string;
    createdBy: {
        id: string;
        name: string;
        email: string;
    };
    _count: {
        sends: number;
    };
}

interface NewsletterStats {
    subscribers: {
        total: number;
        active: number;
        inactive: number;
        recent: number;
        growthRate: number;
    };
    newsletters: {
        total: number;
        draft: number;
        scheduled: number;
        sent: number;
        failed: number;
    };
    preferences: {
        specialEvents: number;
        majorUpdates: number;
        monthlyNewsletter: number;
        newContentNotify: number;
    };
    recentNewsletters: Newsletter[];
}

export default function AdminNewsletterPage() {
    const { data: session } = useSession();
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [stats, setStats] = useState<NewsletterStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    // Remove unused selectedNewsletter state for now - will be used for detailed view modal later

    // Form state
    type NewsletterType =
        | 'SPECIAL_EVENT'
        | 'MAJOR_UPDATE'
        | 'MONTHLY_SUMMARY'
        | 'NEW_CONTENT';
    const [formData, setFormData] = useState<{
        title: string;
        subject: string;
        content: string;
        type: NewsletterType;
        scheduledAt: string;
    }>({
        title: '',
        subject: '',
        content: '',
        type: 'MAJOR_UPDATE',
        scheduledAt: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formStatus, setFormStatus] = useState<'idle' | 'success' | 'error'>(
        'idle'
    );
    const [formMessage, setFormMessage] = useState('');

    useEffect(() => {
        if (session?.user) {
            loadData();
        }
    }, [session]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [newslettersRes, statsRes] = await Promise.all([
                fetch('/api/admin/newsletter'),
                fetch('/api/admin/newsletter/stats'),
            ]);

            if (newslettersRes.ok) {
                const newsletterData = await newslettersRes.json();
                setNewsletters(newsletterData.newsletters || []);
            }

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats(statsData.stats);
            }
        } catch {
            setError('Failed to load newsletter data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNewsletter = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormStatus('idle');

        try {
            const response = await fetch('/api/admin/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                setFormStatus('success');
                setFormMessage('Newsletter created successfully!');
                setFormData({
                    title: '',
                    subject: '',
                    content: '',
                    type: 'MAJOR_UPDATE',
                    scheduledAt: '',
                });
                setShowCreateForm(false);
                loadData(); // Refresh the list
            } else {
                setFormStatus('error');
                setFormMessage(data.error || 'Failed to create newsletter');
            }
        } catch {
            setFormStatus('error');
            setFormMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendNewsletter = async (newsletterId: string) => {
        if (
            !confirm(
                'Are you sure you want to send this newsletter? This action cannot be undone.'
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/newsletter/${newsletterId}/send`,
                {
                    method: 'POST',
                }
            );

            const data = await response.json();

            if (data.success) {
                alert(`Newsletter sent to ${data.recipientCount} subscribers!`);
                loadData(); // Refresh the list
            } else {
                alert(`Failed to send newsletter: ${data.error}`);
            }
        } catch {
            alert('Network error. Please try again.');
        }
    };

    const getStatusBadge = (status: Newsletter['status']) => {
        const statusConfig = {
            DRAFT: { color: 'bg-gray-100 text-gray-800', text: 'Draft' },
            SCHEDULED: {
                color: 'bg-blue-100 text-blue-800',
                text: 'Scheduled',
            },
            SENDING: {
                color: 'bg-yellow-100 text-yellow-800',
                text: 'Sending',
            },
            SENT: { color: 'bg-green-100 text-green-800', text: 'Sent' },
            FAILED: { color: 'bg-red-100 text-red-800', text: 'Failed' },
            CANCELLED: {
                color: 'bg-gray-100 text-gray-800',
                text: 'Cancelled',
            },
        };

        const config = statusConfig[status];
        return <Badge className={config.color}>{config.text}</Badge>;
    };

    const getTypeBadge = (type: Newsletter['type']) => {
        const typeConfig = {
            SPECIAL_EVENT: {
                color: 'bg-purple-100 text-purple-800',
                text: 'Special Event',
            },
            MAJOR_UPDATE: {
                color: 'bg-blue-100 text-blue-800',
                text: 'Major Update',
            },
            MONTHLY_SUMMARY: {
                color: 'bg-green-100 text-green-800',
                text: 'Monthly Summary',
            },
            NEW_CONTENT: {
                color: 'bg-orange-100 text-orange-800',
                text: 'New Content',
            },
        };

        const config = typeConfig[type];
        return <Badge className={config.color}>{config.text}</Badge>;
    };

    if (!session) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-center'>
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                        Authentication Required
                    </h1>
                    <p className='text-gray-600'>
                        Please sign in to access the admin newsletter dashboard.
                    </p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p className='text-gray-600'>
                        Loading newsletter dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50 py-8'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                {/* Header */}
                <div className='mb-8'>
                    <div className='flex items-center justify-between'>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
                                <Mail className='h-8 w-8 text-blue-600' />
                                Newsletter Management
                            </h1>
                            <p className='text-gray-600 mt-2'>
                                Manage H3 Network newsletter campaigns and
                                subscriber communications
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowCreateForm(true)}
                            className='flex items-center gap-2'
                        >
                            <Plus className='h-4 w-4' />
                            Create Newsletter
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-md'>
                        <div className='flex items-center gap-2 text-red-700'>
                            <AlertCircle className='h-4 w-4' />
                            {error}
                        </div>
                    </div>
                )}

                {/* Statistics */}
                {stats && (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-sm font-medium text-gray-500 flex items-center gap-2'>
                                    <Users className='h-4 w-4' />
                                    Active Subscribers
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold text-gray-900'>
                                    {stats.subscribers.active.toLocaleString()}
                                </div>
                                <p className='text-sm text-gray-600'>
                                    +{stats.subscribers.recent} this month
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-sm font-medium text-gray-500 flex items-center gap-2'>
                                    <Send className='h-4 w-4' />
                                    Newsletters Sent
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold text-gray-900'>
                                    {stats.newsletters.sent}
                                </div>
                                <p className='text-sm text-gray-600'>
                                    {stats.newsletters.draft} drafts pending
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-sm font-medium text-gray-500 flex items-center gap-2'>
                                    <BarChart3 className='h-4 w-4' />
                                    Growth Rate
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold text-gray-900'>
                                    {stats.subscribers.growthRate}%
                                </div>
                                <p className='text-sm text-gray-600'>
                                    Monthly growth
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className='pb-3'>
                                <CardTitle className='text-sm font-medium text-gray-500 flex items-center gap-2'>
                                    <Calendar className='h-4 w-4' />
                                    Scheduled
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className='text-2xl font-bold text-gray-900'>
                                    {stats.newsletters.scheduled}
                                </div>
                                <p className='text-sm text-gray-600'>
                                    Upcoming newsletters
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Create Newsletter Form */}
                {showCreateForm && (
                    <Card className='mb-8'>
                        <CardHeader>
                            <CardTitle>Create New Newsletter</CardTitle>
                            <CardDescription>
                                Compose a new newsletter to send to subscribers
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleCreateNewsletter}
                                className='space-y-4'
                            >
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <Label htmlFor='title'>
                                            Newsletter Title
                                        </Label>
                                        <Input
                                            id='title'
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    title: e.target.value,
                                                }))
                                            }
                                            placeholder='Enter newsletter title'
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor='type'>
                                            Newsletter Type
                                        </Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(
                                                value:
                                                    | 'SPECIAL_EVENT'
                                                    | 'MAJOR_UPDATE'
                                                    | 'MONTHLY_SUMMARY'
                                                    | 'NEW_CONTENT'
                                            ) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    type: value,
                                                }))
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value='SPECIAL_EVENT'>
                                                    Special Event
                                                </SelectItem>
                                                <SelectItem value='MAJOR_UPDATE'>
                                                    Major Update
                                                </SelectItem>
                                                <SelectItem value='MONTHLY_SUMMARY'>
                                                    Monthly Summary
                                                </SelectItem>
                                                <SelectItem value='NEW_CONTENT'>
                                                    New Content
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor='subject'>
                                        Email Subject
                                    </Label>
                                    <Input
                                        id='subject'
                                        value={formData.subject}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                subject: e.target.value,
                                            }))
                                        }
                                        placeholder='Enter email subject line'
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor='content'>
                                        Newsletter Content
                                    </Label>
                                    <Textarea
                                        id='content'
                                        value={formData.content}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                content: e.target.value,
                                            }))
                                        }
                                        placeholder='Write your newsletter content here...'
                                        rows={10}
                                        required
                                    />
                                </div>

                                {formStatus !== 'idle' && (
                                    <div
                                        className={cn(
                                            'flex items-center gap-2 p-3 rounded-md',
                                            formStatus === 'success'
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-700'
                                        )}
                                    >
                                        {formStatus === 'success' ? (
                                            <CheckCircle2 className='h-4 w-4' />
                                        ) : (
                                            <AlertCircle className='h-4 w-4' />
                                        )}
                                        {formMessage}
                                    </div>
                                )}

                                <div className='flex gap-2'>
                                    <Button
                                        type='submit'
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting
                                            ? 'Creating...'
                                            : 'Create Newsletter'}
                                    </Button>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            setFormStatus('idle');
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Newsletters List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Newsletters</CardTitle>
                        <CardDescription>
                            Manage and send newsletter campaigns
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {newsletters.length === 0 ? (
                            <div className='text-center py-8'>
                                <Mail className='h-12 w-12 text-gray-400 mx-auto mb-4' />
                                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                    No newsletters yet
                                </h3>
                                <p className='text-gray-600 mb-4'>
                                    Create your first newsletter to get started
                                </p>
                                <Button onClick={() => setShowCreateForm(true)}>
                                    <Plus className='h-4 w-4 mr-2' />
                                    Create Newsletter
                                </Button>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {newsletters.map((newsletter) => (
                                    <div
                                        key={newsletter.id}
                                        className='border rounded-lg p-4 hover:bg-gray-50 transition-colors'
                                    >
                                        <div className='flex items-center justify-between'>
                                            <div className='flex-1'>
                                                <div className='flex items-center gap-3 mb-2'>
                                                    <h3 className='font-medium text-gray-900'>
                                                        {newsletter.title}
                                                    </h3>
                                                    {getTypeBadge(
                                                        newsletter.type
                                                    )}
                                                    {getStatusBadge(
                                                        newsletter.status
                                                    )}
                                                </div>
                                                <p className='text-sm text-gray-600 mb-2'>
                                                    {newsletter.subject}
                                                </p>
                                                <div className='flex items-center gap-4 text-xs text-gray-500'>
                                                    <span>
                                                        Created{' '}
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                newsletter.createdAt
                                                            ),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                    <span>
                                                        by{' '}
                                                        {
                                                            newsletter.createdBy
                                                                .name
                                                        }
                                                    </span>
                                                    {newsletter.recipientCount && (
                                                        <span>
                                                            {
                                                                newsletter.recipientCount
                                                            }{' '}
                                                            recipients
                                                        </span>
                                                    )}
                                                    {newsletter.sentAt && (
                                                        <span>
                                                            Sent{' '}
                                                            {formatDistanceToNow(
                                                                new Date(
                                                                    newsletter.sentAt
                                                                ),
                                                                {
                                                                    addSuffix:
                                                                        true,
                                                                }
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                {newsletter.status ===
                                                    'DRAFT' && (
                                                    <Button
                                                        size='sm'
                                                        onClick={() =>
                                                            handleSendNewsletter(
                                                                newsletter.id
                                                            )
                                                        }
                                                        className='flex items-center gap-1'
                                                    >
                                                        <Send className='h-3 w-3' />
                                                        Send
                                                    </Button>
                                                )}
                                                <Button
                                                    size='sm'
                                                    variant='outline'
                                                    onClick={() => {
                                                        /* TODO: Add detailed view modal */
                                                    }}
                                                >
                                                    <Eye className='h-3 w-3' />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
