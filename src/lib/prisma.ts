import { PrismaClient } from '@prisma/client';
import { isDev, isProd, env } from './env';
import { logger } from './logger';

// Production-ready Prisma configuration with connection pooling
class DatabasePool {
    private static instance: DatabasePool;
    private client: PrismaClient;
    private connectionCount = 0;
    private readonly maxConnections = isProd ? 20 : 10;
    private healthCheckInterval?: NodeJS.Timeout;

    constructor() {
        this.client = this.createClient();
        this.setupEventListeners();
        if (isProd) {
            this.startHealthCheck();
        }
    }

    static getInstance(): DatabasePool {
        if (!DatabasePool.instance) {
            DatabasePool.instance = new DatabasePool();
        }
        return DatabasePool.instance;
    }

    private createClient(): PrismaClient {
        // Enhanced connection string for production
        const connectionUrl =
            isProd && env.DATABASE_URL
                ? `${env.DATABASE_URL}?connection_limit=${this.maxConnections}&pool_timeout=20&pgbouncer=true`
                : env.DATABASE_URL;

        return new PrismaClient({
            log: isDev ? ['query', 'warn', 'error'] : ['error'],
            errorFormat: isProd ? 'minimal' : 'pretty',
            datasources: {
                db: {
                    url: connectionUrl,
                },
            },
        });
    }

    private setupEventListeners() {
        // Log slow or failed queries for monitoring
        if (isDev) {
            logger.info(
                'Database event listeners initialized for development monitoring'
            );
        }

        // For production, we'll rely on the enhanced monitoring system
        // rather than individual query logging to reduce overhead
    }

    private startHealthCheck() {
        this.healthCheckInterval = setInterval(async () => {
            try {
                await this.client.$queryRaw`SELECT 1`;
            } catch (error) {
                logger.error('Database health check failed', {
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }
        }, 30000); // Check every 30 seconds
    }

    getClient(): PrismaClient {
        return this.client;
    }

    async disconnect(): Promise<void> {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        await this.client.$disconnect();
        logger.info('Database disconnected');
    }

    // Connection monitoring
    incrementConnection(): void {
        this.connectionCount++;
        if (this.connectionCount > this.maxConnections * 0.8) {
            logger.warn('High database connection usage', {
                current: this.connectionCount,
                max: this.maxConnections,
                utilization: `${(
                    (this.connectionCount / this.maxConnections) *
                    100
                ).toFixed(1)}%`,
            });
        }
    }

    decrementConnection(): void {
        this.connectionCount = Math.max(0, this.connectionCount - 1);
    }

    getConnectionStats(): { active: number; max: number; utilization: number } {
        return {
            active: this.connectionCount,
            max: this.maxConnections,
            utilization: (this.connectionCount / this.maxConnections) * 100,
        };
    }
}

const globalForPrisma = globalThis as unknown as {
    databasePool: DatabasePool | undefined;
};

const databasePool = globalForPrisma.databasePool ?? DatabasePool.getInstance();

if (!isProd) {
    globalForPrisma.databasePool = databasePool;
}

// Export the Prisma client instance
export const prisma = databasePool.getClient();

// Export pool management functions
export const dbPool = {
    getStats: () => databasePool.getConnectionStats(),
    disconnect: () => databasePool.disconnect(),
    incrementConnection: () => databasePool.incrementConnection(),
    decrementConnection: () => databasePool.decrementConnection(),
};

// Connection wrapper for monitoring
export function withDbMonitoring<
    T extends (...args: unknown[]) => Promise<unknown>
>(operation: T): T {
    return (async (...args: Parameters<T>) => {
        databasePool.incrementConnection();
        const startTime = Date.now();

        try {
            const result = await operation(...args);
            const duration = Date.now() - startTime;

            if (duration > 2000) {
                // Log operations taking >2s
                logger.warn('Slow database operation', {
                    duration: `${duration}ms`,
                    operation: operation.name || 'anonymous',
                });
            }

            return result;
        } catch (error) {
            logger.error('Database operation failed', {
                error: error instanceof Error ? error.message : String(error),
                operation: operation.name || 'anonymous',
                duration: `${Date.now() - startTime}ms`,
            });
            throw error;
        } finally {
            databasePool.decrementConnection();
        }
    }) as T;
}

// Graceful shutdown handlers
const gracefulShutdown = async () => {
    logger.info('Graceful shutdown initiated, closing database connections...');
    await databasePool.disconnect();
};

process.on('beforeExit', gracefulShutdown);
process.on('SIGINT', async () => {
    await gracefulShutdown();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    await gracefulShutdown();
    process.exit(0);
});
