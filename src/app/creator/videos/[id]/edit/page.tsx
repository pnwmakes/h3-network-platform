import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { VideoForm } from '@/components/creator/video-form';
import { notFound } from 'next/navigation';

export default async function EditVideoPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    // Get creator profile
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { creator: true },
    });

    if (!user || (!user.creator && user.role !== 'SUPER_ADMIN')) {
        redirect('/');
    }

    const creator = user.creator;

    // Get the video to edit
    const video = await prisma.video.findUnique({
        where: { id },
        include: {
            creator: {
                select: {
                    id: true,
                    displayName: true,
                },
            },
        },
    });

    if (!video) {
        notFound();
    }

    // Check if user owns this video or is super admin
    if (
        user.role !== 'SUPER_ADMIN' &&
        (!creator || video.creatorId !== creator.id)
    ) {
        redirect('/creator/videos');
    }

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='border-b border-gray-200 pb-5'>
                <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                    Edit Video
                </h1>
                <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                    Update your video information and publishing settings.
                </p>
            </div>

            {/* Video Form */}
            <VideoForm video={video} />
        </div>
    );
}
