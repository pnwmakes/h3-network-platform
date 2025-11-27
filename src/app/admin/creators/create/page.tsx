'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateCreatorPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        displayName: '',
        bio: '',
        showName: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [createdCreator, setCreatedCreator] = useState<{
        email: string;
        tempPassword: string;
    } | null>(null);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (message) setMessage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/creators/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Creator account created and invitation email sent!',
                });
                setCreatedCreator({
                    email: data.email,
                    tempPassword: data.tempPassword,
                });
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    displayName: '',
                    bio: '',
                    showName: '',
                });
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to create creator account',
                });
            }
        } catch (error) {
            console.error('Creator invitation error:', error);
            setMessage({
                type: 'error',
                text: 'Network error. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Create New Creator
                    </h1>
                    <p className='mt-2 text-sm text-gray-600'>
                        Invite a vetted creator to join the H3 Network platform
                    </p>
                </div>
                <Link href='/admin/users'>
                    <Button variant='outline'>
                        <ArrowLeft className='h-4 w-4 mr-2' />
                        Back to Users
                    </Button>
                </Link>
            </div>

            {/* Success Message */}
            {message && (
                <Alert
                    variant={
                        message.type === 'error' ? 'destructive' : 'default'
                    }
                >
                    {message.type === 'success' && (
                        <CheckCircle className='h-4 w-4' />
                    )}
                    <AlertDescription>{message.text}</AlertDescription>
                </Alert>
            )}

            {/* Created Creator Info */}
            {createdCreator && (
                <Card className='border-green-200 bg-green-50'>
                    <CardHeader>
                        <CardTitle className='text-green-900 flex items-center'>
                            <Mail className='h-5 w-5 mr-2' />
                            Invitation Sent Successfully
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-3'>
                        <div>
                            <p className='text-sm text-green-800'>
                                An invitation email has been sent to:{' '}
                                <strong>{createdCreator.email}</strong>
                            </p>
                        </div>
                        <div className='bg-white p-4 rounded-lg border border-green-200'>
                            <p className='text-xs text-gray-600 mb-2'>
                                Temporary Password (for your records):
                            </p>
                            <code className='text-sm font-mono bg-gray-100 px-2 py-1 rounded'>
                                {createdCreator.tempPassword}
                            </code>
                            <p className='text-xs text-gray-500 mt-2'>
                                The creator will be prompted to set their own
                                password when they first log in.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Creator Form */}
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center'>
                        <UserPlus className='h-5 w-5 mr-2' />
                        Creator Information
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='grid gap-6 md:grid-cols-2'>
                            <div className='space-y-2'>
                                <Label htmlFor='name'>
                                    Full Name{' '}
                                    <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    id='name'
                                    value={formData.name}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'name',
                                            e.target.value
                                        )
                                    }
                                    placeholder='John Doe'
                                    required
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='email'>
                                    Email Address{' '}
                                    <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    id='email'
                                    type='email'
                                    value={formData.email}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'email',
                                            e.target.value
                                        )
                                    }
                                    placeholder='creator@example.com'
                                    required
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='displayName'>
                                    Display Name{' '}
                                    <span className='text-red-500'>*</span>
                                </Label>
                                <Input
                                    id='displayName'
                                    value={formData.displayName}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'displayName',
                                            e.target.value
                                        )
                                    }
                                    placeholder='How they appear on the platform'
                                    required
                                />
                            </div>

                            <div className='space-y-2'>
                                <Label htmlFor='showName'>
                                    Show/Series Name
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
                                    placeholder='e.g., The Recovery Journey'
                                />
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='bio'>Bio</Label>
                            <Textarea
                                id='bio'
                                value={formData.bio}
                                onChange={(e) =>
                                    handleInputChange('bio', e.target.value)
                                }
                                placeholder='Brief description of the creator and their content...'
                                rows={4}
                            />
                            <p className='text-xs text-gray-500'>
                                This will be displayed on their creator profile
                            </p>
                        </div>

                        <div className='flex items-center justify-end space-x-4 pt-4 border-t'>
                            <Button
                                type='button'
                                variant='outline'
                                onClick={() => router.push('/admin/users')}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type='submit' disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                        Creating & Sending Invitation...
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className='h-4 w-4 mr-2' />
                                        Create Creator & Send Invite
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className='bg-blue-50 border-blue-200'>
                <CardContent className='pt-6'>
                    <h3 className='font-semibold text-blue-900 mb-2'>
                        What happens next?
                    </h3>
                    <ul className='space-y-2 text-sm text-blue-800'>
                        <li className='flex items-start'>
                            <span className='mr-2'>1.</span>
                            <span>
                                A creator account will be created with a
                                temporary password
                            </span>
                        </li>
                        <li className='flex items-start'>
                            <span className='mr-2'>2.</span>
                            <span>
                                An email invitation will be sent to the creator
                                with login instructions
                            </span>
                        </li>
                        <li className='flex items-start'>
                            <span className='mr-2'>3.</span>
                            <span>
                                The creator will be prompted to set their own
                                password on first login
                            </span>
                        </li>
                        <li className='flex items-start'>
                            <span className='mr-2'>4.</span>
                            <span>
                                They can then complete their profile and start
                                creating content
                            </span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
