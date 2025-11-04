import { NextResponse } from 'next/server';
import { logger } from './logger';

// Standard API response interface
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        hasMore?: boolean;
        executionTime?: number;
    };
}

// Success response helper
export function createSuccessResponse<T>(
    data: T,
    message?: string,
    meta?: ApiResponse<T>['meta']
): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
        message,
        meta,
    });
}

// Error response helper
export function createErrorResponse(
    error: string,
    status: number = 400
): NextResponse<ApiResponse> {
    logger.error(`API Error Response: ${error}`, {
        status,
        error,
    });

    return NextResponse.json(
        {
            success: false,
            error,
        },
        { status }
    );
}

// Paginated response helper
export function createPaginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    executionTime?: number
): NextResponse<ApiResponse<T[]>> {
    const hasMore = page * limit < total;

    return NextResponse.json({
        success: true,
        data,
        meta: {
            page,
            limit,
            total,
            hasMore,
            executionTime,
        },
    });
}

// Not found response
export function createNotFoundResponse(
    resource: string = 'Resource'
): NextResponse<ApiResponse> {
    return createErrorResponse(`${resource} not found`, 404);
}

// Unauthorized response
export function createUnauthorizedResponse(
    message: string = 'Unauthorized'
): NextResponse<ApiResponse> {
    return createErrorResponse(message, 401);
}

// Cache control headers
export const CacheHeaders = {
    noCache: {
        'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
    },
    shortCache: {
        'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minutes
    },
    mediumCache: {
        'Cache-Control': 'public, max-age=1800, s-maxage=3600', // 30 minutes / 1 hour
    },
    longCache: {
        'Cache-Control': 'public, max-age=86400, s-maxage=604800', // 1 day / 1 week
    },
    staticAssets: {
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year
    },
};

// Add cache headers to response
export function withCacheHeaders(
    response: NextResponse,
    cacheType: keyof typeof CacheHeaders
): NextResponse {
    const headers = CacheHeaders[cacheType];

    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

// Performance monitoring headers
export function withPerformanceHeaders(
    response: NextResponse,
    executionTime: number,
    cacheHit: boolean = false
): NextResponse {
    response.headers.set('X-Response-Time', `${executionTime}ms`);
    response.headers.set('X-Cache-Status', cacheHit ? 'HIT' : 'MISS');
    response.headers.set('X-Powered-By', 'H3 Network Platform');

    return response;
}
