import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BlogsList } from '@/components/creator/blogs-list';
import Link from 'next/link';
import { PlusIcon } from '@heroicons/react/24/outline';

export default async function CreatorBlogsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
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

    // Get blogs for this creator
    const blogs = await prisma.blog.findMany({
        where: {
            creatorId: creator?.id || '',
        },
        include: {
            creator: {
                select: {
                    id: true,
                    displayName: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='sm:flex sm:items-center sm:justify-between border-b border-gray-200 pb-5'>
                <div>
                    <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                        My Blog Posts
                    </h1>
                    <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                        Manage your blog articles and share your stories with the H3 Network community.
                    </p>
                </div>
                <div className='mt-4 sm:mt-0'>
                    <Link
                        href='/creator/blogs/new'
                        className='inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    >
                        <PlusIcon className='h-4 w-4 mr-2' />
                        Write New Post
                    </Link>
                </div>
            </div>

            {/* Blogs List */}
            <BlogsList blogs={blogs} />
        </div>
    );
}