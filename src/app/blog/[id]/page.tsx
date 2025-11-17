import { prisma } from '@/lib/prisma';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ContentCardActions } from '@/components/ContentCardActions';
import {
    Calendar,
    Eye,
    User,
    Clock,
    Tag,
    ArrowLeft,
} from 'lucide-react';

interface BlogPostPageProps {
    params: Promise<{ id: string }>;
}

async function getBlogPost(id: string) {
    try {
        const blog = await prisma.blog.findUnique({
            where: {
                id,
                status: 'PUBLISHED',
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
            },
        });

        if (blog) {
            // Increment view count
            await prisma.blog.update({
                where: { id },
                data: {
                    viewCount: {
                        increment: 1,
                    },
                },
            });
        }

        return blog;
    } catch (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }
}

async function getRelatedPosts(
    currentBlogId: string,
    topic?: string,
    creatorId?: string
) {
    try {
        const whereConditions = [];

        if (topic) {
            whereConditions.push({
                topic: topic as
                    | 'REENTRY'
                    | 'ADDICTION'
                    | 'INCARCERATION'
                    | 'CRIMINAL_JUSTICE_REFORM'
                    | 'GENERAL',
            });
        }
        if (creatorId) {
            whereConditions.push({ creatorId });
        }

        return await prisma.blog.findMany({
            where: {
                status: 'PUBLISHED',
                id: { not: currentBlogId },
                ...(whereConditions.length > 0 && { OR: whereConditions }),
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
            orderBy: {
                publishedAt: 'desc',
            },
            take: 3,
        });
    } catch (error) {
        console.error('Error fetching related posts:', error);
        return [];
    }
}

function formatTopic(topic: string): string {
    return topic
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

function calculateReadTime(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { id } = await params;
    const blog = await getBlogPost(id);

    if (!blog) {
        notFound();
    }

    const relatedPosts = await getRelatedPosts(
        blog.id,
        blog.topic || undefined,
        blog.creatorId
    );

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Back Button */}
                <div className='mb-8'>
                    <Link
                        href='/blog'
                        className='inline-flex items-center text-blue-600 hover:text-blue-700 font-medium'
                    >
                        <ArrowLeft className='h-4 w-4 mr-2' />
                        Back to Blog
                    </Link>
                </div>

                {/* Main Article */}
                <article className='bg-white rounded-xl shadow-md overflow-hidden'>
                    {/* Featured Image */}
                    {blog.featuredImage && (
                        <div className='relative aspect-video overflow-hidden'>
                            <Image
                                src={blog.featuredImage}
                                alt={blog.title}
                                fill
                                className='object-cover'
                                priority
                                sizes='(max-width: 768px) 100vw, 768px'
                            />
                        </div>
                    )}

                    {/* Article Content */}
                    <div className='p-8'>
                        {/* Topic Badge */}
                        {blog.topic && (
                            <div className='mb-4'>
                                <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800'>
                                    {formatTopic(blog.topic)}
                                </span>
                            </div>
                        )}

                        {/* Title */}
                        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight'>
                            {blog.title}
                        </h1>

                        {/* Author and Meta Info */}
                        <div className='flex items-center justify-between mb-8 pb-6 border-b border-gray-200'>
                            <div className='flex items-center space-x-4'>
                                <div className='flex items-center space-x-3'>
                                    {blog.creator.avatarUrl ? (
                                        <Image
                                            src={blog.creator.avatarUrl}
                                            alt={blog.creator.displayName}
                                            width={48}
                                            height={48}
                                            className='rounded-full'
                                        />
                                    ) : (
                                        <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                                            <User className='h-6 w-6 text-gray-400' />
                                        </div>
                                    )}
                                    <div>
                                        <p className='font-medium text-gray-900'>
                                            {blog.creator.displayName}
                                        </p>
                                        {blog.creator.bio && (
                                            <p className='text-sm text-gray-600'>
                                                {blog.creator.bio}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <ContentCardActions
                                contentId={blog.id}
                                contentType="blog"
                                title={blog.title}
                                description={blog.excerpt || ''}
                                className="flex items-center space-x-4"
                            />
                        </div>

                        {/* Post Meta */}
                        <div className='flex items-center space-x-6 text-sm text-gray-600 mb-8'>
                            {blog.publishedAt && (
                                <div className='flex items-center space-x-1'>
                                    <Calendar className='h-4 w-4' />
                                    <span>
                                        Published{' '}
                                        {formatDistanceToNow(
                                            new Date(blog.publishedAt),
                                            { addSuffix: true }
                                        )}
                                    </span>
                                </div>
                            )}

                            <div className='flex items-center space-x-1'>
                                <Clock className='h-4 w-4' />
                                <span>
                                    {calculateReadTime(blog.content)} min read
                                </span>
                            </div>

                            <div className='flex items-center space-x-1'>
                                <Eye className='h-4 w-4' />
                                <span>{blog.viewCount} views</span>
                            </div>
                        </div>

                        {/* Blog Content */}
                        <div className='prose prose-lg prose-blue max-w-none'>
                            {blog.content
                                .split('\n')
                                .map((paragraph, index) => (
                                    <p
                                        key={index}
                                        className='mb-4 text-gray-800 leading-relaxed'
                                    >
                                        {paragraph}
                                    </p>
                                ))}
                        </div>

                        {/* Tags */}
                        {blog.tags.length > 0 && (
                            <div className='mt-8 pt-6 border-t border-gray-200'>
                                <h3 className='text-sm font-medium text-gray-900 mb-3'>
                                    Tags
                                </h3>
                                <div className='flex flex-wrap gap-2'>
                                    {blog.tags.map((tag, index) => (
                                        <Link
                                            key={index}
                                            href={`/search?tags=${encodeURIComponent(
                                                tag
                                            )}`}
                                            className='inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors'
                                        >
                                            <Tag className='h-3 w-3' />
                                            {tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </article>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <div className='mt-12'>
                        <h2 className='text-2xl font-bold text-gray-900 mb-6'>
                            Related Posts
                        </h2>
                        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                            {relatedPosts.map((relatedPost) => (
                                <Link
                                    key={relatedPost.id}
                                    href={`/blog/${relatedPost.id}`}
                                    className='group bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden'
                                >
                                    {relatedPost.featuredImage && (
                                        <div className='relative aspect-video overflow-hidden'>
                                            <Image
                                                src={relatedPost.featuredImage}
                                                alt={relatedPost.title}
                                                fill
                                                className='object-cover group-hover:scale-105 transition-transform duration-300'
                                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                            />
                                        </div>
                                    )}
                                    <div className='p-4'>
                                        <h3 className='font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                                            {relatedPost.title}
                                        </h3>
                                        {relatedPost.excerpt && (
                                            <p className='text-sm text-gray-600 mt-2 line-clamp-2'>
                                                {relatedPost.excerpt}
                                            </p>
                                        )}
                                        <div className='flex items-center space-x-2 mt-3 text-xs text-gray-500'>
                                            <span>
                                                {
                                                    relatedPost.creator
                                                        .displayName
                                                }
                                            </span>
                                            {relatedPost.publishedAt && (
                                                <>
                                                    <span>•</span>
                                                    <span>
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                relatedPost.publishedAt
                                                            ),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
