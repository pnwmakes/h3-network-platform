import { NextRequest } from 'next/server';
import {
    withApiSecurity,
    createErrorResponse,
} from '@/lib/security';
import { createSuccessResponse, withPerformanceHeaders } from '@/lib/api-response';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';
import { cache } from '@/lib/cache';

async function handler(req: NextRequest) {
    if (req.method !== 'GET') {
        return createErrorResponse('Method not allowed', 405);
    }

    const startTime = Date.now();
    const checks: Record<
        string,
        { status: 'ok' | 'error'; responseTime?: number; error?: string }
    > = {};

    // Check database connection
    try {
        const dbStart = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        checks.database = {
            status: 'ok',
            responseTime: Date.now() - dbStart,
        };
    } catch (error) {
        checks.database = {
            status: 'error',
            error:
                error instanceof Error
                    ? error.message
                    : 'Unknown database error',
        };
        logger.dbError('Health check', error as Error);
    }

    // Check environment variables
    try {
        const requiredEnvVars = [
            'DATABASE_URL',
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL',
        ];
        const missingVars = requiredEnvVars.filter(
            (varName) => !process.env[varName]
        );

        if (missingVars.length > 0) {
            checks.environment = {
                status: 'error',
                error: `Missing environment variables: ${missingVars.join(
                    ', '
                )}`,
            };
        } else {
            checks.environment = { status: 'ok' };
        }
    } catch {
        checks.environment = {
            status: 'error',
            error: 'Environment check failed',
        };
    }

    // Overall health status
    const allChecksOk = Object.values(checks).every(
        (check) => check.status === 'ok'
    );
    const overallStatus = allChecksOk ? 'healthy' : 'unhealthy';
    const totalResponseTime = Date.now() - startTime;

    const healthData = {
        status: overallStatus,
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: env.NODE_ENV,
        uptime: process.uptime(),
        responseTime: totalResponseTime,
        checks,
        cache: {
            stats: cache.getStats(),
        },
        ...(env.NODE_ENV !== 'production' && {
            nodeVersion: process.version,
            platform: process.platform,
            arch: process.arch,
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
            },
        }),
    };

    // Log health check
    logger.info('Health check performed', {
        status: overallStatus,
        responseTime: totalResponseTime,
        checks: Object.keys(checks).length,
    });

    // Return appropriate status code with enhanced response
    if (!allChecksOk) {
        return createErrorResponse('Service unhealthy', 503);
    }
    
    const response = createSuccessResponse(healthData, undefined, { 
        executionTime: totalResponseTime 
    });
    
    return withPerformanceHeaders(response, totalResponseTime, false);
}

export const GET = withApiSecurity(handler);
