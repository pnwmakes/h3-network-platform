import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const blogs = await prisma.blog.findMany({
            select: {
                id: true,
                title: true,
                status: true,
                publishedAt: true,
                createdAt: true,
                featuredImage: true,
                creator: {
                    select: {
                        displayName: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        });

        return NextResponse.json({
            total: blogs.length,
            blogs: blogs.map(blog => ({
                id: blog.id,
                title: blog.title,
                status: blog.status,
                publishedAt: blog.publishedAt,
                createdAt: blog.createdAt,
                hasFeaturedImage: !!blog.featuredImage,
                featuredImageType: blog.featuredImage?.startsWith('data:') ? 'data-url' : 'file-url',
                creator: blog.creator.displayName
            }))
        });
    } catch (error) {
        console.error('Debug blogs error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch debug blogs' },
            { status: 500 }
        );
    }
}