import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { VideosList } from '@/components/creator/videos-list';
import Link from 'next/link';
import { PlusIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default async function CreatorVideosPage({
    searchParams,
}: {
    searchParams: Promise<{ uploaded?: string }>;
}) {
    const { uploaded } = await searchParams;
    const session = await getServerSession(authOptions);

    if (!session) {
        return null;
    }

    // Get creator profile
    const creator = await prisma.creator.findFirst({
        where: {
            user: {
                id: session.user.id,
            },
        },
    });

    if (!creator) {
        return (
            <div className='text-center py-12'>
                <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                    Creator Profile Not Found
                </h1>
            </div>
        );
    }

    // Get videos with pagination
    const videos = await prisma.video.findMany({
        where: {
            creatorId: creator.id,
        },
        include: {
            show: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
        take: 50, // Show recent 50 videos
    });

    const stats = {
        total: await prisma.video.count({
            where: { creatorId: creator.id },
        }),
        published: await prisma.video.count({
            where: { creatorId: creator.id, status: 'PUBLISHED' },
        }),
        draft: await prisma.video.count({
            where: { creatorId: creator.id, status: 'DRAFT' },
        }),
        scheduled: await prisma.video.count({
            where: { creatorId: creator.id, status: 'SCHEDULED' },
        }),
    };

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-200 pb-5'>
                <div>
                    <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                        My Videos
                    </h1>
                    <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                        Manage your video content, track performance, and
                        schedule new uploads.
                    </p>
                </div>
                <div className='flex space-x-3'>
                    <Link
                        href='/creator/videos/new'
                        className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                    >
                        <PlusIcon className='-ml-1 mr-2 h-5 w-5' />
                        New Video
                    </Link>
                    <Link
                        href='/creator/videos/bulk-upload'
                        className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                    >
                        <CloudArrowUpIcon className='-ml-1 mr-2 h-5 w-5' />
                        Bulk Upload
                    </Link>
                </div>
            </div>

            {/* Success Message */}
            {uploaded === 'true' && (
                <div className='rounded-md bg-green-50 p-4'>
                    <div className='flex'>
                        <div className='flex-shrink-0'>
                            <svg
                                className='h-5 w-5 text-green-400'
                                xmlns='http://www.w3.org/2000/svg'
                                viewBox='0 0 20 20'
                                fill='currentColor'
                            >
                                <path
                                    fillRule='evenodd'
                                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                                    clipRule='evenodd'
                                />
                            </svg>
                        </div>
                        <div className='ml-3'>
                            <p className='text-sm font-medium text-green-800'>
                                Videos uploaded successfully! They have been
                                saved as drafts and can be published when ready.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
                <div className='bg-white overflow-hidden shadow rounded-lg'>
                    <div className='p-5'>
                        <div className='flex items-center'>
                            <div className='flex-shrink-0'>
                                <div className='w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center'>
                                    <span className='text-white text-sm font-medium'>
                                        📹
                                    </span>
                                </div>
                            </div>
                            <div className='ml-5 w-0 flex-1'>
                                <dl>
                                    <dt className='text-sm font-medium text-gray-500 truncate'>
                                        Total Videos
                                    </dt>
                                    <dd className='text-lg font-medium text-gray-900'>
                                        {stats.total}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                    <div className='p-5'>
                        <div className='flex items-center'>
                            <div className='flex-shrink-0'>
                                <div className='w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center'>
                                    <span className='text-white text-sm font-medium'>
                                        ✅
                                    </span>
                                </div>
                            </div>
                            <div className='ml-5 w-0 flex-1'>
                                <dl>
                                    <dt className='text-sm font-medium text-gray-500 truncate'>
                                        Published
                                    </dt>
                                    <dd className='text-lg font-medium text-gray-900'>
                                        {stats.published}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                    <div className='p-5'>
                        <div className='flex items-center'>
                            <div className='flex-shrink-0'>
                                <div className='w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center'>
                                    <span className='text-white text-sm font-medium'>
                                        📝
                                    </span>
                                </div>
                            </div>
                            <div className='ml-5 w-0 flex-1'>
                                <dl>
                                    <dt className='text-sm font-medium text-gray-500 truncate'>
                                        Drafts
                                    </dt>
                                    <dd className='text-lg font-medium text-gray-900'>
                                        {stats.draft}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='bg-white overflow-hidden shadow rounded-lg'>
                    <div className='p-5'>
                        <div className='flex items-center'>
                            <div className='flex-shrink-0'>
                                <div className='w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center'>
                                    <span className='text-white text-sm font-medium'>
                                        ⏰
                                    </span>
                                </div>
                            </div>
                            <div className='ml-5 w-0 flex-1'>
                                <dl>
                                    <dt className='text-sm font-medium text-gray-500 truncate'>
                                        Scheduled
                                    </dt>
                                    <dd className='text-lg font-medium text-gray-900'>
                                        {stats.scheduled}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Videos List */}
            <VideosList videos={videos} />
        </div>
    );
}
