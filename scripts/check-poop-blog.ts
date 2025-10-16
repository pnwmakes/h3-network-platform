// Check specific blog status
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSpecificBlog() {
    console.log('Looking for "poop poopppp" blog...');
    
    const blog = await prisma.blog.findFirst({
        where: {
            title: {
                contains: 'poop'
            }
        },
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
        }
    });
    
    if (blog) {
        console.log('Found blog:');
        console.log(`ID: ${blog.id}`);
        console.log(`Title: "${blog.title}"`);
        console.log(`Creator: ${blog.creator.displayName}`);
        console.log(`Status: ${blog.status}`);
        console.log(`Published: ${blog.publishedAt?.toISOString() || 'Not published'}`);
        console.log(`Updated: ${blog.updatedAt?.toISOString()}`);
        
        // Check if it meets the published criteria
        const isPublishedCriteria = blog.status === 'PUBLISHED' && 
                                   blog.publishedAt && 
                                   blog.publishedAt <= new Date();
        
        console.log(`\nMeets published criteria: ${isPublishedCriteria}`);
        console.log(`Current time: ${new Date().toISOString()}`);
    } else {
        console.log('Blog with "poop" in title not found!');
    }
    
    await prisma.$disconnect();
}

checkSpecificBlog().catch(console.error);