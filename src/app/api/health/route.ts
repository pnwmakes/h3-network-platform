import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';
import { env } from '@/lib/env';
import { HealthChecker, MonitoringUtils } from '@/lib/monitoring';

async function handler(req: NextRequest) {
    if (req.method !== 'GET') {
        return createErrorResponse('Method not allowed', 405);
    }

    const startTime = Date.now();

    try {
        // Use new comprehensive health checker
        const health = await HealthChecker.getSystemHealth();

        // Environment check
        const requiredEnvVars = [
            'DATABASE_URL',
            'NEXTAUTH_SECRET',
            'NEXTAUTH_URL',
        ];
        const missingVars = requiredEnvVars.filter(
            (varName) => !process.env[varName]
        );

        // Determine overall health
        const isHealthy =
            health.database.connected &&
            missingVars.length === 0 &&
            health.api.errorRate < 0.1 &&
            health.memory.percentage < 90;

        const overallStatus = isHealthy ? 'healthy' : 'unhealthy';
        const totalResponseTime = Date.now() - startTime;

        const healthData = {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0',
            environment: env.NODE_ENV,
            uptime: process.uptime(),
            responseTime: totalResponseTime,
            checks: {
                database: {
                    status: health.database.connected ? 'ok' : 'error',
                    responseTime: health.database.responseTime,
                    activeConnections: health.database.activeConnections,
                    error: health.database.error,
                },
                environment: {
                    status: missingVars.length === 0 ? 'ok' : 'error',
                    error:
                        missingVars.length > 0
                            ? `Missing environment variables: ${missingVars.join(
                                  ', '
                              )}`
                            : undefined,
                },
                api: {
                    status: health.api.errorRate < 0.05 ? 'ok' : 'warning',
                    averageResponseTime: health.api.averageResponseTime,
                    errorRate: health.api.errorRate,
                    requestsPerMinute: health.api.requestsPerMinute,
                },
                cache: {
                    status: health.cache.hitRate > 0.5 ? 'ok' : 'warning',
                    hitRate: health.cache.hitRate,
                    size: health.cache.size,
                    memoryUsage: health.cache.memoryUsage,
                },
                memory: {
                    status: health.memory.percentage < 80 ? 'ok' : 'warning',
                    used: health.memory.used,
                    total: health.memory.total,
                    percentage: health.memory.percentage,
                },
            },
            ...(env.NODE_ENV !== 'production' && {
                nodeVersion: process.version,
                platform: process.platform,
                arch: process.arch,
                detailed: {
                    fullHealthMetrics: health,
                    performanceReport: await MonitoringUtils.getEndpointReport(
                        '/api/videos'
                    ),
                },
            }),
        };

        // Log health check
        logger.info('Health check performed', {
            status: overallStatus,
            responseTime: totalResponseTime,
            dbConnected: health.database.connected,
            memoryUsage: health.memory.percentage,
            errorRate: health.api.errorRate,
        });

        // Return appropriate status code
        const statusCode = isHealthy ? 200 : 503;

        return NextResponse.json(healthData, {
            status: statusCode,
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'X-Health-Status': overallStatus,
                'X-Response-Time': totalResponseTime.toString(),
            },
        });
    } catch (error) {
        logger.error('Health check failed', {
            error: error instanceof Error ? error.message : String(error),
            responseTime: Date.now() - startTime,
        });

        return createErrorResponse('Health check failed', 500);
    }
}

export const GET = withApiSecurity(handler);
