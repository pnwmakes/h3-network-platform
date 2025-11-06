import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { VideoForm } from '@/components/creator/video-form';

export default async function NewVideoPage() {
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
            <div className="text-center py-12">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Creator Profile Not Found
                </h1>
                <p className="text-gray-600">
                    Your creator profile hasn&apos;t been set up yet.
                </p>
            </div>
        );
    }

    // Verify creator profile exists and is complete
    if (!creator?.profileComplete) {
        redirect('/creator?setup=true');
    }    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="border-b border-gray-200 pb-5">
                <h1 className="text-3xl font-bold leading-6 text-gray-900">
                    Upload New Video
                </h1>
                <p className="mt-2 max-w-4xl text-sm text-gray-500">
                    Add a new video to your content library. You can save as a draft or schedule for later publication.
                </p>
            </div>

            {/* Video Form */}
            <VideoForm />
        </div>
    );
}