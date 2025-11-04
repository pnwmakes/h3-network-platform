import { env } from './env';

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

export interface CacheStats {
    hits: number;
    misses: number;
    size: number;
}

class MemoryCache {
    private cache = new Map<string, CacheEntry<unknown>>();
    private stats: CacheStats = { hits: 0, misses: 0, size: 0 };
    private readonly maxSize: number;
    private readonly defaultTTL: number;

    constructor(maxSize = 1000, defaultTTL = 5 * 60 * 1000) {
        this.maxSize = maxSize;
        this.defaultTTL = defaultTTL;
    }

    set<T>(key: string, data: T, ttl?: number): void {
        // Remove expired entries if cache is getting full
        if (this.cache.size >= this.maxSize) {
            this.cleanup();
        }

        // If still full after cleanup, remove oldest entry
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
                this.stats.size--;
            }
        }

        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultTTL,
        };

        this.cache.set(key, entry);
        this.stats.size = this.cache.size;
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.stats.misses++;
            return null;
        }

        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            this.stats.size = this.cache.size;
            this.stats.misses++;
            return null;
        }

        this.stats.hits++;
        return entry.data as T;
    }

    delete(key: string): boolean {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.size = this.cache.size;
        }
        return deleted;
    }

    clear(): void {
        this.cache.clear();
        this.stats = { hits: 0, misses: 0, size: 0 };
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
            }
        }
        this.stats.size = this.cache.size;
    }

    getStats(): CacheStats {
        return { ...this.stats };
    }

    // Cache key generators
    static keys = {
        video: (id: string) => `video:${id}`,
        videoList: (page: number, limit: number, filters?: Record<string, unknown>) => {
            const filterStr = filters ? JSON.stringify(filters) : '';
            return `videos:${page}:${limit}:${filterStr}`;
        },
        creator: (id: string) => `creator:${id}`,
        creatorVideos: (id: string, page: number) => `creator:${id}:videos:${page}`,
        blog: (id: string) => `blog:${id}`,
        blogList: (page: number, limit: number) => `blogs:${page}:${limit}`,
        search: (query: string, type: string, page: number) => `search:${type}:${query}:${page}`,
        user: (id: string) => `user:${id}`,
        userStats: (id: string) => `user:${id}:stats`,
    };
}

// Redis cache implementation (for production)
class RedisCache {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private redisClient: any = null;

    constructor() {
        // Redis client will be initialized when needed
        if (env.REDIS_URL) {
            this.initRedis();
        }
    }

    private async initRedis() {
        try {
            // Dynamic import to avoid issues if redis isn't installed
            const { createClient } = await import('redis');
            this.redisClient = createClient({
                url: env.REDIS_URL,
            });
            
            await this.redisClient.connect();
        } catch (error) {
            console.warn('Redis connection failed, falling back to memory cache:', error);
            this.redisClient = null;
        }
    }

    async set<T>(key: string, data: T, ttl?: number): Promise<void> {
        if (!this.redisClient) return;
        
        try {
            const serialized = JSON.stringify(data);
            if (ttl) {
                await this.redisClient.setEx(key, Math.floor(ttl / 1000), serialized);
            } else {
                await this.redisClient.set(key, serialized);
            }
        } catch (error) {
            console.error('Redis set error:', error);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        if (!this.redisClient) return null;
        
        try {
            const data = await this.redisClient.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    async delete(key: string): Promise<boolean> {
        if (!this.redisClient) return false;
        
        try {
            const result = await this.redisClient.del(key);
            return result > 0;
        } catch (error) {
            console.error('Redis delete error:', error);
            return false;
        }
    }

    async clear(): Promise<void> {
        if (!this.redisClient) return;
        
        try {
            await this.redisClient.flushDb();
        } catch (error) {
            console.error('Redis clear error:', error);
        }
    }
}

// Unified cache interface
class CacheManager {
    private memoryCache: MemoryCache;
    private redisCache: RedisCache;

    constructor() {
        this.memoryCache = new MemoryCache();
        this.redisCache = new RedisCache();
    }

    async set<T>(key: string, data: T, ttl?: number): Promise<void> {
        // Always set in memory cache for fast local access
        this.memoryCache.set(key, data, ttl);
        
        // Set in Redis if available (for distributed caching)
        if (env.REDIS_URL) {
            await this.redisCache.set(key, data, ttl);
        }
    }

    async get<T>(key: string): Promise<T | null> {
        // Try memory cache first
        let data = this.memoryCache.get<T>(key);
        if (data) return data;

        // Try Redis if available
        if (env.REDIS_URL) {
            data = await this.redisCache.get<T>(key);
            if (data) {
                // Backfill memory cache
                this.memoryCache.set(key, data);
                return data;
            }
        }

        return null;
    }

    async delete(key: string): Promise<void> {
        this.memoryCache.delete(key);
        if (env.REDIS_URL) {
            await this.redisCache.delete(key);
        }
    }

    async clear(): Promise<void> {
        this.memoryCache.clear();
        if (env.REDIS_URL) {
            await this.redisCache.clear();
        }
    }

    getStats(): CacheStats {
        return this.memoryCache.getStats();
    }

    // Cache invalidation patterns
    async invalidatePattern(pattern: string): Promise<void> {
        // For memory cache, we'll need to iterate through keys
        // This is a simplified implementation - in production you might want
        // to use a more sophisticated pattern matching system
        const stats = this.memoryCache.getStats();
        console.log(`Cache invalidation pattern: ${pattern}, current size: ${stats.size}`);
    }
}

// Export singleton instance
export const cache = new CacheManager();

// Cache utilities
export const CacheUtils = {
    // TTL constants (in milliseconds)
    TTL: {
        SHORT: 1 * 60 * 1000,      // 1 minute
        MEDIUM: 5 * 60 * 1000,     // 5 minutes
        LONG: 30 * 60 * 1000,      // 30 minutes
        VERY_LONG: 2 * 60 * 60 * 1000, // 2 hours
    },

    // Cache key generation
    keys: MemoryCache.keys,

    // Helper to wrap functions with caching
    async withCache<T>(
        key: string,
        fn: () => Promise<T>,
        ttl?: number
    ): Promise<T> {
        // Try to get from cache first
        const cached = await cache.get<T>(key);
        if (cached !== null) {
            return cached;
        }

        // Execute function and cache result
        const result = await fn();
        await cache.set(key, result, ttl);
        return result;
    },
};