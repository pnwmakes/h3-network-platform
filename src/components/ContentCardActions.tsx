'use client';

import { useState, useEffect } from 'react';
import { ContentActions } from './ui/ContentActions';
import { cn } from '@/lib/utils';

interface ContentCardActionsProps {
    contentId: string;
    contentType: 'video' | 'blog';
    title: string;
    description?: string;
    className?: string;
}

export function ContentCardActions({
    contentId,
    contentType,
    title,
    description,
    className,
}: ContentCardActionsProps) {
    const [likeStatus, setLikeStatus] = useState({
        isLiked: false,
        likeCount: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    // Fetch like status on mount
    useEffect(() => {
        const fetchLikeStatus = async () => {
            try {
                const response = await fetch(
                    `/api/content/${contentId}/like?type=${contentType}`
                );
                if (response.ok) {
                    const data = await response.json();
                    setLikeStatus({
                        isLiked: data.isLiked,
                        likeCount: data.likeCount,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch like status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikeStatus();
    }, [contentId, contentType]);

    if (isLoading) {
        return (
            <div className={cn('flex items-center gap-1', className)}>
                <div className='animate-pulse flex items-center gap-1'>
                    <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
                    <div className='w-4 h-4 bg-gray-200 rounded'></div>
                    <div className='w-px h-6 bg-gray-200'></div>
                    <div className='w-8 h-8 bg-gray-200 rounded-full'></div>
                </div>
            </div>
        );
    }

    return (
        <ContentActions
            contentId={contentId}
            contentType={contentType}
            title={title}
            description={description}
            initialLikeCount={likeStatus.likeCount}
            initialIsLiked={likeStatus.isLiked}
            showLikeCount={true}
            shareVariant='minimal'
            className={className}
        />
    );
}
