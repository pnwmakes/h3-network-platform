import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { VideoPlayer } from '@/components/video-player';
import { BackButton } from '@/components/back-button';
import { SaveButton } from '@/components/save-button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

interface VideoPageProps {
    params: {
        id: string;
    };
}

async function getVideo(id: string) {
    return await prisma.video.findUnique({
        where: {
            id,
            status: 'PUBLISHED',
        },
        include: {
            creator: true,
            show: true,
        },
    });
}

async function getRelatedVideos(videoId: string, creatorId: string, limit = 4) {
    return await prisma.video.findMany({
        where: {
            status: 'PUBLISHED',
            id: { not: videoId },
            creatorId: creatorId,
        },
        include: {
            creator: true,
            show: true,
        },
        orderBy: {
            publishedAt: 'desc',
        },
        take: limit,
    });
}

async function getUserProgress(userId: string, videoId: string) {
    return await prisma.userProgress.findUnique({
        where: {
            userId_videoId: {
                userId,
                videoId,
            },
        },
    });
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default async function VideoPage({ params }: VideoPageProps) {
    const { id } = await params;
    const video = await getVideo(id);

    if (!video) {
        notFound();
    }

    const session = await getServerSession(authOptions);
    const relatedVideos = await getRelatedVideos(id, video.creatorId);

    let userProgress = null;
    if (session?.user) {
        userProgress = await getUserProgress(session.user.id, id);
    }

    const progressPercentage =
        userProgress && video.duration
            ? Math.round((userProgress.progressSeconds / video.duration) * 100)
            : 0;

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <BackButton />

                <div className='lg:grid lg:grid-cols-3 lg:gap-8'>
                    {/* Main Video Content */}
                    <div className='lg:col-span-2'>
                        <VideoPlayer
                            videoId={video.id}
                            youtubeId={video.youtubeId}
                            title={video.title}
                        />

                        {/* Progress indicator for signed-in users */}
                        {session?.user && userProgress && (
                            <div className='mt-4 p-3 bg-green-50 rounded-lg border border-green-200'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-sm font-medium text-green-800'>
                                        Progress: {progressPercentage}% complete
                                    </span>
                                    {userProgress.completed && (
                                        <span className='text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                                            ✓ Completed
                                        </span>
                                    )}
                                </div>
                                {!userProgress.completed && video.duration && (
                                    <div className='mt-2'>
                                        <div className='w-full bg-green-200 rounded-full h-2'>
                                            <div
                                                className='bg-green-600 h-2 rounded-full'
                                                style={{
                                                    width: `${progressPercentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Video Info */}
                        <div className='mt-6'>
                            <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                                {video.title}
                            </h1>

                            <div className='flex items-center justify-between mb-4'>
                                <div className='flex items-center space-x-4'>
                                    <div>
                                        <h3 className='font-semibold text-gray-900'>
                                            {video.creator.displayName}
                                        </h3>
                                        {video.show && (
                                            <p className='text-sm text-gray-600'>
                                                {video.show.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className='flex items-center space-x-4'>
                                    {/* Save Button */}
                                    <SaveButton
                                        videoId={video.id}
                                        showText={true}
                                    />

                                    {/* Video Stats */}
                                    <div className='flex items-center space-x-4 text-sm text-gray-600'>
                                        <span>{video.viewCount} views</span>
                                        {video.duration && (
                                            <span>
                                                {formatDuration(video.duration)}
                                            </span>
                                        )}
                                        {video.publishedAt && (
                                            <span>
                                                {formatDistanceToNow(
                                                    new Date(video.publishedAt),
                                                    { addSuffix: true }
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Topic and Tags */}
                            <div className='flex flex-wrap items-center gap-2 mb-4'>
                                {video.topic && (
                                    <span className='bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium'>
                                        {video.topic
                                            .replace('_', ' ')
                                            .toLowerCase()}
                                    </span>
                                )}
                                {video.tags.map((tag, index) => (
                                    <span
                                        key={index}
                                        className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm'
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            {/* Description */}
                            {video.description && (
                                <div className='prose max-w-none'>
                                    <h3 className='text-lg font-semibold mb-2'>
                                        About this video
                                    </h3>
                                    <p className='text-gray-700 whitespace-pre-wrap'>
                                        {video.description}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Related Videos */}
                    <div className='mt-8 lg:mt-0'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-4'>
                            More from {video.creator.displayName}
                        </h2>

                        <div className='space-y-4'>
                            {relatedVideos.map((relatedVideo) => (
                                <Link
                                    key={relatedVideo.id}
                                    href={`/videos/${relatedVideo.id}`}
                                    className='block group'
                                >
                                    <div className='flex space-x-3'>
                                        <div className='relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0'>
                                            <Image
                                                src={
                                                    relatedVideo.thumbnailUrl ||
                                                    '/placeholder-video.svg'
                                                }
                                                alt={relatedVideo.title}
                                                fill
                                                className='object-cover group-hover:scale-105 transition-transform duration-200'
                                                sizes='160px'
                                            />
                                            {relatedVideo.duration && (
                                                <div className='absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded'>
                                                    {formatDuration(
                                                        relatedVideo.duration
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className='flex-1 min-w-0'>
                                            <h3 className='font-medium text-sm text-gray-900 line-clamp-2 group-hover:text-blue-600'>
                                                {relatedVideo.title}
                                            </h3>
                                            <p className='text-xs text-gray-600 mt-1'>
                                                {relatedVideo.show?.name}
                                            </p>
                                            <div className='flex items-center text-xs text-gray-500 mt-1 space-x-2'>
                                                <span>
                                                    {relatedVideo.viewCount}{' '}
                                                    views
                                                </span>
                                                {relatedVideo.publishedAt && (
                                                    <span>
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                relatedVideo.publishedAt
                                                            ),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {relatedVideos.length === 0 && (
                            <p className='text-gray-500 text-sm'>
                                No other videos from this creator yet.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
