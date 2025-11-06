'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    GlobeAltIcon,
    ShareIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Platform {
    id: string;
    name: string;
    icon: string;
    connected: boolean;
    enabled: boolean;
    features: string[];
    maxTitleLength?: number;
    maxDescriptionLength?: number;
    supportedFormats?: string[];
}

interface MultiPlatformPublishingProps {
    content: {
        id: string;
        title: string;
        description?: string;
        contentType: 'VIDEO' | 'BLOG';
        thumbnailUrl?: string;
        featuredImage?: string;
        videoUrl?: string;
        blogContent?: string;
        tags?: string[];
        publishAt: string;
    };
    platforms: Platform[];
    onPublishToPlatform: (
        platformId: string,
        settings: PlatformSettings
    ) => Promise<void>;
    onUpdatePlatformSettings: (
        platformId: string,
        settings: PlatformSettings
    ) => void;
}

interface PlatformSettings {
    enabled: boolean;
    title?: string;
    description?: string;
    tags?: string[];
    customSettings?: Record<string, boolean | string | number>;
    publishTime?: string;
}

export function MultiPlatformPublishing({
    content,
    platforms,
    onPublishToPlatform,
    onUpdatePlatformSettings,
}: MultiPlatformPublishingProps) {
    const [platformSettings, setPlatformSettings] = useState<
        Record<string, PlatformSettings>
    >(
        platforms.reduce((acc, platform) => {
            acc[platform.id] = {
                enabled: platform.enabled,
                title: content.title,
                description: content.description || '',
                tags: content.tags || [],
                publishTime: format(new Date(content.publishAt), 'HH:mm'),
            };
            return acc;
        }, {} as Record<string, PlatformSettings>)
    );

    const [isPublishing, setIsPublishing] = useState<Record<string, boolean>>(
        {}
    );
    const [publishResults, setPublishResults] = useState<
        Record<string, { success: boolean; message: string }>
    >({});

    const updatePlatformSetting = (
        platformId: string,
        key: keyof PlatformSettings,
        value:
            | boolean
            | string
            | string[]
            | Record<string, boolean | string | number>
            | undefined
    ) => {
        const newSettings = {
            ...platformSettings[platformId],
            [key]: value,
        };

        setPlatformSettings((prev) => ({
            ...prev,
            [platformId]: newSettings,
        }));

        onUpdatePlatformSettings(platformId, newSettings);
    };

    const handlePublishToPlatform = async (platformId: string) => {
        setIsPublishing((prev) => ({ ...prev, [platformId]: true }));

        try {
            await onPublishToPlatform(platformId, platformSettings[platformId]);
            setPublishResults((prev) => ({
                ...prev,
                [platformId]: {
                    success: true,
                    message: 'Published successfully',
                },
            }));
        } catch (error) {
            setPublishResults((prev) => ({
                ...prev,
                [platformId]: {
                    success: false,
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Failed to publish',
                },
            }));
        } finally {
            setIsPublishing((prev) => ({ ...prev, [platformId]: false }));
        }
    };

    const handlePublishToAll = async () => {
        const enabledPlatforms = platforms.filter(
            (p) => p.connected && platformSettings[p.id]?.enabled
        );

        for (const platform of enabledPlatforms) {
            if (!isPublishing[platform.id]) {
                await handlePublishToPlatform(platform.id);
            }
        }
    };

    const getCharacterCount = (text: string, maxLength?: number) => {
        if (!maxLength) return null;
        const isOverLimit = text.length > maxLength;
        return (
            <span
                className={`text-xs ${
                    isOverLimit ? 'text-red-600' : 'text-gray-500'
                }`}
            >
                {text.length}/{maxLength}
            </span>
        );
    };

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                    <ShareIcon className='h-6 w-6 text-blue-600' />
                    <div>
                        <h3 className='text-lg font-medium text-gray-900'>
                            Multi-Platform Publishing
                        </h3>
                        <p className='text-sm text-gray-500'>
                            Customize and publish to multiple platforms
                            simultaneously
                        </p>
                    </div>
                </div>

                <button
                    onClick={handlePublishToAll}
                    disabled={Object.values(isPublishing).some(Boolean)}
                    className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    <GlobeAltIcon className='h-4 w-4 mr-2' />
                    Publish to All Selected
                </button>
            </div>

            {/* Content Preview */}
            <div className='bg-gray-50 rounded-lg p-4'>
                <h4 className='font-medium text-gray-900 mb-2'>
                    Content Preview
                </h4>
                <div className='space-y-2 text-sm'>
                    <div>
                        <strong>Title:</strong> {content.title}
                    </div>
                    <div>
                        <strong>Type:</strong> {content.contentType}
                    </div>
                    <div>
                        <strong>Scheduled:</strong>{' '}
                        {format(new Date(content.publishAt), 'PPp')}
                    </div>
                    {content.tags && (
                        <div>
                            <strong>Tags:</strong> {content.tags.join(', ')}
                        </div>
                    )}
                </div>
            </div>

            {/* Platform Settings */}
            <div className='space-y-4'>
                {platforms.map((platform) => {
                    const settings = platformSettings[platform.id];
                    const isCurrentlyPublishing = isPublishing[platform.id];
                    const result = publishResults[platform.id];

                    return (
                        <div
                            key={platform.id}
                            className={`border rounded-lg p-4 ${
                                !platform.connected
                                    ? 'bg-gray-50 opacity-60'
                                    : 'bg-white'
                            }`}
                        >
                            {/* Platform Header */}
                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center space-x-3'>
                                    <div className='text-2xl'>
                                        {platform.icon}
                                    </div>
                                    <div>
                                        <h4 className='font-medium text-gray-900'>
                                            {platform.name}
                                        </h4>
                                        {!platform.connected && (
                                            <p className='text-sm text-red-600'>
                                                Not connected
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className='flex items-center space-x-3'>
                                    {result && (
                                        <div
                                            className={`flex items-center space-x-1 text-sm ${
                                                result.success
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}
                                        >
                                            {result.success ? (
                                                <CheckCircleIcon className='h-4 w-4' />
                                            ) : (
                                                <ExclamationTriangleIcon className='h-4 w-4' />
                                            )}
                                            <span>{result.message}</span>
                                        </div>
                                    )}

                                    {platform.connected && (
                                        <>
                                            <label className='flex items-center'>
                                                <input
                                                    type='checkbox'
                                                    checked={
                                                        settings?.enabled ||
                                                        false
                                                    }
                                                    onChange={(e) =>
                                                        updatePlatformSetting(
                                                            platform.id,
                                                            'enabled',
                                                            e.target.checked
                                                        )
                                                    }
                                                    className='text-blue-600'
                                                />
                                                <span className='ml-2 text-sm text-gray-700'>
                                                    Enable
                                                </span>
                                            </label>

                                            <button
                                                onClick={() =>
                                                    handlePublishToPlatform(
                                                        platform.id
                                                    )
                                                }
                                                disabled={
                                                    !settings?.enabled ||
                                                    isCurrentlyPublishing
                                                }
                                                className='px-3 py-1 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                                            >
                                                {isCurrentlyPublishing
                                                    ? 'Publishing...'
                                                    : 'Publish Now'}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Platform-Specific Settings */}
                            {platform.connected && settings?.enabled && (
                                <div className='space-y-4 border-t pt-4'>
                                    {/* Title */}
                                    <div>
                                        <div className='flex justify-between items-center mb-1'>
                                            <label className='block text-sm font-medium text-gray-700'>
                                                Title
                                            </label>
                                            {getCharacterCount(
                                                settings.title || '',
                                                platform.maxTitleLength
                                            )}
                                        </div>
                                        <input
                                            type='text'
                                            value={settings.title || ''}
                                            onChange={(e) =>
                                                updatePlatformSetting(
                                                    platform.id,
                                                    'title',
                                                    e.target.value
                                                )
                                            }
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <div className='flex justify-between items-center mb-1'>
                                            <label className='block text-sm font-medium text-gray-700'>
                                                Description
                                            </label>
                                            {getCharacterCount(
                                                settings.description || '',
                                                platform.maxDescriptionLength
                                            )}
                                        </div>
                                        <textarea
                                            rows={3}
                                            value={settings.description || ''}
                                            onChange={(e) =>
                                                updatePlatformSetting(
                                                    platform.id,
                                                    'description',
                                                    e.target.value
                                                )
                                            }
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        />
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Tags (comma-separated)
                                        </label>
                                        <input
                                            type='text'
                                            value={
                                                settings.tags?.join(', ') || ''
                                            }
                                            onChange={(e) =>
                                                updatePlatformSetting(
                                                    platform.id,
                                                    'tags',
                                                    e.target.value
                                                        .split(',')
                                                        .map((tag) =>
                                                            tag.trim()
                                                        )
                                                        .filter(Boolean)
                                                )
                                            }
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                            placeholder='tag1, tag2, tag3'
                                        />
                                    </div>

                                    {/* Platform-specific settings */}
                                    {platform.id === 'youtube' && (
                                        <div className='bg-red-50 border border-red-200 rounded-md p-3'>
                                            <h5 className='text-sm font-medium text-red-800 mb-2'>
                                                YouTube Settings
                                            </h5>
                                            <div className='space-y-2'>
                                                <label className='flex items-center text-sm text-red-700'>
                                                    <input
                                                        type='checkbox'
                                                        className='mr-2'
                                                        defaultChecked
                                                    />
                                                    Set as unlisted initially
                                                </label>
                                                <label className='flex items-center text-sm text-red-700'>
                                                    <input
                                                        type='checkbox'
                                                        className='mr-2'
                                                    />
                                                    Enable comments
                                                </label>
                                                <label className='flex items-center text-sm text-red-700'>
                                                    <input
                                                        type='checkbox'
                                                        className='mr-2'
                                                        defaultChecked
                                                    />
                                                    Add to playlist
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {platform.id === 'twitter' && (
                                        <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
                                            <h5 className='text-sm font-medium text-blue-800 mb-2'>
                                                Twitter Settings
                                            </h5>
                                            <div className='space-y-2'>
                                                <label className='flex items-center text-sm text-blue-700'>
                                                    <input
                                                        type='checkbox'
                                                        className='mr-2'
                                                        defaultChecked
                                                    />
                                                    Thread for long content
                                                </label>
                                                <label className='flex items-center text-sm text-blue-700'>
                                                    <input
                                                        type='checkbox'
                                                        className='mr-2'
                                                    />
                                                    Include link preview
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {platform.id === 'facebook' && (
                                        <div className='bg-indigo-50 border border-indigo-200 rounded-md p-3'>
                                            <h5 className='text-sm font-medium text-indigo-800 mb-2'>
                                                Facebook Settings
                                            </h5>
                                            <div className='space-y-2'>
                                                <label className='flex items-center text-sm text-indigo-700'>
                                                    <input
                                                        type='checkbox'
                                                        className='mr-2'
                                                        defaultChecked
                                                    />
                                                    Post to page
                                                </label>
                                                <label className='flex items-center text-sm text-indigo-700'>
                                                    <input
                                                        type='checkbox'
                                                        className='mr-2'
                                                    />
                                                    Cross-post to Instagram
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* Publish Time Override */}
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                                            Platform-specific publish time
                                            (optional)
                                        </label>
                                        <input
                                            type='time'
                                            value={settings.publishTime || ''}
                                            onChange={(e) =>
                                                updatePlatformSetting(
                                                    platform.id,
                                                    'publishTime',
                                                    e.target.value
                                                )
                                            }
                                            className='px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        />
                                        <p className='text-xs text-gray-500 mt-1'>
                                            Leave empty to use main schedule
                                            time
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Platform Features */}
                            {platform.connected && (
                                <div className='mt-4 pt-3 border-t'>
                                    <h5 className='text-xs font-medium text-gray-500 mb-2 uppercase'>
                                        Platform Features
                                    </h5>
                                    <div className='flex flex-wrap gap-1'>
                                        {platform.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Publishing Summary */}
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h4 className='font-medium text-blue-900 mb-2'>
                    Publishing Summary
                </h4>
                <div className='text-sm text-blue-800'>
                    {(() => {
                        const enabledCount = platforms.filter(
                            (p) =>
                                p.connected && platformSettings[p.id]?.enabled
                        ).length;
                        const connectedCount = platforms.filter(
                            (p) => p.connected
                        ).length;

                        return (
                            <div className='space-y-1'>
                                <div>
                                    • {enabledCount} platform(s) selected for
                                    publishing
                                </div>
                                <div>
                                    • {connectedCount} platform(s) connected
                                </div>
                                <div>
                                    • Scheduled for{' '}
                                    {format(new Date(content.publishAt), 'PPp')}
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </div>
        </div>
    );
}
