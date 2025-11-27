'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    User,
    Save,
    Upload,
    Loader2,
    CheckCircle,
    ExternalLink,
} from 'lucide-react';
import Image from 'next/image';

interface CreatorProfile {
    id: string;
    displayName: string;
    bio: string;
    avatar: string;
    avatarUrl?: string;
    showName?: string;
    funnyFact?: string;
    youtubeUrl?: string;
    tiktokUrl?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    isActive: boolean;
    profileComplete: boolean;
}

interface ProfileSettingsProps {
    profile: CreatorProfile;
    onProfileUpdate: (profile: CreatorProfile) => void;
}

export function ProfileSettings({
    profile,
    onProfileUpdate,
}: ProfileSettingsProps) {
    const [formData, setFormData] = useState({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        showName: profile.showName || '',
        funnyFact: profile.funnyFact || '',
        linkedinUrl: profile.linkedinUrl || '',
        instagramUrl: profile.instagramUrl || '',
        tiktokUrl: profile.tiktokUrl || '',
        websiteUrl: profile.websiteUrl || '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
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
            const response = await fetch('/api/creator/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Profile updated successfully!',
                });
                onProfileUpdate(data.creator);
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to update profile',
                });
            }
        } catch {
            setMessage({
                type: 'error',
                text: 'Network error. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage({
                type: 'error',
                text: 'Please select an image file',
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage({
                type: 'error',
                text: 'Image must be under 5MB',
            });
            return;
        }

        setIsUploadingImage(true);
        setMessage(null);

        try {
            // For now, convert to base64 and store directly
            // In production, you'd upload to a file storage service
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64String = reader.result as string;

                try {
                    const response = await fetch('/api/creator/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...formData,
                            avatarUrl: base64String,
                        }),
                    });

                    const data = await response.json();

                    if (response.ok) {
                        setMessage({
                            type: 'success',
                            text: 'Profile picture updated successfully!',
                        });
                        onProfileUpdate(data.creator);
                    } else {
                        setMessage({
                            type: 'error',
                            text: data.error || 'Failed to upload image',
                        });
                    }
                } catch {
                    setMessage({
                        type: 'error',
                        text: 'Failed to upload image. Please try again.',
                    });
                } finally {
                    setIsUploadingImage(false);
                }
            };

            reader.onerror = () => {
                setMessage({
                    type: 'error',
                    text: 'Failed to read image file',
                });
                setIsUploadingImage(false);
            };

            reader.readAsDataURL(file);
        } catch {
            setMessage({
                type: 'error',
                text: 'Failed to process image',
            });
            setIsUploadingImage(false);
        }
    };

    return (
        <div className='space-y-6'>
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

            <div className='grid gap-6 md:grid-cols-2'>
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'>
                            <User className='h-5 w-5 mr-2' />
                            Profile Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div>
                                <Label htmlFor='displayName'>
                                    Display Name
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
                                    placeholder="How you'd like to be known"
                                />
                            </div>

                            <div>
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
                                    placeholder='e.g., Noah & Rita Show'
                                />
                            </div>

                            <div>
                                <Label htmlFor='bio'>Bio</Label>
                                <Textarea
                                    id='bio'
                                    value={formData.bio}
                                    onChange={(e) =>
                                        handleInputChange('bio', e.target.value)
                                    }
                                    placeholder='Tell people about yourself and your mission...'
                                    rows={4}
                                />
                                <p className='text-xs text-gray-500 mt-1'>
                                    {formData.bio.length}/500 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor='funnyFact'>Fun Fact</Label>
                                <Input
                                    id='funnyFact'
                                    value={formData.funnyFact}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'funnyFact',
                                            e.target.value
                                        )
                                    }
                                    placeholder='Something fun or surprising about you'
                                />
                            </div>

                            <Button
                                type='submit'
                                disabled={isLoading}
                                className='w-full'
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className='mr-2 h-4 w-4' />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Social Links */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'>
                            <ExternalLink className='h-5 w-5 mr-2' />
                            Social Links
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div>
                            <Label htmlFor='linkedinUrl'>LinkedIn</Label>
                            <Input
                                id='linkedinUrl'
                                value={formData.linkedinUrl}
                                onChange={(e) =>
                                    handleInputChange(
                                        'linkedinUrl',
                                        e.target.value
                                    )
                                }
                                placeholder='https://linkedin.com/in/yourprofile'
                            />
                        </div>

                        <div>
                            <Label htmlFor='instagramUrl'>Instagram</Label>
                            <Input
                                id='instagramUrl'
                                value={formData.instagramUrl}
                                onChange={(e) =>
                                    handleInputChange(
                                        'instagramUrl',
                                        e.target.value
                                    )
                                }
                                placeholder='https://instagram.com/yourhandle'
                            />
                        </div>

                        <div>
                            <Label htmlFor='tiktokUrl'>TikTok</Label>
                            <Input
                                id='tiktokUrl'
                                value={formData.tiktokUrl}
                                onChange={(e) =>
                                    handleInputChange(
                                        'tiktokUrl',
                                        e.target.value
                                    )
                                }
                                placeholder='https://tiktok.com/@yourhandle'
                            />
                        </div>

                        <div>
                            <Label htmlFor='websiteUrl'>Personal Website</Label>
                            <Input
                                id='websiteUrl'
                                value={formData.websiteUrl}
                                onChange={(e) =>
                                    handleInputChange(
                                        'websiteUrl',
                                        e.target.value
                                    )
                                }
                                placeholder='https://yourwebsite.com'
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Picture */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'>
                            <Upload className='h-5 w-5 mr-2' />
                            Profile Picture
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='flex flex-col items-center space-y-4'>
                            {profile.avatarUrl ? (
                                <Image
                                    src={profile.avatarUrl}
                                    alt='Profile picture'
                                    width={120}
                                    height={120}
                                    className='rounded-full object-cover'
                                />
                            ) : (
                                <div className='w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold'>
                                    {profile.displayName
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}

                            <input
                                type='file'
                                id='avatar-upload'
                                accept='image/*'
                                className='hidden'
                                onChange={handleImageUpload}
                                disabled={isUploadingImage}
                            />
                            <Button
                                variant='outline'
                                onClick={() =>
                                    document.getElementById('avatar-upload')?.click()
                                }
                                disabled={isUploadingImage}
                                type='button'
                            >
                                {isUploadingImage ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className='h-4 w-4 mr-2' />
                                        Change Picture
                                    </>
                                )}
                            </Button>

                            <p className='text-xs text-gray-500 text-center'>
                                Recommended: Square image, at least 400x400px,
                                under 5MB
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Status</CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium'>
                                Profile Complete
                            </span>
                            <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                    profile.profileComplete
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                {profile.profileComplete
                                    ? 'Complete'
                                    : 'Incomplete'}
                            </span>
                        </div>

                        <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium'>
                                Creator Status
                            </span>
                            <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                    profile.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                                {profile.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>

                        {!profile.isActive && (
                            <div className='p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                                <p className='text-sm text-yellow-800'>
                                    Your creator account is inactive. Complete
                                    your profile to start creating content.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
