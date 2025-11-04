import { NextRequest, NextResponse } from 'next/server';
import { getSecureHeaders, env, isProd } from './env';
import { logger } from './logger';
import { createClient } from 'redis';

// Rate limiting configuration
interface RateLimitConfig {
    windowMs: number;
    max: number;
    message: string;
    skipSuccessfulRequests?: boolean;
}

const defaultRateLimit: RateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    skipSuccessfulRequests: false,
};

// Different rate limits for different endpoints
const rateLimitRules: Record<string, RateLimitConfig> = {
    '/api/auth/': {
        windowMs: 15 * 60 * 1000,
        max: 5, // Stricter for auth endpoints
        message: 'Too many authentication attempts, please try again later.',
    },
    '/api/upload/': {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 10, // Limited uploads per hour
        message: 'Upload limit exceeded, please try again later.',
    },
    '/api/admin/': {
        windowMs: 15 * 60 * 1000,
        max: 200, // Higher limit for admin operations
        message: 'Admin request limit exceeded.',
    },
};

// Redis client for production rate limiting
let redisClient: ReturnType<typeof createClient> | null = null;

// Initialize Redis client for production
async function getRedisClient() {
    if (!isProd || !env.REDIS_URL) {
        return null;
    }

    if (!redisClient) {
        try {
            redisClient = createClient({
                url: env.REDIS_URL,
            });

            redisClient.on('error', (err) => {
                logger.error('Redis connection error', { error: err.message });
            });

            await redisClient.connect();
            logger.info('Redis client connected for rate limiting');
        } catch (error) {
            logger.error('Failed to connect to Redis', { 
                error: error instanceof Error ? error.message : String(error)
            });
            redisClient = null;
        }
    }

    return redisClient;
}

// In-memory fallback store for development
const memoryRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientId(req: NextRequest): string {
    // In production, consider using a more sophisticated client identification
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    return ip;
}

function getRateLimitConfig(pathname: string): RateLimitConfig {
    for (const [path, config] of Object.entries(rateLimitRules)) {
        if (pathname.startsWith(path)) {
            return config;
        }
    }
    return defaultRateLimit;
}

export async function applyRateLimit(req: NextRequest): Promise<NextResponse | null> {
    const clientId = getClientId(req);
    const pathname = req.nextUrl.pathname;
    const config = getRateLimitConfig(pathname);

    const now = Date.now();
    const key = `ratelimit:${clientId}:${pathname}`;

    try {
        // Try to use Redis in production
        const redis = await getRedisClient();
        
        if (redis) {
            return await applyRedisRateLimit(redis, key, config, clientId, pathname, now);
        } else {
            return applyMemoryRateLimit(key, config, clientId, pathname, now);
        }
    } catch (error) {
        logger.warn('Rate limiting error, allowing request', {
            error: error instanceof Error ? error.message : String(error),
            clientId,
            pathname
        });
        return null; // Allow request on error
    }
}

// Redis-based rate limiting for production
async function applyRedisRateLimit(
    redis: Awaited<ReturnType<typeof getRedisClient>>,
    key: string,
    config: RateLimitConfig,
    clientId: string,
    pathname: string,
    now: number
): Promise<NextResponse | null> {
    if (!redis) return null;

    const windowStart = now - config.windowMs;
    const expiry = Math.ceil(config.windowMs / 1000);

    // Remove expired entries and count current requests
    await redis.zRemRangeByScore(key, 0, windowStart);
    const requestCount = await redis.zCard(key);

    if (requestCount >= config.max) {
        logger.securityEvent('Rate limit exceeded (Redis)', 'medium', {
            clientId,
            pathname,
            count: requestCount,
            max: config.max,
        });

        const resetTime = await redis.ttl(key);
        
        return new NextResponse(
            JSON.stringify({ error: config.message }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': Math.max(resetTime, 1).toString(),
                    'X-RateLimit-Limit': config.max.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': (now + (resetTime * 1000)).toString(),
                    ...getSecureHeaders(),
                },
            }
        );
    }

    // Add current request
    await redis.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
    await redis.expire(key, expiry);

    return null; // Allow request
}

