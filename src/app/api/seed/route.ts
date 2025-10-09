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

        // Create H3 Network creators
        const creatorPassword = await bcrypt.hash('creator123', 12);

        const noah = await prisma.user.upsert({
            where: { email: 'noah@h3network.org' },
            update: {},
            create: {
                email: 'noah@h3network.org',
                name: 'Noah',
                password: creatorPassword,
                role: UserRole.CREATOR,
                creator: {
                    create: {
                        displayName: 'Noah',
                        bio: 'Co-founder of H3 Network. Sharing stories of hope and transformation through lived experience with the criminal justice system.',
                        showName: 'Noah & Rita Show',
                        avatarUrl: '/h3-logos/h3-network-logo-badge.png',
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
                password: creatorPassword,
                role: UserRole.CREATOR,
                creator: {
                    create: {
                        displayName: 'Rita',
                        bio: 'Co-founder of H3 Network. Passionate advocate for criminal justice reform and reentry support through education and community.',
                        showName: 'Noah & Rita Show',
                        avatarUrl: '/h3-logos/h3-network-logo-badge.png',
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
                thumbnailUrl: '/h3-logos/h3-network-logo-main.png',
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
                thumbnailUrl: '/h3-logos/h3-network-logo-main.png',
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

        return NextResponse.json({
            success: true,
            message: 'H3 Network database seeded successfully!',
            created: {
                users: 2,
                creators: 2,
                shows: 2,
                videos: videos.length,
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
