'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FollowButtonProps {
    creatorId: string;
    initialFollowing?: boolean;
    initialFollowerCount?: number;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'outline';
}

export function FollowButton({
    creatorId,
    initialFollowing = false,
    initialFollowerCount = 0,
    size = 'md',
    variant = 'default',
}: FollowButtonProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [isFollowing, setIsFollowing] = useState(initialFollowing);
    const [followerCount, setFollowerCount] = useState(initialFollowerCount);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Fetch current follow status
        const fetchFollowStatus = async () => {
            try {
                const response = await fetch(
                    `/api/creators/${creatorId}/follow`
                );
                if (response.ok) {
                    const data = await response.json();
                    setIsFollowing(data.isFollowing);
                    setFollowerCount(data.followerCount);
                }
            } catch (error) {
                console.error('Failed to fetch follow status:', error);
            }
        };

        if (session?.user) {
            fetchFollowStatus();
        }
    }, [creatorId, session]);

    const handleClick = async () => {
        if (!session?.user) {
            router.push('/auth/signin?message=Please sign in to follow creators');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(
                `/api/creators/${creatorId}/follow`,
                {
                    method: isFollowing ? 'DELETE' : 'POST',
                }
            );

            if (response.ok) {
                const data = await response.json();
                setIsFollowing(data.following);
                setFollowerCount(data.followerCount);
            } else {
                const error = await response.json();
                console.error('Follow action failed:', error);
            }
        } catch (error) {
            console.error('Follow action error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='flex items-center gap-3'>
            <Button
                onClick={handleClick}
                disabled={isLoading}
                size={size}
                variant={isFollowing ? 'outline' : variant}
                className='min-w-[120px]'
            >
                {isLoading ? (
                    <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        {isFollowing ? 'Unfollowing...' : 'Following...'}
                    </>
                ) : isFollowing ? (
                    <>
                        <UserMinus className='h-4 w-4 mr-2' />
                        Following
                    </>
                ) : (
                    <>
                        <UserPlus className='h-4 w-4 mr-2' />
                        Follow
                    </>
                )}
            </Button>
            <span className='text-sm text-gray-600'>
                {followerCount} {followerCount === 1 ? 'follower' : 'followers'}
            </span>
        </div>
    );
}
