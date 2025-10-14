'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Upload,
    User,
    FileText,
    Link as LinkIcon,
    Loader2,
    CheckCircle,
} from 'lucide-react';

export function CreatorOnboardingForm() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: session } = useSession();
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
        showName: '',
        funnyFact: '',
        linkedinUrl: '',
        instagramUrl: '',
        tiktokUrl: '',
        websiteUrl: '',
    });

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                // 5MB limit
                setError('Image must be less than 5MB');
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Validation
            if (!formData.displayName.trim()) {
                throw new Error('Display name is required');
            }

            if (!formData.bio.trim()) {
                throw new Error('Bio is required');
            }

            // Upload avatar if selected
            let avatarUrl = '';
            if (avatarFile) {
                const formDataUpload = new FormData();
                formDataUpload.append('file', avatarFile);
                formDataUpload.append('type', 'avatar');

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formDataUpload,
                });

                if (!uploadResponse.ok) {
                    throw new Error('Failed to upload avatar');
                }

                const uploadData = await uploadResponse.json();
                avatarUrl = uploadData.url;
            }

            // Update creator profile
            const response = await fetch('/api/creator/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    ...(avatarUrl && { avatarUrl }),
                    profileComplete: true,
                    isActive: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            // Redirect to creator dashboard
            router.push('/creator/dashboard');
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Profile update failed'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className='space-y-6'>
                        <div className='text-center'>
                            <User className='h-12 w-12 mx-auto text-blue-500 mb-4' />
                            <h3 className='text-lg font-semibold mb-2'>
                                Basic Information
                            </h3>
                            <p className='text-gray-600'>
                                Let&apos;s start with your basic creator details
                            </p>
                        </div>

                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='displayName'>
                                    Display Name *
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
                                    required
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
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className='space-y-6'>
                        <div className='text-center'>
                            <Upload className='h-12 w-12 mx-auto text-blue-500 mb-4' />
                            <h3 className='text-lg font-semibold mb-2'>
                                Profile Photo
                            </h3>
                            <p className='text-gray-600'>
                                Add a photo so people can recognize you
                            </p>
                        </div>

                        <div className='space-y-4'>
                            <div className='flex flex-col items-center space-y-4'>
                                {avatarPreview ? (
                                    <div className='relative'>
                                        <Image
                                            src={avatarPreview}
                                            alt='Avatar preview'
                                            width={120}
                                            height={120}
                                            className='rounded-full object-cover'
                                        />
                                        <Button
                                            type='button'
                                            variant='outline'
                                            size='sm'
                                            className='absolute -bottom-2 -right-2'
                                            onClick={() =>
                                                fileInputRef.current?.click()
                                            }
                                        >
                                            Change
                                        </Button>
                                    </div>
                                ) : (
                                    <div
                                        className='w-32 h-32 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors'
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                    >
                                        <div className='text-center'>
                                            <Upload className='h-8 w-8 mx-auto text-gray-400 mb-2' />
                                            <span className='text-sm text-gray-500'>
                                                Click to upload
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='image/*'
                                    onChange={handleAvatarChange}
                                    className='hidden'
                                />

                                <p className='text-xs text-gray-500 text-center'>
                                    Recommended: Square image, at least
                                    400x400px, under 5MB
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className='space-y-6'>
                        <div className='text-center'>
                            <FileText className='h-12 w-12 mx-auto text-blue-500 mb-4' />
                            <h3 className='text-lg font-semibold mb-2'>
                                Tell Your Story
                            </h3>
                            <p className='text-gray-600'>
                                Share what makes you unique
                            </p>
                        </div>

                        <div className='space-y-4'>
                            <div>
                                <Label htmlFor='bio'>Bio *</Label>
                                <Textarea
                                    id='bio'
                                    value={formData.bio}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>
                                    ) =>
                                        handleInputChange('bio', e.target.value)
                                    }
                                    placeholder='Tell people about yourself, your mission, and what you bring to H3 Network...'
                                    rows={4}
                                    required
                                />
                                <p className='text-xs text-gray-500 mt-1'>
                                    {formData.bio.length}/500 characters
                                </p>
                            </div>

                            <div>
                                <Label htmlFor='funnyFact'>
                                    Fun Fact About You
                                </Label>
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
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className='space-y-6'>
                        <div className='text-center'>
                            <LinkIcon className='h-12 w-12 mx-auto text-blue-500 mb-4' />
                            <h3 className='text-lg font-semibold mb-2'>
                                Connect Your Socials
                            </h3>
                            <p className='text-gray-600'>
                                Help people find you elsewhere (optional)
                            </p>
                        </div>

                        <div className='space-y-4'>
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
                                <Label htmlFor='tiktokUrl'>TikTok</Label>
                                <Input
                                    id='tiktokUrl'
                                    value={formData.tiktokUrl}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>
                                    ) =>
                                        handleInputChange(
                                            'tiktokUrl',
                                            e.target.value
                                        )
                                    }
                                    placeholder='https://tiktok.com/@yourhandle'
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
                                <Label htmlFor='websiteUrl'>
                                    Personal Website
                                </Label>
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
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card className='w-full max-w-2xl mx-auto'>
            <CardHeader>
                <CardTitle>Complete Your Creator Profile</CardTitle>
                <CardDescription>
                    Step {currentStep} of {totalSteps} - Help us set up your
                    creator profile
                </CardDescription>
                <div className='w-full bg-gray-200 rounded-full h-2 mt-4'>
                    <div
                        className='bg-blue-500 h-2 rounded-full transition-all duration-300'
                        style={{
                            width: `${(currentStep / totalSteps) * 100}%`,
                        }}
                    />
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    {error && (
                        <Alert variant='destructive' className='mb-6'>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {renderStepContent()}

                    <div className='flex justify-between mt-8'>
                        {currentStep > 1 && (
                            <Button
                                type='button'
                                variant='outline'
                                onClick={prevStep}
                                disabled={isLoading}
                            >
                                Previous
                            </Button>
                        )}

                        <div className='flex gap-2 ml-auto'>
                            {currentStep < totalSteps ? (
                                <Button
                                    type='button'
                                    onClick={nextStep}
                                    disabled={isLoading}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    type='submit'
                                    disabled={isLoading}
                                    className='min-w-32'
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className='mr-2 h-4 w-4' />
                                            Complete Setup
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