// Memory-based rate limiting for development
function applyMemoryRateLimit(
    key: string,
    config: RateLimitConfig,
    clientId: string,
    pathname: string,
    now: number
): NextResponse | null {
    // Clean up expired entries
    for (const [storeKey, data] of memoryRateLimitStore.entries()) {
        if (now > data.resetTime) {
            memoryRateLimitStore.delete(storeKey);
        }
    }

    const current = memoryRateLimitStore.get(key);

    if (!current) {
        // First request from this client for this endpoint
        memoryRateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return null; // Allow request
    }

    if (now > current.resetTime) {
        // Window has expired, reset
        memoryRateLimitStore.set(key, {
            count: 1,
            resetTime: now + config.windowMs,
        });
        return null; // Allow request
    }

    if (current.count >= config.max) {
        // Rate limit exceeded
        logger.securityEvent('Rate limit exceeded (Memory)', 'medium', {
            clientId,
            pathname,
            count: current.count,
            max: config.max,
        });

        return new NextResponse(
            JSON.stringify({ error: config.message }),
            {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
                    'X-RateLimit-Limit': config.max.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': current.resetTime.toString(),
                    ...getSecureHeaders(),
                },
            }
        );
    }

    // Increment count
    current.count++;
    memoryRateLimitStore.set(key, current);

    return null; // Allow request
}

export function applySecurityHeaders(response: NextResponse): NextResponse {
    const secureHeaders = getSecureHeaders();

    Object.entries(secureHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export function validateApiRequest(req: NextRequest): {
    isValid: boolean;
    error?: string;
} {
    const contentType = req.headers.get('content-type');
    const method = req.method;

    // Validate Content-Type for POST/PUT/PATCH requests
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (!contentType) {
            return { isValid: false, error: 'Content-Type header is required' };
        }

        const validContentTypes = [
            'application/json',
            'multipart/form-data',
            'application/x-www-form-urlencoded',
        ];

        const isValidContentType = validContentTypes.some((type) =>
            contentType.includes(type)
        );

        if (!isValidContentType) {
            return { isValid: false, error: 'Invalid Content-Type' };
        }
    }

    // Validate request size (basic check via Content-Length)
    const contentLength = req.headers.get('content-length');
    if (contentLength) {
        const size = parseInt(contentLength, 10);
        const maxSize = 10 * 1024 * 1024; // 10MB limit

        if (size > maxSize) {
            return { isValid: false, error: 'Request entity too large' };
        }
    }

    return { isValid: true };
}

export function createApiResponse(
    data: unknown,
    status = 200,
    headers: Record<string, string> = {}
): NextResponse {
    const response = NextResponse.json(data, {
        status,
        headers: {
            ...headers,
            ...getSecureHeaders(),
        },
    });

    return response;
}

export function createErrorResponse(
    message: string,
    status = 500,
    details?: unknown
): NextResponse {
    const errorData = {
        error: message,
        status,
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV !== 'production' && details
            ? { details }
            : {}),
    };

    return createApiResponse(errorData, status);
}

// API route wrapper with security and logging
export function withApiSecurity(
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const startTime = Date.now();
        const context = {
            requestId: req.headers.get('x-request-id') || `req_${Date.now()}`,
            ip: getClientId(req),
            userAgent: req.headers.get('user-agent') || undefined,
            method: req.method,
            endpoint: req.nextUrl.pathname,
        };

        logger.apiRequest(req.method, req.nextUrl.pathname, context);

        try {
            // Apply rate limiting
            const rateLimitResponse = await applyRateLimit(req);
            if (rateLimitResponse) {
                return rateLimitResponse;
            }

            // Validate request
            const validation = validateApiRequest(req);
            if (!validation.isValid) {
                logger.securityEvent('Invalid API request', 'low', {
                    ...context,
                    error: validation.error,
                });
                return createErrorResponse(
                    validation.error || 'Invalid request',
                    400
                );
            }

            // Execute handler
            const response = await handler(req);

            // Apply security headers
            const secureResponse = applySecurityHeaders(response);

            // Log response
            const responseTime = Date.now() - startTime;
            logger.apiResponse(
                req.method,
                req.nextUrl.pathname,
                secureResponse.status,
                responseTime,
                context
            );

            return secureResponse;
        } catch (error) {
            const responseTime = Date.now() - startTime;
            logger.apiError(req.method, req.nextUrl.pathname, error as Error, {
                ...context,
                responseTime,
            });

            return createErrorResponse('Internal server error', 500);
        }
    };
}
