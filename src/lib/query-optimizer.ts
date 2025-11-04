import { cache, CacheUtils } from './cache';
import { logger } from './logger';

// Query optimization utilities
export class QueryOptimizer {
    // Common select fields for different models to avoid over-fetching
    static readonly SELECT_FIELDS = {
        video: {
            minimal: {
                id: true,
                title: true,
                thumbnailUrl: true,
                duration: true,
                publishedAt: true,
                viewCount: true,
                creatorId: true,
            },
            card: {
                id: true,
                title: true,
                description: true,
                thumbnailUrl: true,
                duration: true,
                publishedAt: true,
                viewCount: true,
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
            detail: {
                id: true,
                title: true,
                description: true,
                youtubeId: true,
                thumbnailUrl: true,
                duration: true,
                publishedAt: true,
                viewCount: true,
                likeCount: true,
                status: true,
                tags: true,
                creator: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
                show: {
                    select: {
                        id: true,
                        name: true,
                        description: true,
                    },
                },
            },
        },
        creator: {
            minimal: {
                id: true,
                displayName: true,
                avatarUrl: true,
            },
            card: {
                id: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                verified: true,
                followerCount: true,
                videoCount: true,
            },
            detail: {
                id: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                bannerUrl: true,
                verified: true,
                followerCount: true,
                videoCount: true,
                socialLinks: true,
                createdAt: true,
            },
        },
        blog: {
            minimal: {
                id: true,
                title: true,
                publishedAt: true,
                authorId: true,
            },
            card: {
                id: true,
                title: true,
                excerpt: true,
                coverImageUrl: true,
                publishedAt: true,
                readTime: true,
                tags: true,
                author: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
            },
            detail: {
                id: true,
                title: true,
                content: true,
                excerpt: true,
                coverImageUrl: true,
                publishedAt: true,
                updatedAt: true,
                readTime: true,
                viewCount: true,
                tags: true,
                status: true,
                author: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        bio: true,
                    },
                },
            },
        },
        user: {
            profile: {
                id: true,
                email: true,
                name: true,
                image: true,
                role: true,
                createdAt: true,
                lastActiveAt: true,
            },
            public: {
                id: true,
                name: true,
                image: true,
                createdAt: true,
            },
        },
    };

    // Common where clauses
    static readonly WHERE_CLAUSES = {
        publishedVideos: {
            status: 'PUBLISHED' as const,
            publishedAt: {
                lte: new Date(),
            },
        },
        publishedBlogs: {
            status: 'PUBLISHED' as const,
            publishedAt: {
                lte: new Date(),
            },
        },
        activeCreators: {
            status: 'ACTIVE' as const,
        },
    };

    // Optimized pagination
    static getPaginationParams(page: number, limit: number = 20) {
        const normalizedPage = Math.max(1, page);
        const normalizedLimit = Math.min(Math.max(1, limit), 100); // Cap at 100
        const skip = (normalizedPage - 1) * normalizedLimit;
        
        return {
            skip,
            take: normalizedLimit,
            page: normalizedPage,
            limit: normalizedLimit,
        };
    }

    // Order by clauses for consistent sorting
    static readonly ORDER_BY = {
        videos: {
            recent: { publishedAt: 'desc' as const },
            popular: { viewCount: 'desc' as const },
            trending: [
                { viewCount: 'desc' as const },
                { publishedAt: 'desc' as const },
            ],
        },
        blogs: {
            recent: { publishedAt: 'desc' as const },
            popular: { viewCount: 'desc' as const },
        },
        creators: {
            popular: { followerCount: 'desc' as const },
            recent: { createdAt: 'desc' as const },
            alphabetical: { displayName: 'asc' as const },
        },
    };
}

// Cached query wrapper
export async function cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = CacheUtils.TTL.MEDIUM
): Promise<T> {
    return CacheUtils.withCache(key, queryFn, ttl);
}

// Query performance monitoring
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withQueryMonitoring<T extends any[], R>(
    queryName: string,
    queryFn: (...args: T) => Promise<R>
) {
    return async (...args: T): Promise<R> => {
        const startTime = Date.now();
        
        try {
            const result = await queryFn(...args);
            const duration = Date.now() - startTime;
            
            logger.dbQuery(queryName, duration, {
                args: JSON.stringify(args),
                success: true,
            });
            
            // Log slow queries
            if (duration > 1000) {
                logger.warn(`Slow query detected: ${queryName}`, {
                    duration,
                    queryName,
                });
            }
            
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.dbError(queryName, error as Error, {
                args: JSON.stringify(args),
                duration,
            });
            throw error;
        }
    };
}

