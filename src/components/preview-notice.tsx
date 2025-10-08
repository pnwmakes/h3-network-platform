'use client';

import { useSession } from 'next-auth/react';
import { useAnonymousViewing } from '@/hooks/use-anonymous-viewing';
import { useState } from 'react';
import { RegistrationPrompt } from './registration-prompt';

export function PreviewNotice() {
    const { data: session } = useSession();
    const { viewingData, hasReachedLimit } = useAnonymousViewing();
    const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

    // Don't show notice if user is signed in
    if (session) {
        return null;
    }

    const videosWatched = viewingData?.videosWatched.length || 0;
    const timeWatched = viewingData?.totalWatchTime || 0;
    const videosRemaining = Math.max(0, 3 - videosWatched);
    const timeRemaining = Math.max(0, 900 - timeWatched); // 15 minutes = 900 seconds

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    };

    return (
        <>
            <div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200'>
                <div className='flex items-start space-x-3'>
                    <div className='flex-shrink-0'>
                        <svg
                            className='h-5 w-5 text-blue-600 mt-0.5'
                            fill='none'
                            viewBox='0 0 24 24'
                            strokeWidth={1.5}
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                d='M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'
                            />
                        </svg>
                    </div>
                    <div className='flex-1'>
                        <h3 className='text-sm font-medium text-blue-900'>
                            Preview Mode
                        </h3>
                        <div className='mt-1 text-sm text-blue-800'>
                            {hasReachedLimit ? (
                                <p>
                                    You&apos;ve reached your preview limit.{' '}
                                    <button
                                        onClick={() =>
                                            setShowRegistrationPrompt(true)
                                        }
                                        className='font-medium underline hover:no-underline'
                                    >
                                        Create a free account
                                    </button>{' '}
                                    to continue watching unlimited content.
                                </p>
                            ) : (
                                <p>
                                    You can preview{' '}
                                    <span className='font-medium'>
                                        {videosRemaining} video
                                        {videosRemaining !== 1 ? 's' : ''}
                                    </span>{' '}
                                    or{' '}
                                    <span className='font-medium'>
                                        {formatTime(timeRemaining)}
                                    </span>{' '}
                                    of content before signing up.{' '}
                                    <button
                                        onClick={() =>
                                            setShowRegistrationPrompt(true)
                                        }
                                        className='font-medium underline hover:no-underline'
                                    >
                                        Create a free account now
                                    </button>{' '}
                                    for unlimited access and progress tracking.
                                </p>
                            )}
                        </div>
                        {videosWatched > 0 && (
                            <div className='mt-2 text-xs text-blue-700'>
                                Progress: {videosWatched}/3 videos watched •{' '}
                                {formatTime(timeWatched)} total watch time
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <RegistrationPrompt
                isOpen={showRegistrationPrompt}
                onClose={() => setShowRegistrationPrompt(false)}
                trigger={'videoLimit'}
                videosWatched={videosWatched}
                timeWatched={timeWatched}
            />
        </>
    );
}
