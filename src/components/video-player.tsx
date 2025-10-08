'use client';

import { useState, useEffect, useCallback } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useSession } from 'next-auth/react';
import { useAnonymousViewing } from '@/hooks/use-anonymous-viewing';
import { RegistrationPrompt } from './registration-prompt';

interface VideoPlayerProps {
    videoId: string;
    youtubeId: string;
    title: string;
    onProgressUpdate?: (progressSeconds: number) => void;
    onVideoEnd?: () => void;
}

export function VideoPlayer({ videoId, youtubeId }: VideoPlayerProps) {
    const { data: session } = useSession();
    const {
        hasReachedLimit,
        canWatchVideo,
        trackVideoView,
        getRemainingAllowance,
        isAnonymous,
        viewingData,
    } = useAnonymousViewing();

    const [player, setPlayer] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [isPlaying, setIsPlaying] = useState(false);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [initialProgress, setInitialProgress] = useState(0);
    const [progressLoaded, setProgressLoaded] = useState(false);
    const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
    const [lastTrackedTime, setLastTrackedTime] = useState(0);

    // Check if user can watch this video
    const canWatch = canWatchVideo(videoId);

    // Determine why limit was reached (for modal messaging)
    const { videosRemaining } = getRemainingAllowance();
    const limitTrigger = videosRemaining <= 0 ? 'videoLimit' : 'timeLimit';

    // Load initial progress when component mounts
    useEffect(() => {
        if (!session?.user || !videoId) return;

        const loadProgress = async () => {
            try {
                const response = await fetch(
                    `/api/progress?videoId=${videoId}`
                );
                if (response.ok) {
                    const data = await response.json();
                    if (data.exists && data.progressSeconds > 0) {
                        setInitialProgress(data.progressSeconds);
                        setCurrentTime(data.progressSeconds);
                    }
                }
            } catch (error) {
                console.error('Error loading progress:', error);
            } finally {
                setProgressLoaded(true);
            }
        };

        loadProgress();
    }, [session, videoId]);

    // Save progress to database
    const saveProgress = useCallback(
        async (progressSeconds: number, completed = false) => {
            if (!session?.user || !videoId) return;

            try {
                await fetch('/api/progress', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        videoId,
                        progressSeconds: Math.floor(progressSeconds),
                        completed,
                    }),
                });
            } catch (error) {
                console.error('Error saving progress:', error);
            }
        },
        [session, videoId]
    );

    // Track progress every 5 seconds while playing
    useEffect(() => {
        if (!player || !isPlaying) return;

        const interval = setInterval(() => {
            const current = player.getCurrentTime();
            setCurrentTime(current);

            // For signed-in users, save progress to database
            if (session?.user) {
                saveProgress(current);
            }
            // For anonymous users, track viewing time locally
            else if (isAnonymous) {
                const timeDelta = current - lastTrackedTime;
                if (timeDelta > 0) {
                    trackVideoView(videoId, timeDelta);
                    setLastTrackedTime(current);
                }
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [
        player,
        isPlaying,
        session,
        videoId,
        saveProgress,
        isAnonymous,
        trackVideoView,
        lastTrackedTime,
    ]);

    // Show registration prompt when limits are reached
    useEffect(() => {
        if (hasReachedLimit && isAnonymous && !showRegistrationPrompt) {
            setShowRegistrationPrompt(true);
            // Pause the video when showing prompt
            if (player && isPlaying) {
                player.pauseVideo();
            }
        }
    }, [
        hasReachedLimit,
        isAnonymous,
        showRegistrationPrompt,
        player,
        isPlaying,
    ]);

    const onReady: YouTubeProps['onReady'] = (event) => {
        setPlayer(event.target);
        setDuration(event.target.getDuration());

        // Seek to saved progress if it exists and we're logged in
        if (progressLoaded && initialProgress > 0 && session?.user) {
            event.target.seekTo(initialProgress, true);
        }
    };

    const onPlay: YouTubeProps['onPlay'] = () => {
        // Check if anonymous user can watch before allowing play
        if (isAnonymous && !canWatch) {
            setShowRegistrationPrompt(true);
            if (player) {
                player.pauseVideo();
            }
            return;
        }
        setIsPlaying(true);
    };

    const onPause: YouTubeProps['onPause'] = () => {
        setIsPlaying(false);
        // Save progress when pausing (signed in users only)
        if (player && session?.user) {
            saveProgress(player.getCurrentTime());
        }
    };

    const onEnd: YouTubeProps['onEnd'] = () => {
        setIsPlaying(false);
        // Mark as completed when video ends
        if (player && session?.user && duration > 0) {
            saveProgress(duration, true);
        }
        // Track completion for anonymous users
        else if (player && isAnonymous && duration > 0) {
            const finalTime = duration - lastTrackedTime;
            if (finalTime > 0) {
                trackVideoView(videoId, finalTime);
            }
        }
    };
    const onStateChange: YouTubeProps['onStateChange'] = () => {
        // Update current time when state changes
        if (player) {
            setCurrentTime(player.getCurrentTime());
        }
    };

    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
            controls: 1,
            disablekb: 0,
            enablejsapi: 1,
            fs: 1,
            playsinline: 1,
        },
    };

    return (
        <div className='w-full'>
            <div className='relative aspect-video bg-black rounded-lg overflow-hidden'>
                <YouTube
                    videoId={youtubeId}
                    opts={opts}
                    onReady={onReady}
                    onPlay={onPlay}
                    onPause={onPause}
                    onEnd={onEnd}
                    onStateChange={onStateChange}
                    className='absolute inset-0 w-full h-full'
                    iframeClassName='w-full h-full'
                />
            </div>

            {/* Progress indicator for signed-in users */}
            {session && duration > 0 && (
                <div className='mt-2'>
                    <div className='flex justify-between text-sm text-gray-600 mb-1'>
                        <span>Progress</span>
                        <span>
                            {Math.floor(currentTime / 60)}:
                            {Math.floor(currentTime % 60)
                                .toString()
                                .padStart(2, '0')}{' '}
                            /{Math.floor(duration / 60)}:
                            {Math.floor(duration % 60)
                                .toString()
                                .padStart(2, '0')}
                        </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                            className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                            style={{
                                width: `${Math.min(
                                    (currentTime / duration) * 100,
                                    100
                                )}%`,
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Preview limit warning for anonymous users */}
            {isAnonymous && !hasReachedLimit && (
                <div className='mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
                    <p className='text-sm text-yellow-800'>
                        <span className='font-medium'>Preview Mode</span> - You
                        have {videosRemaining} video
                        {videosRemaining !== 1 ? 's' : ''} remaining.{' '}
                        <button
                            onClick={() => setShowRegistrationPrompt(true)}
                            className='font-medium underline hover:no-underline'
                        >
                            Create a free account
                        </button>{' '}
                        for unlimited access.
                    </p>
                </div>
            )}

            {/* Sign in prompt for anonymous users who haven't hit limits yet */}
            {isAnonymous && !hasReachedLimit && (
                <div className='mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                    <p className='text-sm text-blue-800'>
                        <span className='font-medium'>
                            Sign in to track your progress
                        </span>{' '}
                        and pick up where you left off.
                    </p>
                </div>
            )}

            {/* Registration prompt modal */}
            <RegistrationPrompt
                isOpen={showRegistrationPrompt}
                onClose={() => setShowRegistrationPrompt(false)}
                trigger={limitTrigger}
                videosWatched={viewingData?.videosWatched.length || 0}
                timeWatched={viewingData?.totalWatchTime || 0}
            />
        </div>
    );
}
