import { createSuccessResponse } from '@/lib/api-response';

export async function GET() {
    const apiDocs = {
        title: 'H3 Network Media Platform API',
        version: '1.0.0',
        description: 'API documentation for the H3 Network Media Platform',
        baseUrl: process.env.APP_URL || 'http://localhost:3000',
        endpoints: {
            health: {
                path: '/api/health',
                method: 'GET',
                description:
                    'Health check endpoint for monitoring application status',
                response: {
                    status: 'healthy | unhealthy',
                    timestamp: 'ISO string',
                    version: 'string',
                    environment: 'development | production',
                    uptime: 'number (seconds)',
                    checks: {
                        database: {
                            status: 'ok | error',
                            responseTime: 'number',
                        },
                        environment: { status: 'ok | error' },
                    },
                    cache: {
                        stats: {
                            hits: 'number',
                            misses: 'number',
                            size: 'number',
                        },
                    },
                },
            },
            video: {
                path: '/api/videos/{id}',
                method: 'GET',
                description:
                    'Get a single video by ID with creator and show information',
                parameters: {
                    id: 'string - Video ID',
                },
                response: {
                    success: 'boolean',
                    data: {
                        id: 'string',
                        title: 'string',
                        description: 'string',
                        youtubeId: 'string',
                        thumbnailUrl: 'string',
                        duration: 'number',
                        publishedAt: 'ISO string',
                        viewCount: 'number',
                        url: 'string - Computed video URL',
                        embedUrl: 'string - YouTube embed URL',
                        creator: {
                            id: 'string',
                            displayName: 'string',
                            avatarUrl: 'string',
                            bio: 'string',
                        },
                        show: {
                            id: 'string',
                            name: 'string',
                            description: 'string',
                        },
                    },
                    meta: {
                        executionTime: 'number (ms)',
                    },
                },
                caching: {
                    ttl: '30 minutes',
                    headers: 'Cache-Control: public, max-age=1800',
                },
            },
            videos: {
                path: '/api/videos',
                method: 'GET',
                description: 'Get a paginated list of videos',
                parameters: {
                    page: 'number - Page number (default: 1)',
                    limit: 'number - Items per page (default: 20, max: 100)',
                    sort: 'recent | popular | trending',
                    creator: 'string - Filter by creator ID',
                    show: 'string - Filter by show ID',
                },
                response: {
                    success: 'boolean',
                    data: 'Array of video objects (card format)',
                    meta: {
                        page: 'number',
                        limit: 'number',
                        total: 'number',
                        hasMore: 'boolean',
                        executionTime: 'number (ms)',
                    },
                },
            },
            creators: {
                path: '/api/creators',
                method: 'GET',
                description: 'Get a list of creators',
                response: 'Array of creator objects',
            },
            blogs: {
                path: '/api/blogs',
                method: 'GET',
                description: 'Get a list of blog posts',
                response: 'Array of blog objects',
            },
            search: {
                path: '/api/search',
                method: 'GET',
                description: 'Search across videos, creators, and blogs',
                parameters: {
                    q: 'string - Search query',
                    type: 'video | creator | blog | all',
                    page: 'number',
                    limit: 'number',
                },
                response: 'Search results with relevance scoring',
            },
        },
        authentication: {
            description: 'API uses NextAuth.js for authentication',
            endpoints: {
                signin: '/api/auth/signin',
                signout: '/api/auth/signout',
                session: '/api/auth/session',
            },
        },
        rateLimiting: {
            description: 'API requests are rate limited',
            limits: {
                development: '1000 requests per 15 minutes per IP',
                production: '100 requests per 15 minutes per IP',
            },
            headers: {
                'X-RateLimit-Limit': 'Request limit',
                'X-RateLimit-Remaining': 'Remaining requests',
                'X-RateLimit-Reset': 'Reset time',
            },
        },
        errorHandling: {
            description: 'All API responses follow a consistent format',
            errorResponse: {
                success: false,
                error: 'Error message',
                meta: {
                    executionTime: 'number (ms)',
                },
            },
            statusCodes: {
                200: 'Success',
                400: 'Bad Request',
                401: 'Unauthorized',
                403: 'Forbidden',
                404: 'Not Found',
                429: 'Rate Limited',
                500: 'Internal Server Error',
                503: 'Service Unavailable',
            },
        },
        performance: {
            caching: {
                strategy: 'Multi-tier caching with Redis and memory fallback',
                headers: 'Cache-Control headers for optimal CDN caching',
                invalidation: 'Automatic cache invalidation on data updates',
            },
            monitoring: {
                logging: 'Structured logging with Sentry integration',
                metrics: 'Response time, cache hit rates, error rates',
                healthChecks:
                    'Database, Redis, and application health monitoring',
            },
        },
    };

    return createSuccessResponse(apiDocs);
}
