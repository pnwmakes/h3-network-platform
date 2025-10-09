import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import Image from 'next/image';
import { BackButton } from '@/components/back-button';

async function getCreators() {
    try {
        return await prisma.creator.findMany({
            where: {
                isActive: true,
            },
            include: {
                user: true,
                videos: {
                    where: {
                        status: 'PUBLISHED',
                    },
                    select: {
                        id: true,
                        viewCount: true,
                    },
                },
                blogs: {
                    where: {
                        status: 'PUBLISHED',
                    },
                    select: {
                        id: true,
                        viewCount: true,
                    },
                },
            },
            orderBy: {
                displayName: 'asc',
            },
        });
    } catch (error) {
        console.warn(
            'Database not available, returning empty creators list:',
            error
        );
        return [];
    }
}

type CreatorWithStats = Awaited<ReturnType<typeof getCreators>>[0];

function getCreatorStats(creator: CreatorWithStats) {
    const videoCount = creator.videos.length;
    const blogCount = creator.blogs.length;
    const totalViews =
        creator.videos.reduce(
            (sum: number, video: { id: string; viewCount: number }) =>
                sum + video.viewCount,
            0
        ) +
        creator.blogs.reduce(
            (sum: number, blog: { id: string; viewCount: number }) =>
                sum + blog.viewCount,
            0
        );

    return { videoCount, blogCount, totalViews };
}

export default async function CreatorsPage() {
    const creators = await getCreators();

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <BackButton href='/' label='Back to Home' />

                {/* Header */}
                <div className='text-center mb-12'>
                    <h1 className='text-3xl font-bold text-gray-900 mb-4'>
                        Meet Our H3 Network Creators
                    </h1>
                    <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
                        Discover the passionate creators sharing their stories
                        of{' '}
                        <span className='text-blue-600 font-semibold'>
                            Hope
                        </span>
                        ,{' '}
                        <span className='text-green-600 font-semibold'>
                            Help
                        </span>
                        , and{' '}
                        <span className='text-purple-600 font-semibold'>
                            Humor
                        </span>{' '}
                        to support those affected by criminal justice and
                        addiction recovery.
                    </p>
                </div>

                {/* Creators Grid */}
                {creators.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                        {creators.map((creator) => {
                            const stats = getCreatorStats(creator);

                            return (
                                <Link
                                    key={creator.id}
                                    href={`/creators/${creator.id}`}
                                    className='group'
                                >
                                    <div className='bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                                        {/* Creator Avatar */}
                                        <div className='relative h-48 bg-gradient-to-br from-blue-100 to-purple-100'>
                                            <div className='absolute inset-0 flex items-center justify-center'>
                                                {creator.avatarUrl ? (
                                                    <Image
                                                        src={creator.avatarUrl}
                                                        alt={
                                                            creator.displayName
                                                        }
                                                        width={120}
                                                        height={120}
                                                        className='rounded-full border-4 border-white shadow-lg object-cover'
                                                    />
                                                ) : (
                                                    <div className='w-30 h-30 bg-gray-300 rounded-full flex items-center justify-center border-4 border-white shadow-lg'>
                                                        <span className='text-2xl font-bold text-gray-600'>
                                                            {creator.displayName
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Creator Info */}
                                        <div className='p-6'>
                                            <h3 className='text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                                                {creator.displayName}
                                            </h3>

                                            {creator.showName && (
                                                <p className='text-sm text-blue-600 font-medium mb-2'>
                                                    {creator.showName}
                                                </p>
                                            )}

                                            <p className='text-gray-600 text-sm mb-4 line-clamp-3'>
                                                {creator.bio ||
                                                    'A passionate creator sharing stories of hope, help, and humor with the H3 Network community.'}
                                            </p>

                                            {/* Creator Stats */}
                                            <div className='flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-4'>
                                                <div className='text-center'>
                                                    <div className='font-semibold text-gray-900'>
                                                        {stats.videoCount}
                                                    </div>
                                                    <div>Videos</div>
                                                </div>
                                                <div className='text-center'>
                                                    <div className='font-semibold text-gray-900'>
                                                        {stats.blogCount}
                                                    </div>
                                                    <div>Blogs</div>
                                                </div>
                                                <div className='text-center'>
                                                    <div className='font-semibold text-gray-900'>
                                                        {stats.totalViews.toLocaleString()}
                                                    </div>
                                                    <div>Views</div>
                                                </div>
                                            </div>

                                            {/* View Profile Button */}
                                            <div className='mt-4'>
                                                <span className='inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700'>
                                                    View Profile
                                                    <svg
                                                        className='ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform'
                                                        fill='none'
                                                        viewBox='0 0 24 24'
                                                        strokeWidth={1.5}
                                                        stroke='currentColor'
                                                    >
                                                        <path
                                                            strokeLinecap='round'
                                                            strokeLinejoin='round'
                                                            d='M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3'
                                                        />
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className='text-center py-12'>
                        <div className='mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                            <svg
                                className='h-12 w-12 text-gray-400'
                                fill='none'
                                viewBox='0 0 24 24'
                                strokeWidth={1.5}
                                stroke='currentColor'
                            >
                                <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
                                />
                            </svg>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                            No Creators Yet
                        </h3>
                        <p className='text-gray-500'>
                            Creators will appear here once they join the H3
                            Network platform.
                        </p>
                    </div>
                )}

                {/* Featured Creators Section - Future Enhancement */}
                {creators.length > 0 && (
                    <div className='mt-16 text-center'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                            Join the H3 Network Community
                        </h2>
                        <p className='text-gray-600 mb-6 max-w-2xl mx-auto'>
                            Be part of a community dedicated to supporting those
                            affected by criminal justice issues and addiction
                            recovery through authentic storytelling and shared
                            experiences.
                        </p>
                        <Link
                            href='/auth/register'
                            className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200'
                        >
                            Join Our Community
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
