'use client';

import { LikeButton } from './LikeButton';
import { ShareButton } from './ShareButton';
import { cn } from '@/lib/utils';

interface ContentActionsProps {
  contentId: string;
  contentType: 'video' | 'blog';
  title: string;
  description?: string;
  initialLikeCount?: number;
  initialIsLiked?: boolean;
  className?: string;
  showLikeCount?: boolean;
  shareVariant?: 'default' | 'minimal';
}

export function ContentActions({
  contentId,
  contentType,
  title,
  description,
  initialLikeCount = 0,
  initialIsLiked = false,
  className,
  showLikeCount = true,
  shareVariant = 'minimal',
}: ContentActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LikeButton
        contentId={contentId}
        contentType={contentType}
        initialLikeCount={initialLikeCount}
        initialIsLiked={initialIsLiked}
        showCount={showLikeCount}
      />
      
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
      
      <ShareButton
        contentId={contentId}
        contentType={contentType}
        title={title}
        description={description}
        variant={shareVariant}
      />
    </div>
  );
}

export default ContentActions;