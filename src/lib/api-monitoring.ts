import {
    performanceTracker,
    withPerformanceMonitoring,
} from '@/lib/monitoring';
import { logger } from '@/lib/logger';

// Enhance existing API routes with performance monitoring
export function enhanceApiWithMonitoring() {
    logger.info('Initializing API performance monitoring enhancements');
}

// API wrapper that adds performance tracking to existing routes
export function monitorApiEndpoint(endpoint: string) {
    return function <T extends (...args: unknown[]) => Promise<Response>>(
        target: unknown,
        propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<T>
    ): TypedPropertyDescriptor<T> {
        const originalMethod = descriptor.value;

        if (originalMethod) {
            descriptor.value = withPerformanceMonitoring(
                endpoint,
                originalMethod
            );
        }

        return descriptor;
    };
}

// Enhanced response wrapper with performance metrics
export function withApiResponseEnhancement(
    response: Response,
    startTime: number
): Response {
    const duration = Date.now() - startTime;

    // Clone response to add headers
    const enhancedResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers),
    });

    // Add performance headers
    enhancedResponse.headers.set('X-Response-Time', `${duration}ms`);
    enhancedResponse.headers.set('X-Timestamp', new Date().toISOString());

    // Track performance
    performanceTracker.recordResponseTime('api-global', duration);

    if (response.status >= 400) {
        performanceTracker.recordError('api-global');
    } else {
        performanceTracker.recordRequest('api-global');
    }

    return enhancedResponse;
}

// Middleware to wrap all API routes with monitoring
export function createMonitoringMiddleware() {
    return async (
        request: Request,
        context: { next: () => Promise<Response> }
    ) => {
        const startTime = Date.now();
        const url = new URL(request.url);
        const endpoint = url.pathname;

        performanceTracker.recordRequest(endpoint);

        try {
            const response = await context.next();
            const duration = Date.now() - startTime;

            performanceTracker.recordResponseTime(endpoint, duration);

            if (response.status >= 400) {
                performanceTracker.recordError(endpoint);
            }

            return withApiResponseEnhancement(response, startTime);
        } catch (error) {
            performanceTracker.recordError(endpoint);
            logger.error('API middleware error', {
                endpoint,
                error: error instanceof Error ? error.message : String(error),
                duration: Date.now() - startTime,
            });
            throw error;
        }
    };
}
