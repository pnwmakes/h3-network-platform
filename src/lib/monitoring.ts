import { logger } from './logger';
import { prisma } from './prisma';
import { cache } from './cache';

// System health metrics
export interface HealthMetrics {
    timestamp: number;
    database: {
        connected: boolean;
        responseTime: number;
        activeConnections?: number;
        error?: string;
    };
    cache: {
        hitRate: number;
        size: number;
        memoryUsage: number;
    };
    api: {
        averageResponseTime: number;
        errorRate: number;
        requestsPerMinute: number;
    };
    memory: {
        used: number;
        total: number;
        percentage: number;
    };
    uptime: number;
    version: string;
}

// Performance tracking
class PerformanceTracker {
    private static instance: PerformanceTracker;
    private metrics: Map<string, number[]> = new Map();
    private errorCounts: Map<string, number> = new Map();
    private requestCounts: Map<string, number> = new Map();
    private readonly maxSamples = 100;

    static getInstance(): PerformanceTracker {
        if (!PerformanceTracker.instance) {
            PerformanceTracker.instance = new PerformanceTracker();
        }
        return PerformanceTracker.instance;
    }

    recordResponseTime(endpoint: string, duration: number): void {
        const key = `response_time:${endpoint}`;
        if (!this.metrics.has(key)) {
            this.metrics.set(key, []);
        }

        const samples = this.metrics.get(key)!;
        samples.push(duration);

        // Keep only recent samples
        if (samples.length > this.maxSamples) {
            samples.shift();
        }
    }

    recordError(endpoint: string): void {
        const key = `error:${endpoint}`;
        this.errorCounts.set(key, (this.errorCounts.get(key) || 0) + 1);
    }

    recordRequest(endpoint: string): void {
        const key = `request:${endpoint}`;
        this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);
    }

    getAverageResponseTime(endpoint?: string): number {
        if (endpoint) {
            const samples = this.metrics.get(`response_time:${endpoint}`) || [];
            return samples.length > 0
                ? samples.reduce((a, b) => a + b, 0) / samples.length
                : 0;
        }

        // Get overall average
        let totalTime = 0;
        let totalSamples = 0;

        for (const [key, samples] of this.metrics.entries()) {
            if (key.startsWith('response_time:')) {
                totalTime += samples.reduce((a, b) => a + b, 0);
                totalSamples += samples.length;
            }
        }

        return totalSamples > 0 ? totalTime / totalSamples : 0;
    }

    getErrorRate(endpoint?: string): number {
        if (endpoint) {
            const errors = this.errorCounts.get(`error:${endpoint}`) || 0;
            const requests = this.requestCounts.get(`request:${endpoint}`) || 0;
            return requests > 0 ? errors / requests : 0;
        }

        // Get overall error rate
        let totalErrors = 0;
        let totalRequests = 0;

        for (const count of this.errorCounts.values()) {
            totalErrors += count;
        }

        for (const count of this.requestCounts.values()) {
            totalRequests += count;
        }

        return totalRequests > 0 ? totalErrors / totalRequests : 0;
    }

    getRequestsPerMinute(): number {
        // Simplified - in production you'd track time windows
        let totalRequests = 0;
        for (const count of this.requestCounts.values()) {
            totalRequests += count;
        }

        return totalRequests; // Simplified calculation
    }

    reset(): void {
        this.metrics.clear();
        this.errorCounts.clear();
        this.requestCounts.clear();
    }
}

