import { describe, it, expect, beforeEach } from '@jest/globals';
import { cache, CacheUtils } from '../src/lib/cache';

describe('Cache System', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  describe('Memory Cache', () => {
    it('should store and retrieve data', async () => {
      const testData = { id: '1', name: 'Test Video' };
      const key = 'test-key';

      await cache.set(key, testData);
      const retrieved = await cache.get(key);

      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cache.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should respect TTL expiration', async () => {
      const testData = { id: '1', name: 'Test Video' };
      const key = 'test-key';
      const shortTTL = 100; // 100ms

      await cache.set(key, testData, shortTTL);
      
      // Should be available immediately
      let retrieved = await cache.get(key);
      expect(retrieved).toEqual(testData);

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 150));
      
      retrieved = await cache.get(key);
      expect(retrieved).toBeNull();
    });

    it('should track cache statistics', async () => {
      const testData = { id: '1', name: 'Test Video' };
      
      // Initial stats
      let stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);

      // Cache miss
      await cache.get('missing-key');
      stats = cache.getStats();
      expect(stats.misses).toBe(1);

      // Cache set and hit
      await cache.set('test-key', testData);
      await cache.get('test-key');
      stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.size).toBe(1);
    });
  });

  describe('Cache Utils', () => {
    it('should generate consistent cache keys', () => {
      const videoId = 'test-video-123';
      const key1 = CacheUtils.keys.video(videoId);
      const key2 = CacheUtils.keys.video(videoId);
      
      expect(key1).toBe(key2);
      expect(key1).toBe(`video:${videoId}`);
    });

    it('should generate unique keys for different parameters', () => {
      const key1 = CacheUtils.keys.videoList(1, 20);
      const key2 = CacheUtils.keys.videoList(2, 20);
      const key3 = CacheUtils.keys.videoList(1, 10);
      
      expect(key1).not.toBe(key2);
      expect(key1).not.toBe(key3);
      expect(key2).not.toBe(key3);
    });

    it('should cache function results with withCache', async () => {
      let callCount = 0;
      const expensiveFunction = async () => {
        callCount++;
        return { result: 'computed', timestamp: Date.now() };
      };

      // First call should execute function
      const result1 = await CacheUtils.withCache('test-fn', expensiveFunction);
      expect(callCount).toBe(1);

      // Second call should use cache
      const result2 = await CacheUtils.withCache('test-fn', expensiveFunction);
      expect(callCount).toBe(1); // Should not increment
      expect(result2).toEqual(result1);
    });
  });

  describe('TTL Constants', () => {
    it('should have reasonable TTL values', () => {
      expect(CacheUtils.TTL.SHORT).toBe(1 * 60 * 1000); // 1 minute
      expect(CacheUtils.TTL.MEDIUM).toBe(5 * 60 * 1000); // 5 minutes
      expect(CacheUtils.TTL.LONG).toBe(30 * 60 * 1000); // 30 minutes
      expect(CacheUtils.TTL.VERY_LONG).toBe(2 * 60 * 60 * 1000); // 2 hours
    });
  });
});