import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { PreviewNotice } from '@/components/preview-notice';

async function getVideos() {
    return await prisma.video.findMany({
        where: {
            status: 'PUBLISHED',
        },
        include: {
            creator: true,
            show: true,
        },
        orderBy: {
            publishedAt: 'desc',
        },
    });
}

function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default async function VideosPage() {
    const videos = await getVideos();

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='text-center mb-12'>
                    <h1 className='text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight'>
                        H3 NETWORK VIDEOS
                    </h1>
                    <p className='text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed'>
                        Hope, Help, and Humor through powerful video content
                        covering criminal justice reform, addiction recovery,
                        and reentry support.
                    </p>
                    <div className='inline-block bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-2 rounded-lg font-bold'>
                        Hope • Help • Humor
                    </div>
                </div>

                <PreviewNotice />

                <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                    {videos.map((video) => (
                        <Link
                            key={video.id}
                            href={`/videos/${video.id}`}
                            className='group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300'
                        >
                            <div className='relative aspect-video rounded-t-lg overflow-hidden'>
                                <Image
                                    src={
                                        video.thumbnailUrl ||
                                        '/placeholder-video.svg'
                                    }
                                    alt={video.title}
                                    fill
                                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                />
                                {video.duration && (
                                    <div className='absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded'>
                                        {formatDuration(video.duration)}
                                    </div>
                                )}
                            </div>

                            <div className='p-4'>
                                <h3 className='font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                                    {video.title}
                                </h3>

                                <div className='mt-2 flex items-center text-sm text-gray-600'>
                                    <span className='font-medium'>
                                        {video.creator.displayName}
                                    </span>
                                    {video.show && (
                                        <>
                                            <span className='mx-2'>•</span>
                                            <span>{video.show.name}</span>
                                        </>
                                    )}
                                </div>

                                {video.description && (
                                    <p className='mt-2 text-sm text-gray-600 line-clamp-3'>
                                        {video.description}
                                    </p>
                                )}

                                <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
                                    <div className='flex items-center space-x-3'>
                                        <span>{video.viewCount} views</span>
                                        {video.publishedAt && (
                                            <span>
                                                {formatDistanceToNow(
                                                    new Date(video.publishedAt),
                                                    { addSuffix: true }
                                                )}
                                            </span>
                                        )}
                                    </div>

                                    {video.topic && (
                                        <span className='bg-gray-100 text-gray-700 px-2 py-1 rounded-full'>
                                            {video.topic
                                                .replace('_', ' ')
                                                .toLowerCase()}
                                        </span>
                                    )}
                                </div>

                                {video.tags.length > 0 && (
                                    <div className='mt-2 flex flex-wrap gap-1'>
                                        {video.tags
                                            .slice(0, 3)
                                            .map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className='inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded'
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        {video.tags.length > 3 && (
                                            <span className='text-xs text-gray-500'>
                                                +{video.tags.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {videos.length === 0 && (
                    <div className='text-center py-12'>
                        <div className='text-gray-500 text-lg'>
                            No videos available yet. Check back soon!
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
