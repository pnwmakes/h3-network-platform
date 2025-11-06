import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BulkUploadForm } from '@/components/creator/bulk-upload-form';

export default async function BulkUploadPage() {
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
                <p className='text-gray-600'>
                    Your creator profile hasn&apos;t been set up yet.
                </p>
            </div>
        );
    }

    // Get all shows for the dropdown
    const shows = await prisma.show.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
    });

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='border-b border-gray-200 pb-5'>
                <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                    Bulk Video Upload
                </h1>
                <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                    Upload multiple videos at once with batch processing and
                    scheduling capabilities. Perfect for content creators who
                    need to upload multiple episodes or a series.
                </p>
            </div>

            {/* Bulk Upload Form */}
            <BulkUploadForm creator={creator} shows={shows} />
        </div>
    );
}
