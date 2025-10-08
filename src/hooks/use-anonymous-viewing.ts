'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface AnonymousViewingData {
    videosWatched: string[]; // Array of video IDs
    totalWatchTime: number; // Total seconds watched
    sessionStart: number; // Timestamp when session started
    lastActivity: number; // Last activity timestamp
}

const STORAGE_KEY = 'h3_anonymous_viewing';
const DEFAULT_LIMITS = {
    maxVideos: 3,
    maxWatchTimeSeconds: 15 * 60, // 15 minutes
};

export function useAnonymousViewing() {
    const { data: session, status } = useSession();
    const [viewingData, setViewingData] = useState<AnonymousViewingData | null>(
        null
    );
    const [hasReachedLimit, setHasReachedLimit] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load viewing data from localStorage on mount
    useEffect(() => {
        if (status === 'loading') return;

        // If user is signed in, clear anonymous data
        if (session?.user) {
            localStorage.removeItem(STORAGE_KEY);
            setViewingData(null);
            setHasReachedLimit(false);
            setIsLoading(false);
            return;
        }

        // Load anonymous viewing data
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data: AnonymousViewingData = JSON.parse(stored);
                setViewingData(data);

                // Check if limits are reached
                const limitReached =
                    data.videosWatched.length >= DEFAULT_LIMITS.maxVideos ||
                    data.totalWatchTime >= DEFAULT_LIMITS.maxWatchTimeSeconds;

                setHasReachedLimit(limitReached);
            } else {
                // Initialize new anonymous session
                const newData: AnonymousViewingData = {
                    videosWatched: [],
                    totalWatchTime: 0,
                    sessionStart: Date.now(),
                    lastActivity: Date.now(),
                };
                setViewingData(newData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
            }
        } catch (error) {
            console.error('Error loading anonymous viewing data:', error);
            // Reset on error
            localStorage.removeItem(STORAGE_KEY);
            const newData: AnonymousViewingData = {
                videosWatched: [],
                totalWatchTime: 0,
                sessionStart: Date.now(),
                lastActivity: Date.now(),
            };
            setViewingData(newData);
        }

        setIsLoading(false);
    }, [session, status]);

    // Track video viewing
    const trackVideoView = (videoId: string, watchTimeSeconds: number) => {
        if (session?.user || !viewingData) return;

        const updatedData: AnonymousViewingData = {
            ...viewingData,
            videosWatched: viewingData.videosWatched.includes(videoId)
                ? viewingData.videosWatched
                : [...viewingData.videosWatched, videoId],
            totalWatchTime: viewingData.totalWatchTime + watchTimeSeconds,
            lastActivity: Date.now(),
        };

        setViewingData(updatedData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));

        // Check if limits are reached
        const limitReached =
            updatedData.videosWatched.length >= DEFAULT_LIMITS.maxVideos ||
            updatedData.totalWatchTime >= DEFAULT_LIMITS.maxWatchTimeSeconds;

        if (limitReached && !hasReachedLimit) {
            setHasReachedLimit(true);
        }
    };

    // Check if user can watch a specific video
    const canWatchVideo = (videoId: string): boolean => {
        if (session?.user) return true; // Signed in users can watch anything
        if (!viewingData) return true; // No data yet, allow watching
        if (hasReachedLimit) return false; // Already reached limits

        // Check if this would exceed limits
        const wouldExceedVideoLimit =
            !viewingData.videosWatched.includes(videoId) &&
            viewingData.videosWatched.length >= DEFAULT_LIMITS.maxVideos;

        return !wouldExceedVideoLimit;
    };

    // Get remaining preview allowance
    const getRemainingAllowance = () => {
        if (session?.user || !viewingData) {
            return {
                videosRemaining: Infinity,
                timeRemaining: Infinity,
                unlimited: true,
            };
        }

        return {
            videosRemaining: Math.max(
                0,
                DEFAULT_LIMITS.maxVideos - viewingData.videosWatched.length
            ),
            timeRemaining: Math.max(
                0,
                DEFAULT_LIMITS.maxWatchTimeSeconds - viewingData.totalWatchTime
            ),
            unlimited: false,
        };
    };

    // Clear anonymous data (useful for testing)
    const clearAnonymousData = () => {
        localStorage.removeItem(STORAGE_KEY);
        setViewingData(null);
        setHasReachedLimit(false);
    };

    return {
        isLoading,
        viewingData,
        hasReachedLimit,
        trackVideoView,
        canWatchVideo,
        getRemainingAllowance,
        clearAnonymousData,
        isAnonymous: !session?.user && status !== 'loading',
    };
}
