'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsletterSubscriptionProps {
    className?: string;
    variant?: 'card' | 'inline' | 'footer';
}

export function NewsletterSubscription({
    className,
    variant = 'card',
}: NewsletterSubscriptionProps) {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [preferences, setPreferences] = useState({
        specialEvents: true,
        majorUpdates: true,
        monthlyNewsletter: true,
        newContentNotify: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setStatus('error');
            setMessage('Email address is required');
            return;
        }

        setIsLoading(true);
        setStatus('idle');

        try {
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    name: name || undefined,
                    preferences,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setStatus('success');
                setMessage(data.message);
                setEmail('');
                setName('');
            } else {
                setStatus('error');
                setMessage(data.error || 'Failed to subscribe');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferenceChange = (
        key: keyof typeof preferences,
        checked: boolean
    ) => {
        setPreferences((prev) => ({
            ...prev,
            [key]: checked,
        }));
    };

    if (variant === 'footer') {
        return (
            <div className={cn('space-y-4', className)}>
                <div className='flex items-center gap-2'>
                    <Mail className='h-5 w-5 text-blue-600' />
                    <h3 className='font-semibold text-gray-900 dark:text-gray-100'>
                        Stay Updated
                    </h3>
                </div>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Get notified about special events and major H3 Network
                    updates
                </p>

                <form onSubmit={handleSubmit} className='space-y-3'>
                    <div className='flex gap-2'>
                        <Input
                            type='email'
                            placeholder='Enter your email'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='flex-1'
                            disabled={isLoading}
                        />
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='px-6'
                        >
                            {isLoading ? 'Subscribing...' : 'Subscribe'}
                        </Button>
                    </div>

                    {status !== 'idle' && (
                        <div
                            className={cn(
                                'flex items-center gap-2 text-sm',
                                status === 'success'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                            )}
                        >
                            {status === 'success' ? (
                                <CheckCircle2 className='h-4 w-4' />
                            ) : (
                                <AlertCircle className='h-4 w-4' />
                            )}
                            {message}
                        </div>
                    )}
                </form>
            </div>
        );
    }

    if (variant === 'inline') {
        return (
            <div
                className={cn(
                    'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6',
                    className
                )}
            >
                <div className='max-w-md mx-auto text-center'>
                    <Mail className='h-8 w-8 text-blue-600 mx-auto mb-3' />
                    <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
                        Stay in the Loop
                    </h3>
                    <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                        Subscribe for special events, major updates, and our
                        monthly newsletter
                    </p>

                    <form onSubmit={handleSubmit} className='space-y-3'>
                        <Input
                            type='email'
                            placeholder='Enter your email address'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                        />
                        <Button
                            type='submit'
                            disabled={isLoading}
                            className='w-full'
                        >
                            {isLoading
                                ? 'Subscribing...'
                                : 'Subscribe to Newsletter'}
                        </Button>

                        {status !== 'idle' && (
                            <div
                                className={cn(
                                    'flex items-center justify-center gap-2 text-sm',
                                    status === 'success'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                )}
                            >
                                {status === 'success' ? (
                                    <CheckCircle2 className='h-4 w-4' />
                                ) : (
                                    <AlertCircle className='h-4 w-4' />
                                )}
                                {message}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        );
    }

    // Card variant (default)
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                    <Mail className='h-5 w-5 text-blue-600' />
                    Subscribe to Newsletter
                </CardTitle>
                <CardDescription>
                    Stay updated with H3 Network special events, major updates,
                    and our monthly newsletter
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <Label htmlFor='email'>Email Address *</Label>
                            <Input
                                id='email'
                                type='email'
                                placeholder='your@email.com'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor='name'>Name (Optional)</Label>
                            <Input
                                id='name'
                                type='text'
                                placeholder='Your name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    <div>
                        <Label className='text-base font-medium mb-3 block'>
                            Newsletter Preferences
                        </Label>
                        <div className='space-y-3'>
                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='specialEvents'
                                    checked={preferences.specialEvents}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange(
                                            'specialEvents',
                                            !!checked
                                        )
                                    }
                                    disabled={isLoading}
                                />
                                <Label
                                    htmlFor='specialEvents'
                                    className='text-sm font-normal'
                                >
                                    Special Events & Announcements
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='majorUpdates'
                                    checked={preferences.majorUpdates}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange(
                                            'majorUpdates',
                                            !!checked
                                        )
                                    }
                                    disabled={isLoading}
                                />
                                <Label
                                    htmlFor='majorUpdates'
                                    className='text-sm font-normal'
                                >
                                    Major Platform Updates
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='monthlyNewsletter'
                                    checked={preferences.monthlyNewsletter}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange(
                                            'monthlyNewsletter',
                                            !!checked
                                        )
                                    }
                                    disabled={isLoading}
                                />
                                <Label
                                    htmlFor='monthlyNewsletter'
                                    className='text-sm font-normal'
                                >
                                    Monthly Newsletter
                                </Label>
                            </div>

                            <div className='flex items-center space-x-2'>
                                <Checkbox
                                    id='newContentNotify'
                                    checked={preferences.newContentNotify}
                                    onCheckedChange={(checked) =>
                                        handlePreferenceChange(
                                            'newContentNotify',
                                            !!checked
                                        )
                                    }
                                    disabled={isLoading}
                                />
                                <Label
                                    htmlFor='newContentNotify'
                                    className='text-sm font-normal'
                                >
                                    New Content Notifications
                                </Label>
                            </div>
                        </div>
                    </div>

                    <Button
                        type='submit'
                        disabled={isLoading}
                        className='w-full'
                    >
                        {isLoading
                            ? 'Subscribing...'
                            : 'Subscribe to Newsletter'}
                    </Button>

                    {status !== 'idle' && (
                        <div
                            className={cn(
                                'flex items-center gap-2 p-3 rounded-md',
                                status === 'success'
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                            )}
                        >
                            {status === 'success' ? (
                                <CheckCircle2 className='h-4 w-4' />
                            ) : (
                                <AlertCircle className='h-4 w-4' />
                            )}
                            {message}
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}

export default NewsletterSubscription;
