import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { BlogForm } from '@/components/creator/blog-form';
import { notFound } from 'next/navigation';

export default async function EditBlogPage({
    params,
}: {
    params: { id: string };
}) {
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

    // Get the blog to edit
    const blog = await prisma.blog.findUnique({
        where: { id: params.id },
        include: {
            creator: {
                select: {
                    id: true,
                    displayName: true,
                },
            },
        },
    });

    if (!blog) {
        notFound();
    }

    // Check if user owns this blog or is super admin
    if (
        user.role !== 'SUPER_ADMIN' &&
        (!creator || blog.creatorId !== creator.id)
    ) {
        redirect('/creator/blogs');
    }

    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='border-b border-gray-200 pb-5'>
                <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                    Edit Blog Post
                </h1>
                <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                    Update your blog post content and publishing settings.
                </p>
            </div>

            {/* Blog Form */}
            <BlogForm blog={blog} />
        </div>
    );
}