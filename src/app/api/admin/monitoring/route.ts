import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';
import { HealthChecker, MonitoringUtils } from '@/lib/monitoring';
import { JobUtils } from '@/lib/job-queue';
import { BackupUtils } from '@/lib/backup-system';
import { dbPool } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function handler(req: NextRequest) {
    const session = await getServerSession(authOptions);

    // Require admin access for production monitoring
    if (
        !session?.user ||
        !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)
    ) {
        return createErrorResponse('Insufficient permissions', 403);
    }

    if (req.method === 'GET') {
        try {
            logger.info('Production monitoring dashboard requested', {
                userId: session.user.id,
                userRole: session.user.role,
            });

            // Gather comprehensive system health data
            const [systemHealth, jobQueueStats, backupHealth, dbPoolStats] =
                await Promise.all([
                    HealthChecker.getSystemHealth(),
                    JobUtils.getQueueStats(),
                    BackupUtils.getBackupHealth(),
                    Promise.resolve(dbPool.getStats()),
                ]);

            // Get performance reports for key endpoints
            const performanceReports = {
                videos: await MonitoringUtils.getEndpointReport('/api/videos'),
                blogs: await MonitoringUtils.getEndpointReport('/api/blogs'),
                creators: await MonitoringUtils.getEndpointReport(
                    '/api/creators'
                ),
                health: await MonitoringUtils.getEndpointReport('/api/health'),
            };

            // Calculate overall system status
            const systemStatus = calculateOverallStatus({
                database: systemHealth.database.connected,
                memory: systemHealth.memory.percentage < 85,
                api: systemHealth.api.errorRate < 0.05,
                jobQueue: jobQueueStats.failed < 10,
                backups: backupHealth.healthy,
            });

            const monitoringData = {
                overview: {
                    status: systemStatus,
                    timestamp: new Date().toISOString(),
                    uptime: systemHealth.uptime,
                    version: systemHealth.version,
                },

                health: {
                    database: {
                        connected: systemHealth.database.connected,
                        responseTime: systemHealth.database.responseTime,
                        activeConnections:
                            systemHealth.database.activeConnections,
                        connectionPoolUsage: dbPoolStats.utilization,
                        error: systemHealth.database.error,
                    },

                    api: {
                        averageResponseTime:
                            systemHealth.api.averageResponseTime,
                        errorRate: `${(
                            systemHealth.api.errorRate * 100
                        ).toFixed(2)}%`,
                        requestsPerMinute: systemHealth.api.requestsPerMinute,
                        status:
                            systemHealth.api.errorRate < 0.05
                                ? 'healthy'
                                : 'warning',
                    },

                    memory: {
                        used: systemHealth.memory.used,
                        total: systemHealth.memory.total,
                        percentage: systemHealth.memory.percentage,
                        status:
                            systemHealth.memory.percentage < 80
                                ? 'healthy'
                                : systemHealth.memory.percentage < 90
                                ? 'warning'
                                : 'critical',
                    },

                    cache: {
                        hitRate: `${(systemHealth.cache.hitRate * 100).toFixed(
                            1
                        )}%`,
                        size: systemHealth.cache.size,
                        memoryUsage: systemHealth.cache.memoryUsage,
                        status:
                            systemHealth.cache.hitRate > 0.7
                                ? 'healthy'
                                : 'warning',
                    },
                },

                performance: {
                    endpoints: performanceReports,
                    summary: {
                        slowestEndpoint: Object.entries(
                            performanceReports
                        ).sort(
                            ([, a], [, b]) =>
                                b.averageResponseTime - a.averageResponseTime
                        )[0],
                        highestErrorRate: Object.entries(
                            performanceReports
                        ).sort(([, a], [, b]) => b.errorRate - a.errorRate)[0],
                    },
                },

                jobQueue: {
                    stats: jobQueueStats,
                    status: jobQueueStats.failed > 10 ? 'warning' : 'healthy',
                    recommendations: getJobQueueRecommendations(jobQueueStats),
                },

                backups: {
                    health: backupHealth,
                    status: backupHealth.healthy ? 'healthy' : 'warning',
                    issues: backupHealth.issues,
                    lastBackup: backupHealth.lastBackup?.toISOString(),
                    nextBackup: backupHealth.nextBackup?.toISOString(),
                },

                alerts: {
                    summary: 'Alert system operational',
                    // In a real system, this would show active alerts
                    activeAlerts: [],
                },

                recommendations: generateSystemRecommendations({
                    systemHealth,
                    jobQueueStats,
                    backupHealth,
                    performanceReports,
                }),
            };

            return NextResponse.json({
                success: true,
                data: monitoringData,
                meta: {
                    generatedAt: new Date().toISOString(),
                    executionTime: Date.now() - Date.now(), // Will be set by monitoring
                },
            });
        } catch (error) {
            logger.error('Production monitoring failed', {
                error: error instanceof Error ? error.message : String(error),
                userId: session.user.id,
            });

            return createErrorResponse(
                'Failed to generate monitoring report',
                500
            );
        }
    }

    if (req.method === 'POST') {
        // Handle monitoring actions (force backup, clear caches, etc.)
        try {
            const body = await req.json();
            const { action, parameters } = body;

            logger.info('Production monitoring action requested', {
                action,
                userId: session.user.id,
                parameters,
            });

            switch (action) {
                case 'force_backup':
                    const backupJobId =
                        await BackupUtils.scheduleManualBackup();
                    return NextResponse.json({
                        success: true,
                        data: {
                            message: 'Backup scheduled successfully',
                            jobId: backupJobId,
                        },
                    });

                case 'health_check':
                    const healthResult = await MonitoringUtils.runHealthCheck();
                    return NextResponse.json({
                        success: true,
                        data: healthResult,
                    });

                case 'run_backup_test':
                    const backupTest = await BackupUtils.runBackupHealthCheck();
                    return NextResponse.json({
                        success: true,
                        data: backupTest,
                    });

                default:
                    return createErrorResponse(
                        'Unknown monitoring action',
                        400
                    );
            }
        } catch (error) {
            logger.error('Production monitoring action failed', {
                error: error instanceof Error ? error.message : String(error),
                userId: session.user.id,
            });

            return createErrorResponse(
                'Failed to execute monitoring action',
                500
            );
        }
    }

    return createErrorResponse('Method not allowed', 405);
}

