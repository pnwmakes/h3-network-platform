'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from './button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  contentId: string;
  contentType: 'video' | 'blog';
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  className?: string;
  showCount?: boolean;
}

interface LikeData {
  isLiked: boolean;
  likeCount: number;
}

export function LikeButton({
  contentId,
  contentType,
  initialLikeCount = 0,
  initialIsLiked = false,
  className,
  showCount = true,
}: LikeButtonProps) {
  const { data: session } = useSession();
  const [likeData, setLikeData] = useState<LikeData>({
    isLiked: initialIsLiked,
    likeCount: initialLikeCount,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Initialize guest session if not authenticated
  useEffect(() => {
    if (!session) {
      // For guest users, check if they have a session cookie
      if (!document.cookie.includes('guest-session')) {
        // Create a new guest session ID
        const guestSessionId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        document.cookie = `guest-session=${guestSessionId}; path=/; max-age=${60 * 60 * 24 * 30}`; // 30 days
      }
    }
  }, [session]);

  // Fetch current like status on mount
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`/api/content/${contentId}/like?type=${contentType}`);
        if (response.ok) {
          const data = await response.json();
          setLikeData({
            isLiked: data.isLiked,
            likeCount: data.likeCount,
          });
        }
      } catch (error) {
        console.error('Failed to fetch like status:', error);
      }
    };

    fetchLikeStatus();
  }, [contentId, contentType]);

  const handleLike = async () => {
    if (isLoading || isPending) return;

    setError(null);
    setIsLoading(true);

    // Optimistic update
    const newIsLiked = !likeData.isLiked;
    const newLikeCount = newIsLiked 
      ? likeData.likeCount + 1 
      : Math.max(0, likeData.likeCount - 1);

    setLikeData({
      isLiked: newIsLiked,
      likeCount: newLikeCount,
    });

    try {
      const method = newIsLiked ? 'POST' : 'DELETE';
      const response = await fetch(`/api/content/${contentId}/like`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: contentType }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update like');
      }

      const data = await response.json();
      
      // Update with actual server response
      startTransition(() => {
        setLikeData({
          isLiked: data.isLiked,
          likeCount: data.likeCount,
        });
      });
    } catch (error) {
      // Revert optimistic update on error
      setLikeData({
        isLiked: !newIsLiked,
        likeCount: likeData.likeCount,
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update like';
      setError(errorMessage);
      console.error('Like operation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLikeCount = (count: number): string => {
    if (count < 1000) return count.toString();
    if (count < 1000000) return `${(count / 1000).toFixed(1)}k`;
    return `${(count / 1000000).toFixed(1)}M`;
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading || isPending}
        className={cn(
          "group relative p-2 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-950/20",
          likeData.isLiked && "text-red-500 hover:text-red-600",
          !likeData.isLiked && "text-gray-500 hover:text-red-500",
          (isLoading || isPending) && "opacity-50 cursor-not-allowed"
        )}
        title={likeData.isLiked ? "Unlike this content" : "Like this content"}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-all duration-200",
            likeData.isLiked && "fill-current scale-110",
            !likeData.isLiked && "group-hover:scale-110",
            (isLoading || isPending) && "animate-pulse"
          )}
        />
        
        {/* Animated heart for feedback */}
        {likeData.isLiked && !isLoading && !isPending && (
          <Heart
            className="absolute inset-0 m-auto h-5 w-5 text-red-500 fill-current animate-ping opacity-25"
          />
        )}
      </Button>
      
      {showCount && (
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            likeData.isLiked ? "text-red-500" : "text-gray-600 dark:text-gray-400"
          )}
        >
          {formatLikeCount(likeData.likeCount)}
        </span>
      )}
      
      {/* Error display */}
      {error && (
        <div className="absolute top-full left-0 mt-1 p-2 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-md shadow-md z-10">
          {error}
        </div>
      )}
    </div>
  );
}

export default LikeButton;