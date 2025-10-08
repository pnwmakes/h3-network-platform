import {
    PrismaClient,
    UserRole,
    ContentStatus,
    ContentTopic,
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create sample test viewer
    const viewerPassword = await bcrypt.hash('password123', 12);

    const testViewer = await prisma.user.upsert({
        where: { email: 'test@h3network.org' },
        update: {},
        create: {
            email: 'test@h3network.org',
            name: 'Test Viewer',
            password: viewerPassword,
            role: UserRole.VIEWER,
        },
    });

    console.log('✅ Created test viewer:', testViewer.email);

    // Create sample creators
    const creatorPassword = await bcrypt.hash('creator123', 12);

    const creator1 = await prisma.user.upsert({
        where: { email: 'mike@h3network.com' },
        update: {},
        create: {
            email: 'mike@h3network.com',
            name: 'Mike Thompson',
            password: creatorPassword,
            role: UserRole.CREATOR,
            creator: {
                create: {
                    displayName: 'Mike Thompson',
                    bio: 'Formerly incarcerated advocate sharing stories of redemption and second chances. Host of "Second Chances Podcast".',
                    showName: 'Second Chances',
                    isActive: true,
                },
            },
        },
        include: {
            creator: true,
        },
    });

    const creator2 = await prisma.user.upsert({
        where: { email: 'sarah@h3network.com' },
        update: {},
        create: {
            email: 'sarah@h3network.com',
            name: 'Sarah Martinez',
            password: creatorPassword,
            role: UserRole.CREATOR,
            creator: {
                create: {
                    displayName: 'Sarah Martinez',
                    bio: 'Recovery advocate and counselor helping others navigate addiction recovery and reentry challenges.',
                    showName: 'Recovery Roads',
                    isActive: true,
                },
            },
        },
        include: {
            creator: true,
        },
    });

    // Create shows
    const show1 = await prisma.show.upsert({
        where: { name: 'Second Chances' },
        update: {},
        create: {
            name: 'Second Chances',
            description:
                'Stories of redemption, second chances, and transformation from formerly incarcerated individuals.',
            isActive: true,
        },
    });

    const show2 = await prisma.show.upsert({
        where: { name: 'Recovery Roads' },
        update: {},
        create: {
            name: 'Recovery Roads',
            description:
                'Navigating addiction recovery and reentry challenges with expert guidance and real stories.',
            isActive: true,
        },
    });

    // Sample videos (using actual educational YouTube videos about criminal justice reform)
    const videos = [
        {
            title: 'Understanding Criminal Justice Reform',
            description:
                'An introduction to the key issues in criminal justice reform and why it matters for communities.',
            youtubeId: 'dQw4w9WgXcQ', // Placeholder - replace with actual educational content
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: 720, // 12 minutes
            topic: ContentTopic.CRIMINAL_JUSTICE_REFORM,
            status: ContentStatus.PUBLISHED,
            creatorId: creator1.creator!.id,
            showId: show1.id,
            tags: ['criminal justice', 'reform', 'introduction'],
        },
        {
            title: 'Life After Prison: Reentry Challenges',
            description:
                'Personal stories and practical advice for individuals reentering society after incarceration.',
            youtubeId: 'ScMzIvxBSi4', // Placeholder - replace with actual educational content
            youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
            duration: 1020, // 17 minutes
            topic: ContentTopic.REENTRY,
            status: ContentStatus.PUBLISHED,
            creatorId: creator1.creator!.id,
            showId: show1.id,
            tags: ['reentry', 'prison', 'rehabilitation', 'second chances'],
        },
        {
            title: 'Breaking the Cycle: Addiction Recovery',
            description:
                'Understanding addiction as a disease and the path to recovery and healing.',
            youtubeId: 'astISOttCQ0', // Placeholder - replace with actual educational content
            youtubeUrl: 'https://www.youtube.com/watch?v=astISOttCQ0',
            duration: 900, // 15 minutes
            topic: ContentTopic.ADDICTION,
            status: ContentStatus.PUBLISHED,
            creatorId: creator2.creator!.id,
            showId: show2.id,
            tags: ['addiction', 'recovery', 'mental health', 'healing'],
        },
        {
            title: 'Family Support During Recovery',
            description:
                'How families can support their loved ones through addiction recovery and reentry.',
            youtubeId: 'oHg5SJYRHA0', // Placeholder - replace with actual educational content
            youtubeUrl: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
            duration: 840, // 14 minutes
            topic: ContentTopic.ADDICTION,
            status: ContentStatus.PUBLISHED,
            creatorId: creator2.creator!.id,
            showId: show2.id,
            tags: ['family', 'support', 'recovery', 'relationships'],
        },
        {
            title: 'Policy Changes That Matter',
            description:
                'Examining recent policy changes in criminal justice and their real-world impact.',
            youtubeId: 'kJQP7kiw5Fk', // Placeholder - replace with actual educational content
            youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration: 1140, // 19 minutes
            topic: ContentTopic.CRIMINAL_JUSTICE_REFORM,
            status: ContentStatus.PUBLISHED,
            creatorId: creator1.creator!.id,
            showId: show1.id,
            tags: ['policy', 'reform', 'legislation', 'impact'],
        },
    ];

    // Create videos
    for (const videoData of videos) {
        await prisma.video.upsert({
            where: { youtubeId: videoData.youtubeId },
            update: {},
            create: {
                ...videoData,
                publishedAt: new Date(
                    Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
                ), // Random date within last 30 days
                thumbnailUrl: `https://img.youtube.com/vi/${videoData.youtubeId}/maxresdefault.jpg`,
            },
        });
    }

    // Create some sample blog posts
    const blogPosts = [
        {
            title: 'My Journey: From Prison to Purpose',
            content: `# My Journey: From Prison to Purpose

When I walked out of prison after serving 8 years, I thought the hardest part was behind me. I was wrong. The real challenge was just beginning.

## The Reality of Reentry

Reentry isn't just about finding a job or a place to live. It's about rebuilding your entire identity. For years, I was defined by my mistakes, my crimes, my prisoner number. Now I had to figure out who I was beyond those walls.

## Finding Support

The H3 Network became my lifeline. Here, I found people who understood my struggles because they had walked the same path. I learned that:

- Recovery is a daily choice
- Community support is essential
- Everyone deserves a second chance
- Your past doesn't define your future

## Moving Forward

Today, I'm not just a formerly incarcerated person – I'm a father, a mentor, an advocate. I share my story not for sympathy, but to show others that transformation is possible.

If you're struggling with reentry, addiction, or just feeling lost, know that you're not alone. We're here to support each other on this journey.`,
            excerpt:
                'A personal story of transformation from incarceration to purpose, and the power of community support in the reentry process.',
            topic: ContentTopic.REENTRY,
            status: ContentStatus.PUBLISHED,
            creatorId: creator1.creator!.id,
            tags: ['personal story', 'reentry', 'transformation', 'community'],
        },
        {
            title: "Understanding Addiction: It's Not a Choice",
            content: `# Understanding Addiction: It's Not a Choice

One of the biggest misconceptions about addiction is that it's a moral failing or a lack of willpower. As someone who has worked in addiction recovery for over 10 years, I can tell you that addiction is a complex disease that affects the brain.

## The Science Behind Addiction

Addiction changes the brain's reward system, making it extremely difficult to stop using substances even when someone wants to quit. This isn't about being weak – it's about brain chemistry.

## The Path to Recovery

Recovery is possible, but it requires:
- Professional treatment
- Community support
- Ongoing commitment
- Compassion from loved ones

## Breaking the Stigma

We need to stop criminalizing addiction and start treating it as the health issue it is. When we remove shame and stigma, people are more likely to seek help.

Remember: Recovery is not linear, and every person's journey is different. What matters is that we keep supporting each other along the way.`,
            excerpt:
                'Breaking down the misconceptions about addiction and explaining why treatment, not punishment, is the answer.',
            topic: ContentTopic.ADDICTION,
            status: ContentStatus.PUBLISHED,
            creatorId: creator2.creator!.id,
            tags: ['addiction', 'science', 'recovery', 'stigma', 'education'],
        },
    ];

    for (const blogData of blogPosts) {
        await prisma.blog.create({
            data: {
                ...blogData,
                publishedAt: new Date(
                    Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000
                ), // Random date within last 15 days
            },
        });
    }

    console.log('✅ Database seeded successfully!');
    console.log(`Created:`);
    console.log(`- 1 test viewer (test@h3network.org / password123)`);
    console.log(`- 2 creators`);
    console.log(`- 2 shows`);
    console.log(`- ${videos.length} videos`);
    console.log(`- ${blogPosts.length} blog posts`);
    console.log('');
    console.log('🧪 To test saved content:');
    console.log('1. Sign in with test@h3network.org / password123');
    console.log('2. Go to /videos and save some videos');
    console.log('3. Check /profile?tab=saved to see saved content');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
