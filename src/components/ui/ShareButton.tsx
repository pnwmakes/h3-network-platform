'use client';

import { useState } from 'react';
import { Button } from './button';
import { Share2, Copy, Check, Twitter, Facebook, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
    contentId: string;
    contentType: 'video' | 'blog';
    title: string;
    description?: string;
    className?: string;
    variant?: 'default' | 'minimal';
}

export function ShareButton({
    contentId,
    contentType,
    title,
    description = '',
    className,
    variant = 'default',
}: ShareButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${baseUrl}/${contentType}s/${contentId}`;
    const shareText = `Check out: ${title}`;

    const handleCopyLink = async (event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const shareToTwitter = (event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            shareUrl
        )}&text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        setIsOpen(false);
    };

    const shareToFacebook = (event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            shareUrl
        )}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        setIsOpen(false);
    };

    const handleNativeShare = async (event?: React.MouseEvent) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Prevent multiple simultaneous share operations
        if (isSharing) {
            console.log('Share already in progress, ignoring click');
            return;
        }

        console.log('Share button clicked!', {
            contentId,
            contentType,
            variant,
        });

        if (navigator.share) {
            try {
                setIsSharing(true);
                await navigator.share({
                    title,
                    text: description,
                    url: shareUrl,
                });
                setIsOpen(false);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') {
                    console.error('Error sharing:', error);
                }
            } finally {
                setIsSharing(false);
            }
        } else {
            setIsOpen(!isOpen);
        }
    };

    if (variant === 'minimal') {
        return (
            <div className={cn('relative', className)}>
                <Button
                    variant='ghost'
                    size='sm'
                    onClick={handleNativeShare}
                    className='group p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200'
                    title='Share this content'
                >
                    <Share2 className='h-5 w-5 group-hover:scale-110 transition-transform duration-200' />
                </Button>

                {/* Dropdown menu for non-native share */}
                {isOpen && !navigator.share && (
                    <div className='absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 z-50 min-w-[200px]'>
                        <div className='space-y-1'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleCopyLink}
                                className='w-full justify-start gap-2 text-sm'
                            >
                                {copied ? (
                                    <Check className='h-4 w-4' />
                                ) : (
                                    <Copy className='h-4 w-4' />
                                )}
                                {copied ? 'Copied!' : 'Copy link'}
                            </Button>

                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={shareToTwitter}
                                className='w-full justify-start gap-2 text-sm'
                            >
                                <Twitter className='h-4 w-4' />
                                Share on Twitter
                            </Button>

                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={shareToFacebook}
                                className='w-full justify-start gap-2 text-sm'
                            >
                                <Facebook className='h-4 w-4' />
                                Share on Facebook
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className={cn('relative', className)}>
            <Button
                variant='outline'
                size='sm'
                onClick={handleNativeShare}
                className='gap-2'
            >
                <Share2 className='h-4 w-4' />
                Share
            </Button>

            {/* Dropdown menu for non-native share */}
            {isOpen && !navigator.share && (
                <div className='absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 z-50 min-w-[250px]'>
                    <div className='space-y-3'>
                        <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                            Share this {contentType}
                        </div>

                        <div className='space-y-2'>
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleCopyLink}
                                className='w-full justify-start gap-3 p-3 h-auto'
                            >
                                {copied ? (
                                    <Check className='h-5 w-5 text-green-500' />
                                ) : (
                                    <Link className='h-5 w-5' />
                                )}
                                <div className='text-left'>
                                    <div className='font-medium'>
                                        {copied ? 'Link copied!' : 'Copy link'}
                                    </div>
                                    <div className='text-xs text-gray-500'>
                                        Share via clipboard
                                    </div>
                                </div>
                            </Button>

                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={shareToTwitter}
                                className='w-full justify-start gap-3 p-3 h-auto'
                            >
                                <Twitter className='h-5 w-5 text-blue-400' />
                                <div className='text-left'>
                                    <div className='font-medium'>Twitter</div>
                                    <div className='text-xs text-gray-500'>
                                        Share on Twitter/X
                                    </div>
                                </div>
                            </Button>

                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={shareToFacebook}
                                className='w-full justify-start gap-3 p-3 h-auto'
                            >
                                <Facebook className='h-5 w-5 text-blue-600' />
                                <div className='text-left'>
                                    <div className='font-medium'>Facebook</div>
                                    <div className='text-xs text-gray-500'>
                                        Share on Facebook
                                    </div>
                                </div>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ShareButton;
