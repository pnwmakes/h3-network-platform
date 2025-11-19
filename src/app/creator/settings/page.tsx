'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ProfileSettings } from '@/components/creator/ProfileSettings';
import { Loader2 } from 'lucide-react';

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

export default function CreatorSettingsPage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<CreatorProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!session?.user?.id) return;

            try {
                const response = await fetch('/api/creator/profile');
                if (response.ok) {
                    const data = await response.json();
                    setProfile(data.creator);
                } else {
                    // Set mock profile for development
                    setProfile({
                        id: session.user.id,
                        displayName: session.user.name || 'Creator',
                        bio: '',
                        avatar: '',
                        avatarUrl: session.user.image || undefined,
                        showName: '',
                        funnyFact: '',
                        youtubeUrl: '',
                        tiktokUrl: '',
                        websiteUrl: '',
                        linkedinUrl: '',
                        instagramUrl: '',
                        isActive: true,
                        profileComplete: false,
                    });
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                // Set fallback profile
                setProfile({
                    id: session?.user?.id || '',
                    displayName: session?.user?.name || 'Creator',
                    bio: '',
                    avatar: '',
                    avatarUrl: session?.user?.image || undefined,
                    showName: '',
                    funnyFact: '',
                    youtubeUrl: '',
                    tiktokUrl: '',
                    websiteUrl: '',
                    linkedinUrl: '',
                    instagramUrl: '',
                    isActive: true,
                    profileComplete: false,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [session?.user?.id, session?.user?.name, session?.user?.image]);

    const handleProfileUpdate = (updatedProfile: CreatorProfile) => {
        setProfile(updatedProfile);
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center py-16'>
                <Loader2 className='h-8 w-8 animate-spin text-blue-500' />
                <span className='ml-2 text-gray-600'>Loading settings...</span>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className='text-center py-16'>
                <p className='text-gray-600'>
                    Unable to load profile settings.
                </p>
            </div>
        );
    }

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='border-b border-gray-200 pb-5'>
                <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                    Creator Settings
                </h1>
                <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                    Manage your creator profile, notification preferences, and
                    platform settings.
                </p>
            </div>

            {/* Profile Settings */}
            <ProfileSettings
                profile={profile}
                onProfileUpdate={handleProfileUpdate}
            />
        </div>
    );
}
