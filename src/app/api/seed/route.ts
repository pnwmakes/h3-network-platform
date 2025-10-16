import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole, ContentStatus, ContentTopic } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function POST() {
    try {
        console.log('🌱 Starting H3 Network database seeding...');

        // Create test viewer
        const viewerPassword = await bcrypt.hash('password123', 12);
        await prisma.user.upsert({
            where: { email: 'test@h3network.org' },
            update: {},
            create: {
                email: 'test@h3network.org',
                name: 'Test Viewer',
                password: viewerPassword,
                role: UserRole.VIEWER,
            },
        });

        // Create H3 Network creators and super admins
        const superAdminPassword = await bcrypt.hash('superadmin123', 12);

        // Create super admin (James)
        await prisma.user.upsert({
            where: { email: 'james@h3network.org' },
            update: {},
            create: {
                email: 'james@h3network.org',
                name: 'James',
                password: superAdminPassword,
                role: UserRole.SUPER_ADMIN,
                emailVerified: new Date(),
            },
        });

        const noah = await prisma.user.upsert({
            where: { email: 'noah@h3network.org' },
            update: {},
            create: {
                email: 'noah@h3network.org',
                name: 'Noah',
                password: superAdminPassword,
                role: UserRole.SUPER_ADMIN,
                emailVerified: new Date(),
                creator: {
                    create: {
                        displayName: 'Noah',
                        bio: 'Co-founder of H3 Network. Sharing stories of hope and transformation through lived experience with the criminal justice system.',
                        showName: 'Noah & Rita Show',
                        avatarUrl: '/logos/H3 Logo.png',
                        funnyFact:
                            'Once accidentally ordered 50 pizzas instead of 5 during a community event!',
                        linkedinUrl: 'https://linkedin.com/in/noah-h3network',
                        profileComplete: true,
                        isActive: true,
                    },
                },
            },
            include: { creator: true },
        });

        const rita = await prisma.user.upsert({
            where: { email: 'rita@h3network.org' },
            update: {},
            create: {
                email: 'rita@h3network.org',
                name: 'Rita',
                password: superAdminPassword,
                role: UserRole.SUPER_ADMIN,
                emailVerified: new Date(),
                creator: {
                    create: {
                        displayName: 'Rita',
                        bio: 'Co-founder of H3 Network. Passionate advocate for criminal justice reform and reentry support through education and community.',
                        showName: 'Noah & Rita Show',
                        avatarUrl: '/logos/H3 Logo.png',
                        funnyFact:
                            'Has a secret talent for beatboxing that surprises everyone!',
                        instagramUrl: 'https://instagram.com/rita_h3network',
                        profileComplete: true,
                        isActive: true,
                    },
                },
            },
            include: { creator: true },
        });

        // Create shows
        const noahRitaShow = await prisma.show.upsert({
            where: { name: 'Noah & Rita Show' },
            update: {},
            create: {
                name: 'Noah & Rita Show',
                description:
                    'The flagship show featuring honest conversations about reentry, addiction recovery, and criminal justice reform.',
                thumbnailUrl: '/logos/H3 Logo.png',
                isActive: true,
            },
        });

        await prisma.show.upsert({
            where: { name: 'Fresh Out Life' },
            update: {},
            create: {
                name: 'Fresh Out Life',
                description:
                    'Real stories from people navigating life after incarceration.',
                thumbnailUrl: '/logos/H3 Logo.png',
                isActive: true,
            },
        });

        // Create sample videos
        const videos = [
            {
                title: 'Welcome to H3 Network: Hope, Help, and Humor',
                description:
                    'Noah and Rita introduce the H3 Network mission and share their vision for supporting those affected by the criminal justice system.',
                youtubeId: 'dQw4w9WgXcQ',
                youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                duration: 1248,
                topic: ContentTopic.GENERAL,
                status: ContentStatus.PUBLISHED,
                creatorId: noah.creator!.id,
                showId: noahRitaShow.id,
                tags: ['introduction', 'mission', 'hope', 'help', 'humor'],
                viewCount: 1250,
                // New template fields
                showName: 'Noah & Rita Show',
                seasonNumber: 1,
                episodeNumber: 1,
                guestNames: [],
                guestBios: [],
                sponsorNames: ['H3 Network Foundation'],
                sponsorMessages: [
                    'Supporting hope, help, and humor in criminal justice reform.',
                ],
                contentTopics: [
                    'Mission',
                    'Introduction',
                    'Community Building',
                ],
            },
            {
                title: 'Overcoming Shame: A Conversation About Healing',
                description:
                    'Noah and Rita have an honest conversation about dealing with shame and guilt, and how humor can be a tool for healing.',
                youtubeId: 'ScMzIvxBSi4',
                youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
                duration: 1623,
                topic: ContentTopic.GENERAL,
                status: ContentStatus.PUBLISHED,
                creatorId: rita.creator!.id,
                showId: noahRitaShow.id,
                tags: ['shame', 'healing', 'mental health', 'humor'],
                viewCount: 1089,
                // New template fields
                showName: 'Noah & Rita Show',
                seasonNumber: 1,
                episodeNumber: 2,
                guestNames: ['Dr. Sarah Mitchell'],
                guestBios: [
                    'Licensed therapist specializing in trauma recovery and shame resilience.',
                ],
                sponsorNames: [],
                sponsorMessages: [],
                contentTopics: ['Mental Health', 'Healing', 'Shame Resilience'],
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
                    ),
                    thumbnailUrl: `https://img.youtube.com/vi/${videoData.youtubeId}/maxresdefault.jpg`,
                },
            });
        }

        // Create sample blogs
        const blogs = [
            {
                title: 'Finding Your Voice: A Guide to Advocacy',
                content: `# Finding Your Voice: A Guide to Advocacy

Starting your journey as an advocate can feel overwhelming, but every voice matters in the fight for criminal justice reform. Here's how to begin:

## 1. Start with Your Story
Your lived experience is your greatest asset. Don't underestimate the power of sharing what you've been through.

## 2. Connect with Others
Find local organizations and support groups. The strength is in numbers, and community amplifies individual voices.

## 3. Learn the Landscape
Understanding policy, legislation, and current reform efforts helps you advocate more effectively.

## 4. Take Action
Whether it's writing letters, attending meetings, or sharing your story, every action contributes to change.

Remember: Your voice has the power to create real change in someone else's life.`,
                excerpt:
                    'Starting your journey as an advocate can feel overwhelming, but every voice matters in the fight for criminal justice reform.',
                status: ContentStatus.PUBLISHED,
                creatorId: noah.creator!.id,
                tags: ['advocacy', 'reform', 'voice', 'community'],
                readTime: 5,
                // New template fields
                guestContributors: ['Community Advocate Maria Lopez'],
                guestBios: [
                    'Maria has been advocating for criminal justice reform for over 8 years and leads a local support group.',
                ],
                sponsorNames: [],
                sponsorMessages: [],
                contentTopics: [
                    'Advocacy',
                    'Personal Empowerment',
                    'Community Building',
                ],
            },
            {
                title: 'The Power of Humor in Healing',
                content: `# The Power of Humor in Healing

Laughter might seem inappropriate when discussing serious topics like incarceration and recovery, but humor can be a powerful tool for healing and connection.

## Why Humor Helps
- **Stress Relief**: Laughter literally changes our brain chemistry
- **Connection**: Shared humor builds bonds and reduces isolation
- **Perspective**: Humor can help us see situations from new angles
- **Resilience**: Finding lightness in dark times builds emotional strength

## Finding the Balance
It's important to use humor respectfully and appropriately. The goal isn't to minimize serious issues but to find moments of lightness that help us cope and connect.

## Our Approach at H3
At H3 Network, we believe in the transformative power of hope, help, and humor. We've seen how laughter can break down barriers and create space for difficult conversations.`,
                excerpt:
                    'Laughter might seem inappropriate when discussing serious topics, but humor can be a powerful tool for healing and connection.',
                status: ContentStatus.PUBLISHED,
                creatorId: rita.creator!.id,
                tags: ['humor', 'healing', 'mental health', 'resilience'],
                readTime: 4,
                // New template fields
                guestContributors: [],
                guestBios: [],
                sponsorNames: ['Mental Health First Aid'],
                sponsorMessages: [
                    'Supporting mental wellness through education and community resources.',
                ],
                contentTopics: ['Mental Health', 'Healing', 'Humor Therapy'],
            },
        ];

        // Create blogs
        for (const blogData of blogs) {
            await prisma.blog.create({
                data: {
                    ...blogData,
                    publishedAt: new Date(
                        Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000
                    ),
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'H3 Network database seeded successfully!',
            created: {
                users: 2,
                creators: 2,
                shows: 2,
                videos: videos.length,
                blogs: blogs.length,
            },
        });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
