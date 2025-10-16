// Fix the specific blog status
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBlogStatus() {
    console.log('Fixing "poop" blog status...');
    
    const updatedBlog = await prisma.blog.update({
        where: {
            id: 'cmgsq90vx0001ld09kb7i2yxm'
        },
        data: {
            status: 'PUBLISHED',
            publishedAt: new Date()
        },
        select: {
            id: true,
            title: true,
            status: true,
            publishedAt: true
        }
    });
    
    console.log('✅ Blog updated:');
    console.log(`Title: "${updatedBlog.title}"`);
    console.log(`Status: ${updatedBlog.status}`);
    console.log(`Published: ${updatedBlog.publishedAt?.toISOString()}`);
    
    await prisma.$disconnect();
}

fixBlogStatus().catch(console.error);