// Batch loading utilities
export class BatchLoader {
    private static readonly BATCH_SIZE = 100;
    
    static async loadVideosByIds(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prisma: any,
        ids: string[],
        selectFields = QueryOptimizer.SELECT_FIELDS.video.card
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<Map<string, any>> {
        const videoMap = new Map();
        
        // Process in batches to avoid query size limits
        for (let i = 0; i < ids.length; i += this.BATCH_SIZE) {
            const batchIds = ids.slice(i, i + this.BATCH_SIZE);
            
            const videos = await prisma.video.findMany({
                where: {
                    id: { in: batchIds },
                    ...QueryOptimizer.WHERE_CLAUSES.publishedVideos,
                },
                select: selectFields,
            });
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            videos.forEach((video: any) => {
                videoMap.set(video.id, video);
            });
        }
        
        return videoMap;
    }
    
    static async loadCreatorsByIds(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        prisma: any,
        ids: string[],
        selectFields = QueryOptimizer.SELECT_FIELDS.creator.card
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<Map<string, any>> {
        const creatorMap = new Map();
        
        for (let i = 0; i < ids.length; i += this.BATCH_SIZE) {
            const batchIds = ids.slice(i, i + this.BATCH_SIZE);
            
            const creators = await prisma.creator.findMany({
                where: {
                    id: { in: batchIds },
                    ...QueryOptimizer.WHERE_CLAUSES.activeCreators,
                },
                select: selectFields,
            });
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            creators.forEach((creator: any) => {
                creatorMap.set(creator.id, creator);
            });
        }
        
        return creatorMap;
    }
}

// Database connection optimization
export class ConnectionManager {
    private static queryCount = 0;
    private static readonly QUERY_THRESHOLD = 1000;
    
    static trackQuery() {
        this.queryCount++;
        
        // Log connection stats periodically
        if (this.queryCount % this.QUERY_THRESHOLD === 0) {
            logger.info('Database connection stats', {
                totalQueries: this.queryCount,
            });
        }
    }
    
    static getStats() {
        return {
            queryCount: this.queryCount,
            cacheStats: cache.getStats(),
        };
    }
}

// Search optimization utilities
export class SearchOptimizer {
    // Full-text search configuration
    static readonly SEARCH_CONFIG = {
        video: {
            fields: ['title', 'description', 'tags'],
            weights: {
                title: 3,
                tags: 2,
                description: 1,
            },
        },
        blog: {
            fields: ['title', 'content', 'excerpt', 'tags'],
            weights: {
                title: 3,
                tags: 2,
                excerpt: 2,
                content: 1,
            },
        },
        creator: {
            fields: ['displayName', 'bio'],
            weights: {
                displayName: 3,
                bio: 1,
            },
        },
    };
    
    // Build search query for PostgreSQL full-text search
    static buildSearchQuery(query: string): string {
        // Clean and normalize search query
        const cleanQuery = query
            .trim()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .split(' ')
            .filter(word => word.length > 1)
            .map(word => `${word}:*`)
            .join(' & ');
            
        return cleanQuery || '';
    }
    
    // Get search filters based on query
    static getSearchFilters(searchQuery: string, type: 'video' | 'blog' | 'creator') {
        const tsQuery = this.buildSearchQuery(searchQuery);
        
        if (!tsQuery) {
            return {};
        }
        
        switch (type) {
            case 'video':
                return {
                    OR: [
                        {
                            title: {
                                search: tsQuery,
                            },
                        },
                        {
                            description: {
                                search: tsQuery,
                            },
                        },
                        {
                            tags: {
                                has: searchQuery,
                            },
                        },
                    ],
                };
            case 'blog':
                return {
                    OR: [
                        {
                            title: {
                                search: tsQuery,
                            },
                        },
                        {
                            content: {
                                search: tsQuery,
                            },
                        },
                        {
                            excerpt: {
                                search: tsQuery,
                            },
                        },
                        {
                            tags: {
                                has: searchQuery,
                            },
                        },
                    ],
                };
            case 'creator':
                return {
                    OR: [
                        {
                            displayName: {
                                contains: searchQuery,
                                mode: 'insensitive' as const,
                            },
                        },
                        {
                            bio: {
                                search: tsQuery,
                            },
                        },
                    ],
                };
            default:
                return {};
        }
    }
}

// Export commonly used utilities
export {
    QueryOptimizer as QO,
    CacheUtils,
    cache,
};