// Health check functions
export class HealthChecker {
    static async checkDatabase(): Promise<{
        connected: boolean;
        responseTime: number;
        activeConnections?: number;
        error?: string;
    }> {
        const startTime = Date.now();

        try {
            // Simple connection test
            await prisma.$queryRaw`SELECT 1`;

            // Check active connections (PostgreSQL specific)
            const connections = await prisma.$queryRaw<
                Array<{ count: bigint }>
            >`
                SELECT count(*) FROM pg_stat_activity WHERE state = 'active'
            `;

            return {
                connected: true,
                responseTime: Date.now() - startTime,
                activeConnections: Number(connections[0]?.count || 0),
            };
        } catch (error) {
            return {
                connected: false,
                responseTime: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    static async checkCache(): Promise<{
        hitRate: number;
        size: number;
        memoryUsage: number;
    }> {
        try {
            const stats = cache.getStats();
            const memoryUsage = process.memoryUsage();

            return {
                hitRate:
                    stats.hits + stats.misses > 0
                        ? stats.hits / (stats.hits + stats.misses)
                        : 0,
                size: stats.size,
                memoryUsage: memoryUsage.heapUsed / 1024 / 1024, // MB
            };
        } catch {
            return {
                hitRate: 0,
                size: 0,
                memoryUsage: 0,
            };
        }
    }

    static getMemoryMetrics(): {
        used: number;
        total: number;
        percentage: number;
    } {
        const usage = process.memoryUsage();
        const totalMemory = usage.heapTotal;
        const usedMemory = usage.heapUsed;

        return {
            used: Math.round(usedMemory / 1024 / 1024), // MB
            total: Math.round(totalMemory / 1024 / 1024), // MB
            percentage: Math.round((usedMemory / totalMemory) * 100),
        };
    }

    static async getSystemHealth(): Promise<HealthMetrics> {
        const tracker = PerformanceTracker.getInstance();
        const [dbHealth, cacheHealth] = await Promise.all([
            this.checkDatabase(),
            this.checkCache(),
        ]);

        return {
            timestamp: Date.now(),
            database: dbHealth,
            cache: cacheHealth,
            api: {
                averageResponseTime: tracker.getAverageResponseTime(),
                errorRate: tracker.getErrorRate(),
                requestsPerMinute: tracker.getRequestsPerMinute(),
            },
            memory: this.getMemoryMetrics(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
        };
    }
}

// Alert system
export class AlertManager {
    private static instance: AlertManager;
    private alertThresholds = {
        responseTime: 2000, // 2 seconds
        errorRate: 0.05, // 5%
        memoryUsage: 80, // 80%
        dbResponseTime: 1000, // 1 second
        cacheHitRate: 0.5, // 50%
    };

    static getInstance(): AlertManager {
        if (!AlertManager.instance) {
            AlertManager.instance = new AlertManager();
        }
        return AlertManager.instance;
    }

    async checkAlerts(metrics: HealthMetrics): Promise<void> {
        const alerts: string[] = [];

        // Database alerts
        if (!metrics.database.connected) {
            alerts.push('🔴 DATABASE OFFLINE - Immediate attention required');
        } else if (
            metrics.database.responseTime > this.alertThresholds.dbResponseTime
        ) {
            alerts.push(
                `⚠️ Database slow response: ${metrics.database.responseTime}ms`
            );
        }

        // API Performance alerts
        if (
            metrics.api.averageResponseTime > this.alertThresholds.responseTime
        ) {
            alerts.push(
                `⚠️ API response time high: ${metrics.api.averageResponseTime}ms`
            );
        }

        if (metrics.api.errorRate > this.alertThresholds.errorRate) {
            alerts.push(
                `🔴 High error rate: ${(metrics.api.errorRate * 100).toFixed(
                    2
                )}%`
            );
        }

        // Memory alerts
        if (metrics.memory.percentage > this.alertThresholds.memoryUsage) {
            alerts.push(`⚠️ High memory usage: ${metrics.memory.percentage}%`);
        }

        // Cache alerts
        if (metrics.cache.hitRate < this.alertThresholds.cacheHitRate) {
            alerts.push(
                `⚠️ Low cache hit rate: ${(metrics.cache.hitRate * 100).toFixed(
                    1
                )}%`
            );
        }

        // Log alerts
        if (alerts.length > 0) {
            logger.warn('System alerts detected', {
                alertCount: alerts.length,
                alertsList: alerts.join(', '),
                timestamp: metrics.timestamp,
            });

            // In production, you'd send these to your alerting service
            // (Slack, PagerDuty, email, etc.)
            await this.sendAlerts(alerts, metrics);
        }
    }

    private async sendAlerts(
        alerts: string[],
        metrics: HealthMetrics
    ): Promise<void> {
        // This is where you'd integrate with your alerting service
        // For now, we'll just log them prominently
        console.error('\n🚨 H3 NETWORK PLATFORM ALERTS 🚨');
        console.error('================================');
        alerts.forEach((alert) => console.error(alert));
        console.error(
            `Timestamp: ${new Date(metrics.timestamp).toISOString()}`
        );
        console.error('================================\n');

        // TODO: Integrate with actual alerting service
        // Examples:
        // - Send to Slack webhook
        // - Email notifications
        // - SMS alerts for critical issues
        // - PagerDuty integration
    }

    setThresholds(thresholds: Partial<typeof this.alertThresholds>): void {
        this.alertThresholds = { ...this.alertThresholds, ...thresholds };
    }
}

// Performance monitoring wrapper for API routes
export function withPerformanceMonitoring<
    T extends (...args: never[]) => unknown
>(endpoint: string, handler: T): T {
    return ((...args: Parameters<T>) => {
        const tracker = PerformanceTracker.getInstance();
        const startTime = Date.now();

        tracker.recordRequest(endpoint);

        try {
            const result = handler(...args);

            // Handle both sync and async functions
            if (result instanceof Promise) {
                return result
                    .then((value) => {
                        tracker.recordResponseTime(
                            endpoint,
                            Date.now() - startTime
                        );
                        return value;
                    })
                    .catch((error) => {
                        tracker.recordError(endpoint);
                        tracker.recordResponseTime(
                            endpoint,
                            Date.now() - startTime
                        );
                        throw error;
                    });
            } else {
                tracker.recordResponseTime(endpoint, Date.now() - startTime);
                return result;
            }
        } catch (error) {
            tracker.recordError(endpoint);
            tracker.recordResponseTime(endpoint, Date.now() - startTime);
            throw error;
        }
    }) as T;
}

// Export instances
export const performanceTracker = PerformanceTracker.getInstance();
export const alertManager = AlertManager.getInstance();

// Utility functions
export const MonitoringUtils = {
    // Start periodic health checks
    startHealthMonitoring(intervalMs = 60000): NodeJS.Timeout {
        return setInterval(async () => {
            try {
                const health = await HealthChecker.getSystemHealth();
                await alertManager.checkAlerts(health);

                // Log health metrics for observability
                logger.info('Health check completed', {
                    dbConnected: health.database.connected,
                    dbResponseTime: health.database.responseTime,
                    memoryUsage: health.memory.percentage,
                    cacheHitRate: health.cache.hitRate,
                    uptime: health.uptime,
                });
            } catch (error) {
                logger.error('Health monitoring error', {
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }
        }, intervalMs);
    },

    // Get performance report for specific endpoint
    async getEndpointReport(endpoint: string): Promise<{
        averageResponseTime: number;
        errorRate: number;
        requestCount: number;
    }> {
        const tracker = PerformanceTracker.getInstance();
        return {
            averageResponseTime: tracker.getAverageResponseTime(endpoint),
            errorRate: tracker.getErrorRate(endpoint),
            requestCount: tracker.getRequestsPerMinute(), // Simplified
        };
    },

    // Force health check
    async runHealthCheck(): Promise<HealthMetrics> {
        return HealthChecker.getSystemHealth();
    },
};