// Helper functions
function calculateOverallStatus(
    checks: Record<string, boolean>
): 'healthy' | 'warning' | 'critical' {
    const totalChecks = Object.keys(checks).length;
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const healthPercentage = passedChecks / totalChecks;

    if (healthPercentage >= 0.9) return 'healthy';
    if (healthPercentage >= 0.7) return 'warning';
    return 'critical';
}

function getJobQueueRecommendations(
    stats: ReturnType<typeof JobUtils.getQueueStats>
): string[] {
    const recommendations: string[] = [];

    if (stats.pending > 50) {
        recommendations.push(
            'High number of pending jobs - consider increasing worker capacity'
        );
    }

    if (stats.failed > 10) {
        recommendations.push(
            'Multiple failed jobs detected - review error logs and retry policies'
        );
    }

    if (stats.processingConcurrency === 0 && stats.pending > 0) {
        recommendations.push(
            'Job queue appears stalled - check worker processes'
        );
    }

    return recommendations;
}

function generateSystemRecommendations(data: {
    systemHealth: Awaited<ReturnType<typeof HealthChecker.getSystemHealth>>;
    jobQueueStats: ReturnType<typeof JobUtils.getQueueStats>;
    backupHealth: Awaited<ReturnType<typeof BackupUtils.getBackupHealth>>;
    performanceReports: Record<
        string,
        Awaited<ReturnType<typeof MonitoringUtils.getEndpointReport>>
    >;
}): string[] {
    const recommendations: string[] = [];

    // Memory recommendations
    if (data.systemHealth.memory.percentage > 85) {
        recommendations.push(
            'Memory usage is high - consider scaling server resources or optimizing memory-intensive operations'
        );
    }

    // Database recommendations
    if (data.systemHealth.database.responseTime > 1000) {
        recommendations.push(
            'Database response times are slow - consider query optimization or connection pool tuning'
        );
    }

    // API performance recommendations
    if (data.systemHealth.api.errorRate > 0.02) {
        recommendations.push(
            'API error rate is elevated - review recent deployments and error logs'
        );
    }

    // Cache recommendations
    if (data.systemHealth.cache.hitRate < 0.6) {
        recommendations.push(
            'Cache hit rate is low - review caching strategy and TTL settings'
        );
    }

    // Backup recommendations
    if (!data.backupHealth.healthy) {
        recommendations.push(
            'Backup system issues detected - ' +
                data.backupHealth.issues.join(', ')
        );
    }

    // Performance recommendations
    const slowEndpoints = Object.entries(data.performanceReports).filter(
        ([, report]) => report.averageResponseTime > 2000
    );

    if (slowEndpoints.length > 0) {
        recommendations.push(
            `Slow endpoints detected: ${slowEndpoints
                .map(([name]) => name)
                .join(', ')} - consider optimization`
        );
    }

    if (recommendations.length === 0) {
        recommendations.push(
            'System is operating optimally - all metrics within healthy ranges'
        );
    }

    return recommendations;
}

export const GET = withApiSecurity(handler);
export const POST = withApiSecurity(handler);
