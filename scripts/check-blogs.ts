// Quick test to check blog status in database
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBlogs() {
    console.log('Checking all blogs in database...');
    
    const allBlogs = await prisma.blog.findMany({
        select: {
            id: true,
            title: true,
            status: true,
            publishedAt: true,
            updatedAt: true,
            creator: {
                select: {
                    displayName: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
    
    console.log('\n=== ALL BLOGS ===');
    allBlogs.forEach(blog => {
        console.log(`${blog.id}: "${blog.title}" by ${blog.creator.displayName}`);
        console.log(`  Status: ${blog.status}`);
        console.log(`  Published: ${blog.publishedAt?.toISOString() || 'Not published'}`);
        console.log(`  Updated: ${blog.updatedAt?.toISOString()}`);
        console.log('---');
    });
    
    console.log('\n=== PUBLISHED BLOGS ONLY ===');
    const publishedBlogs = await prisma.blog.findMany({
        where: {
            status: 'PUBLISHED',
            publishedAt: {
                lte: new Date()
            }
        },
        select: {
            id: true,
            title: true,
            status: true,
            publishedAt: true
        }
    });
    
    console.log(`Found ${publishedBlogs.length} published blogs:`);
    publishedBlogs.forEach(blog => {
        console.log(`- "${blog.title}" (${blog.publishedAt?.toISOString()})`);
    });
    
    await prisma.$disconnect();
}

checkBlogs().catch(console.error);