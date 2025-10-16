// Script to update logo paths in the database
// Run this via: npx tsx scripts/fix-logo-paths.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLogoPaths() {
    console.log('Updating logo paths in database...');

    try {
        // Update creator avatar URLs
        const updatedCreators = await prisma.creator.updateMany({
            where: {
                avatarUrl: {
                    contains: '/h3-logos/',
                },
            },
            data: {
                avatarUrl: '/logos/H3 Logo.png',
            },
        });

        console.log(`Updated ${updatedCreators.count} creator avatars`);

        // Update video thumbnail URLs
        const updatedVideos = await prisma.video.updateMany({
            where: {
                thumbnailUrl: {
                    contains: '/h3-logos/',
                },
            },
            data: {
                thumbnailUrl: '/logos/H3 Logo.png',
            },
        });

        console.log(`Updated ${updatedVideos.count} video thumbnails`);

        // Update blog featured images if any
        const updatedBlogs = await prisma.blog.updateMany({
            where: {
                featuredImage: {
                    contains: '/h3-logos/',
                },
            },
            data: {
                featuredImage: '/logos/H3 Logo.png',
            },
        });

        console.log(`Updated ${updatedBlogs.count} blog featured images`);

        console.log('✅ Logo path update complete!');
    } catch (error) {
        console.error('❌ Error updating logo paths:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixLogoPaths();
