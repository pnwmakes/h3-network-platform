'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface SaveButtonProps {
    videoId?: string;
    blogId?: string;
    className?: string;
    showText?: boolean;
}

export function SaveButton({
    videoId,
    blogId,
    className = '',
    showText = false,
}: SaveButtonProps) {
    const { data: session } = useSession();
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Check if content is already saved
    useEffect(() => {
        const checkSavedStatus = async () => {
            if (!session?.user || (!videoId && !blogId)) return;

            try {
                const response = await fetch(
                    `/api/users/${session.user.id}/saved`
                );
                if (response.ok) {
                    const savedItems = await response.json();
                    const isContentSaved = savedItems.some(
                        (item: {
                            video?: { id: string };
                            blog?: { id: string };
                        }) =>
                            (videoId && item.video?.id === videoId) ||
                            (blogId && item.blog?.id === blogId)
                    );
                    setIsSaved(isContentSaved);
                }
            } catch (error) {
                console.error('Failed to check saved status:', error);
            }
        };

        checkSavedStatus();
    }, [session, videoId, blogId]);

    const handleSaveToggle = async () => {
        if (!session?.user || (!videoId && !blogId)) {
            // Redirect to login if not authenticated
            window.location.href = '/auth/signin';
            return;
        }

        setIsLoading(true);

        try {
            if (isSaved) {
                // Remove from saved
                const response = await fetch(
                    `/api/users/${session.user.id}/saved/${videoId || blogId}`,
                    { method: 'DELETE' }
                );

                if (response.ok) {
                    setIsSaved(false);
                }
            } else {
                // Add to saved
                const response = await fetch(
                    `/api/users/${session.user.id}/saved`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            videoId: videoId || null,
                            blogId: blogId || null,
                        }),
                    }
                );

                if (response.ok) {
                    setIsSaved(true);
                }
            }
        } catch (error) {
            console.error('Failed to toggle saved status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const baseClasses = `
        inline-flex items-center px-3 py-2 text-sm font-medium border rounded-md
        transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    `;

    const savedClasses = `
        ${baseClasses}
        bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 focus:ring-blue-500
    `;

    const unsavedClasses = `
        ${baseClasses}
        bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500
    `;

    return (
        <button
            onClick={handleSaveToggle}
            disabled={isLoading}
            className={`${
                isSaved ? savedClasses : unsavedClasses
            } ${className}`}
            title={isSaved ? 'Remove from saved' : 'Save for later'}
        >
            {isLoading ? (
                <div className='animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent' />
            ) : isSaved ? (
                <BookmarkCheck className='h-4 w-4' />
            ) : (
                <Bookmark className='h-4 w-4' />
            )}

            {showText && (
                <span className='ml-2'>
                    {isLoading
                        ? 'Saving...'
                        : isSaved
                        ? 'Saved'
                        : 'Save for later'}
                </span>
            )}
        </button>
    );
}
