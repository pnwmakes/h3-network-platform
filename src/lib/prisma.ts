import { PrismaClient } from '@prisma/client';
import { isDev, isProd } from './env';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Create Prisma client with production-optimized configuration
function createPrismaClient() {
    const client = new PrismaClient({
        log: isDev ? ['error', 'warn'] : ['error'],
        errorFormat: isProd ? 'minimal' : 'pretty',
    });

    return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!isProd) {
    globalForPrisma.prisma = prisma;
}

// Graceful shutdown
if (isProd) {
    process.on('beforeExit', async () => {
        await prisma.$disconnect();
    });
}
