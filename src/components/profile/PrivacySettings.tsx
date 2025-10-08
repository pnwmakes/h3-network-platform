'use client';

import { useState, useEffect } from 'react';
import { Shield, Eye, Database, Bell, Save } from 'lucide-react';

interface PrivacySettingsProps {
    userId: string;
}

interface PrivacySettings {
    profileVisibility: 'public' | 'private';
    showWatchHistory: boolean;
    showProgress: boolean;
    allowRecommendations: boolean;
    emailNotifications: boolean;
    dataProcessing: boolean;
}

export default function PrivacySettings({ userId }: PrivacySettingsProps) {
    const [settings, setSettings] = useState<PrivacySettings>({
        profileVisibility: 'private',
        showWatchHistory: false,
        showProgress: true,
        allowRecommendations: true,
        emailNotifications: true,
        dataProcessing: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`/api/users/${userId}/privacy`);
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Failed to fetch privacy settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, [userId]);

    const handleSettingChange = (
        key: keyof PrivacySettings,
        value: boolean | string
    ) => {
        setSettings((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/users/${userId}/privacy`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Privacy settings updated successfully!',
                });
            } else {
                const data = await response.json();
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to update settings',
                });
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: 'Failed to update privacy settings',
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center py-8'>
                <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <div>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>
                    Privacy Settings
                </h3>

                {/* Message Display */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${
                            message.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-800'
                                : 'bg-red-50 border border-red-200 text-red-800'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Profile Visibility */}
                <div className='bg-gray-50 rounded-lg p-6 mb-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <Eye className='h-5 w-5 mr-2 text-gray-600' />
                        Profile Visibility
                    </h4>

                    <div className='space-y-3'>
                        <label className='flex items-start space-x-3'>
                            <input
                                type='radio'
                                value='public'
                                checked={
                                    settings.profileVisibility === 'public'
                                }
                                onChange={(e) =>
                                    handleSettingChange(
                                        'profileVisibility',
                                        e.target.value
                                    )
                                }
                                className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                            />
                            <div>
                                <div className='font-medium text-gray-900'>
                                    Public Profile
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Your profile and activity will be visible to
                                    other community members
                                </div>
                            </div>
                        </label>

                        <label className='flex items-start space-x-3'>
                            <input
                                type='radio'
                                value='private'
                                checked={
                                    settings.profileVisibility === 'private'
                                }
                                onChange={(e) =>
                                    handleSettingChange(
                                        'profileVisibility',
                                        e.target.value
                                    )
                                }
                                className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300'
                            />
                            <div>
                                <div className='font-medium text-gray-900'>
                                    Private Profile
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Keep your profile and activity private
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Data Usage */}
                <div className='bg-gray-50 rounded-lg p-6 mb-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <Database className='h-5 w-5 mr-2 text-gray-600' />
                        Data Usage & Tracking
                    </h4>

                    <div className='space-y-4'>
                        <label className='flex items-start justify-between'>
                            <div className='flex-1 mr-4'>
                                <div className='font-medium text-gray-900'>
                                    Show Watch History
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Allow your viewing history to be visible in
                                    your profile
                                </div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.showWatchHistory}
                                onChange={(e) =>
                                    handleSettingChange(
                                        'showWatchHistory',
                                        e.target.checked
                                    )
                                }
                                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                            />
                        </label>

                        <label className='flex items-start justify-between'>
                            <div className='flex-1 mr-4'>
                                <div className='font-medium text-gray-900'>
                                    Show Progress
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Display your video completion progress and
                                    statistics
                                </div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.showProgress}
                                onChange={(e) =>
                                    handleSettingChange(
                                        'showProgress',
                                        e.target.checked
                                    )
                                }
                                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                            />
                        </label>

                        <label className='flex items-start justify-between'>
                            <div className='flex-1 mr-4'>
                                <div className='font-medium text-gray-900'>
                                    Personalized Recommendations
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Use your viewing history to provide
                                    personalized content recommendations
                                </div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.allowRecommendations}
                                onChange={(e) =>
                                    handleSettingChange(
                                        'allowRecommendations',
                                        e.target.checked
                                    )
                                }
                                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                            />
                        </label>
                    </div>
                </div>

                {/* Notifications */}
                <div className='bg-gray-50 rounded-lg p-6 mb-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <Bell className='h-5 w-5 mr-2 text-gray-600' />
                        Communication Preferences
                    </h4>

                    <div className='space-y-4'>
                        <label className='flex items-start justify-between'>
                            <div className='flex-1 mr-4'>
                                <div className='font-medium text-gray-900'>
                                    Email Notifications
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Receive emails about new content, community
                                    updates, and important announcements
                                </div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.emailNotifications}
                                onChange={(e) =>
                                    handleSettingChange(
                                        'emailNotifications',
                                        e.target.checked
                                    )
                                }
                                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                            />
                        </label>
                    </div>
                </div>

                {/* Data Processing */}
                <div className='bg-gray-50 rounded-lg p-6 mb-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <Shield className='h-5 w-5 mr-2 text-gray-600' />
                        Data Processing
                    </h4>

                    <div className='space-y-4'>
                        <label className='flex items-start justify-between'>
                            <div className='flex-1 mr-4'>
                                <div className='font-medium text-gray-900'>
                                    Analytics & Improvement
                                </div>
                                <div className='text-sm text-gray-600'>
                                    Allow anonymous usage data to help improve
                                    the H3 Network platform
                                </div>
                            </div>
                            <input
                                type='checkbox'
                                checked={settings.dataProcessing}
                                onChange={(e) =>
                                    handleSettingChange(
                                        'dataProcessing',
                                        e.target.checked
                                    )
                                }
                                className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                            />
                        </label>
                    </div>
                </div>

                {/* Save Button */}
                <div className='flex justify-end'>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className='inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                        <Save className='h-4 w-4 mr-2' />
                        {saving ? 'Saving...' : 'Save Privacy Settings'}
                    </button>
                </div>

                {/* Privacy Information */}
                <div className='mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <h5 className='font-medium text-blue-900 mb-2'>
                        Your Privacy Matters
                    </h5>
                    <p className='text-sm text-blue-800'>
                        H3 Network is committed to protecting your privacy. We
                        only collect data necessary to provide our services and
                        improve your experience. You can change these settings
                        at any time, and we will never share your personal
                        information with third parties without your consent.
                    </p>
                    <p className='text-sm text-blue-800 mt-2'>
                        For more information, please read our{' '}
                        <a
                            href='/privacy'
                            className='underline hover:text-blue-600'
                        >
                            Privacy Policy
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
