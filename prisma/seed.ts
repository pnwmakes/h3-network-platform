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

    // Create super admin user
    const superAdminPassword = await bcrypt.hash('SuperAdmin123!', 12);

    const superAdmin = await prisma.user.upsert({
        where: { email: 'admin@h3network.org' },
        update: {},
        create: {
            email: 'admin@h3network.org',
            name: 'Super Admin',
            password: superAdminPassword,
            role: UserRole.SUPER_ADMIN,
        },
    });

    console.log('✅ Created super admin:', superAdmin.email);

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

    // Create Troy - temporary super admin for testing
    const troyPassword = await bcrypt.hash('TroyAdmin2024!', 12);

    const troyAdmin = await prisma.user.upsert({
        where: { email: 'troy@h3network.org' },
        update: {},
        create: {
            email: 'troy@h3network.org',
            name: 'Troy',
            password: troyPassword,
            role: UserRole.SUPER_ADMIN,
        },
    });

    console.log('✅ Created Troy admin:', troyAdmin.email);

    // Create sample creators with H3 Network-specific branding
    const creatorPassword = await bcrypt.hash('creator123', 12);

    const noah = await prisma.user.upsert({
        where: { email: 'noah@h3network.org' },
        update: {},
        create: {
            email: 'noah@h3network.org',
            name: 'Noah',
            password: creatorPassword,
            role: UserRole.SUPER_ADMIN,
            creator: {
                create: {
                    displayName: 'Noah',
                    bio: 'Co-founder of H3 Network. Sharing stories of hope and transformation through lived experience with the criminal justice system. Passionate about reentry support and second chances.',
                    showName: 'Noah & Rita Show',
                    avatarUrl: '/logos/H3 Logo.png',
                    isActive: true,
                },
            },
        },
        include: {
            creator: true,
        },
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
                    bio: 'Co-founder of H3 Network. Passionate advocate for criminal justice reform and reentry support through education and community building. Expert in addiction recovery programs.',
                    showName: 'Noah & Rita Show',
                    avatarUrl: '/logos/H3 Logo.png',
                    isActive: true,
                },
            },
        },
        include: {
            creator: true,
        },
    });

    const marcus = await prisma.user.upsert({
        where: { email: 'marcus@h3network.org' },
        update: {},
        create: {
            email: 'marcus@h3network.org',
            name: 'Marcus Johnson',
            password: creatorPassword,
            role: UserRole.CREATOR,
            creator: {
                create: {
                    displayName: 'Marcus Johnson',
                    bio: 'Former federal inmate turned advocate. Sharing the realities of reentry and building bridges between formerly incarcerated individuals and their communities.',
                    showName: 'Fresh Out Life',
                    avatarUrl: '/logos/H3 Logo.png',
                    isActive: true,
                },
            },
        },
        include: {
            creator: true,
        },
    });

    const sarah = await prisma.user.upsert({
        where: { email: 'sarah@h3network.org' },
        update: {},
        create: {
            email: 'sarah@h3network.org',
            name: 'Sarah Williams',
            password: creatorPassword,
            role: UserRole.CREATOR,
            creator: {
                create: {
                    displayName: 'Sarah Williams',
                    bio: 'Recovery advocate and counselor. 8 years in recovery, now helping others find hope and healing through evidence-based treatment and peer support.',
                    showName: 'Recovery Journeys',
                    avatarUrl: '/logos/H3 Logo.png',
                    isActive: true,
                },
            },
        },
        include: {
            creator: true,
        },
    });

    // Create shows with H3 Network branding
    const noahRitaShow = await prisma.show.upsert({
        where: { name: 'Noah & Rita Show' },
        update: {},
        create: {
            name: 'Noah & Rita Show',
            description:
                'The flagship show featuring honest conversations about reentry, addiction recovery, and criminal justice reform with Hope, Help, and Humor.',
            thumbnailUrl: '/logos/H3 Logo.png',
            isActive: true,
        },
    });

    const freshOutLife = await prisma.show.upsert({
        where: { name: 'Fresh Out Life' },
        update: {},
        create: {
            name: 'Fresh Out Life',
            description:
                'Real stories from people navigating life after incarceration, sharing practical advice and authentic experiences.',
            thumbnailUrl: '/logos/H3 Logo.png',
            isActive: true,
        },
    });

    const recoveryJourneys = await prisma.show.upsert({
        where: { name: 'Recovery Journeys' },
        update: {},
        create: {
            name: 'Recovery Journeys',
            description:
                'Personal stories of addiction recovery and healing, featuring expert guidance and peer support.',
            thumbnailUrl: '/logos/H3 Logo.png',
            isActive: true,
        },
    });

    await prisma.show.upsert({
        where: { name: 'Justice Talks' },
        update: {},
        create: {
            name: 'Justice Talks',
            description:
                'Conversations about criminal justice reform and policy change with advocates and experts.',
            thumbnailUrl: '/logos/H3 Logo.png',
            isActive: true,
        },
    });

    // Sample videos with H3 Network content
    const videos = [
        {
            title: 'Welcome to H3 Network: Hope, Help, and Humor',
            description:
                'Noah and Rita introduce the H3 Network mission and share their vision for supporting those affected by the criminal justice system through Hope, Help, and Humor.',
            youtubeId: 'dQw4w9WgXcQ',
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration: 1248, // 20:48
            topic: ContentTopic.GENERAL,
            status: ContentStatus.PUBLISHED,
            creatorId: noah.creator!.id,
            showId: noahRitaShow.id,
            tags: ['introduction', 'mission', 'hope', 'help', 'humor'],
            viewCount: 1250,
        },
        {
            title: 'Life After Prison: First 30 Days Home',
            description:
                'Marcus shares the real challenges of the first month after release - from finding housing to rebuilding relationships with family and community.',
            youtubeId: 'ScMzIvxBSi4',
            youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
            duration: 1890, // 31:30
            topic: ContentTopic.REENTRY,
            status: ContentStatus.PUBLISHED,
            creatorId: marcus.creator!.id,
            showId: freshOutLife.id,
            tags: ['reentry', 'housing', 'relationships', 'challenges'],
            viewCount: 892,
        },
        {
            title: 'Finding Your Why in Recovery',
            description:
                'Sarah discusses the importance of finding your personal motivation for recovery and how it can sustain you through the most difficult times.',
            youtubeId: 'astISOttCQ0',
            youtubeUrl: 'https://www.youtube.com/watch?v=astISOttCQ0',
            duration: 1456, // 24:16
            topic: ContentTopic.ADDICTION,
            status: ContentStatus.PUBLISHED,
            creatorId: sarah.creator!.id,
            showId: recoveryJourneys.id,
            tags: ['recovery', 'motivation', 'purpose', 'healing'],
            viewCount: 673,
        },
        {
            title: 'Overcoming Shame: A Conversation About Healing',
            description:
                'Noah and Rita have an honest conversation about dealing with shame and guilt, and how humor can be a powerful tool for healing from trauma.',
            youtubeId: 'oHg5SJYRHA0',
            youtubeUrl: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
            duration: 1623, // 27:03
            topic: ContentTopic.GENERAL,
            status: ContentStatus.PUBLISHED,
            creatorId: rita.creator!.id,
            showId: noahRitaShow.id,
            tags: ['shame', 'healing', 'mental health', 'humor'],
            viewCount: 1089,
        },
        {
            title: 'Job Hunting with a Record: Tips and Reality Check',
            description:
                'Marcus provides practical advice for finding employment after incarceration and addresses common misconceptions employers have about hiring formerly incarcerated individuals.',
            youtubeId: 'kJQP7kiw5Fk',
            youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
            duration: 1789, // 29:49
            topic: ContentTopic.REENTRY,
            status: ContentStatus.PUBLISHED,
            creatorId: marcus.creator!.id,
            showId: freshOutLife.id,
            tags: ['employment', 'job search', 'background check', 'practical'],
            viewCount: 756,
        },
        {
            title: 'Supporting a Loved One in Recovery',
            description:
                'Sarah offers guidance for family members and friends who want to support someone in recovery without enabling destructive behaviors.',
            youtubeId: 'YQHsXMglC9A',
            youtubeUrl: 'https://www.youtube.com/watch?v=YQHsXMglC9A',
            duration: 1345, // 22:25
            topic: ContentTopic.ADDICTION,
            status: ContentStatus.PUBLISHED,
            creatorId: sarah.creator!.id,
            showId: recoveryJourneys.id,
            tags: ['family', 'support', 'boundaries', 'enabling'],
            viewCount: 523,
        },
        {
            title: 'The Power of Second Chances: Community Impact',
            description:
                'Rita explores how giving people second chances benefits entire communities and breaks cycles of incarceration and addiction.',
            youtubeId: 'RgKAFK5djSk',
            youtubeUrl: 'https://www.youtube.com/watch?v=RgKAFK5djSk',
            duration: 1987, // 33:07
            topic: ContentTopic.CRIMINAL_JUSTICE_REFORM,
            status: ContentStatus.PUBLISHED,
            creatorId: rita.creator!.id,
            showId: noahRitaShow.id,
            tags: ['second chances', 'community', 'prevention', 'impact'],
            viewCount: 734,
        },
        {
            title: 'Building Support Networks in Recovery',
            description:
                'Sarah and Marcus discuss the importance of building strong support networks and finding your tribe in recovery and reentry.',
            youtubeId: 'WxnN4mKSC7I',
            youtubeUrl: 'https://www.youtube.com/watch?v=WxnN4mKSC7I',
            duration: 1654, // 27:34
            topic: ContentTopic.GENERAL,
            status: ContentStatus.PUBLISHED,
            creatorId: sarah.creator!.id,
            showId: recoveryJourneys.id,
            tags: ['support', 'community', 'recovery', 'relationships'],
            viewCount: 445,
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

    // Create some sample blog posts with H3 Network themes
    const blogPosts = [
        {
            title: 'My First Week Home: A Reentry Story',
            content: `# My First Week Home: A Reentry Story

The door closed behind me, and for the first time in years, I was truly free. But freedom, I quickly learned, comes with its own set of challenges.

## The Reality Check

After spending three years in federal prison, walking out those doors should have felt like the happiest moment of my life. Instead, I felt overwhelmed, anxious, and completely unprepared for the world that had moved on without me.

Technology had advanced. My old phone was obsolete. My driver's license had expired. Even simple tasks like using a credit card reader at the grocery store felt foreign and intimidating.

## The Practical Challenges

The first week was a whirlwind of appointments:
- Parole officer meetings
- Job interviews  
- Trying to find housing
- Rebuilding credit
- Getting identification documents

Everyone wanted documentation I didn't have, references I couldn't provide, and explanations for gaps in my resume that I was ashamed to give.

## Finding Hope

But here's what I learned: reentry isn't just about the formerly incarcerated person. It's about communities, families, and support systems coming together. The organizations that helped me - from halfway houses to employment programs - they understood that successful reentry benefits everyone.

## Moving Forward

If you're about to come home, know this: it's going to be hard, but it's not impossible. Take it one day at a time, accept help when it's offered, and remember that your past doesn't define your future.

If you're supporting someone coming home, the best thing you can do is listen without judgment and help them navigate the practical challenges of rebuilding their life.

Reentry is not just a second chance - it's a chance to build something better than what came before.`,
            excerpt:
                'After spending three years in federal prison, walking out those doors should have felt like the happiest moment of my life. Instead, I felt overwhelmed, anxious, and completely unprepared for the world that had moved on without me.',
            topic: ContentTopic.REENTRY,
            status: ContentStatus.PUBLISHED,
            creatorId: marcus.creator!.id,
            tags: ['reentry', 'personal story', 'challenges', 'hope'],
            viewCount: 432,
        },
        {
            title: 'The Role of Humor in Healing Trauma',
            content: `# The Role of Humor in Healing Trauma

People often ask us why "humor" is part of the H3 Network mission. Isn't trauma supposed to be serious? Shouldn't we treat these heavy topics with the gravity they deserve?

## Understanding Healing Humor

The answer is yes - and humor helps us do exactly that.

When we laugh together, we're not minimizing pain or making light of serious issues. We're acknowledging our shared humanity. We're saying, "I see you, I understand you, and despite everything we've been through, we can still find moments of joy."

## My Journey with Humor

Humor has been my lifeline through some of the darkest moments. It's not about telling jokes or being the class clown. It's about finding the absurd in the awful, the light in the darkness, the human connection that reminds us we're not alone.

In difficult times, humor was survival. It was how we maintained our dignity when circumstances tried to strip it away. It was how we built relationships across different backgrounds. It was how we reminded ourselves that we were more than our worst moments.

## Humor as Medicine

In recovery and reentry, humor is healing. It's how we:
- Process trauma without being consumed by it
- Connect with others who've walked similar paths  
- Model resilience for our families and communities
- Find strength to keep going when times get tough

## The Important Distinction

But here's the important part: our humor comes from our own experience. We're not laughing at people who are struggling - we're laughing with them, because we've been there too.

## A Message of Hope

If you're in the middle of your own struggle right now, I'm not asking you to laugh. I'm asking you to stay open to the possibility that someday, you might find reasons to smile again. And when that day comes, you'll understand why humor is such a powerful force for healing.

Because sometimes, the bravest thing you can do is laugh in the face of adversity.`,
            excerpt:
                'People often ask us why "humor" is part of the H3 Network mission. When we laugh together, we\'re not minimizing pain - we\'re acknowledging our shared humanity.',
            topic: ContentTopic.GENERAL,
            status: ContentStatus.PUBLISHED,
            creatorId: rita.creator!.id,
            tags: ['humor', 'healing', 'trauma', 'resilience'],
            viewCount: 678,
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

    console.log('✅ H3 Network database seeded successfully!');
    console.log(`Created:`);
    console.log(`- 1 super admin (admin@h3network.org / SuperAdmin123!)`);
    console.log(`- 1 Troy admin (troy@h3network.org / TroyAdmin2024!)`);
    console.log(`- 1 test viewer (test@h3network.org / password123)`);
    console.log(`- 4 H3 Network creators (Noah, Rita, Marcus, Sarah)`);
    console.log(
        `- 4 shows (Noah & Rita Show, Fresh Out Life, Recovery Journeys, Justice Talks)`
    );
    console.log(
        `- ${videos.length} sample videos with realistic H3 Network content`
    );
    console.log(`- ${blogPosts.length} blog posts with authentic stories`);
    console.log('');
    console.log('🧪 To test the platform:');
    console.log('1. Super Admin: admin@h3network.org / SuperAdmin123!');
    console.log('2. Troy Admin: troy@h3network.org / TroyAdmin2024!');
    console.log('3. Test Viewer: test@h3network.org / password123');
    console.log('3. Browse videos and creators');
    console.log('4. Save content and check /profile?tab=saved');
    console.log(
        '5. Creators: noah@h3network.org, rita@h3network.org, etc. (creator123)'
    );
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
