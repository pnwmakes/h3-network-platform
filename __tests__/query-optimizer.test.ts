import { describe, it, expect } from '@jest/globals';
import { QueryOptimizer } from '../src/lib/query-optimizer';

describe('Query Optimizer', () => {
  describe('Pagination', () => {
    it('should return correct pagination parameters', () => {
      const result = QueryOptimizer.getPaginationParams(1, 20);
      expect(result).toEqual({
        skip: 0,
        take: 20,
        page: 1,
        limit: 20,
      });
    });

    it('should handle page 2 correctly', () => {
      const result = QueryOptimizer.getPaginationParams(2, 10);
      expect(result).toEqual({
        skip: 10,
        take: 10,
        page: 2,
        limit: 10,
      });
    });

    it('should normalize invalid page numbers', () => {
      const result = QueryOptimizer.getPaginationParams(0, 20);
      expect(result.page).toBe(1);
      expect(result.skip).toBe(0);
    });

    it('should cap limit at 100', () => {
      const result = QueryOptimizer.getPaginationParams(1, 500);
      expect(result.limit).toBe(100);
      expect(result.take).toBe(100);
    });

    it('should enforce minimum limit of 1', () => {
      const result = QueryOptimizer.getPaginationParams(1, 0);
      expect(result.limit).toBe(1);
      expect(result.take).toBe(1);
    });
  });

  describe('Select Fields', () => {
    it('should have video select fields', () => {
      expect(QueryOptimizer.SELECT_FIELDS.video.minimal).toBeDefined();
      expect(QueryOptimizer.SELECT_FIELDS.video.card).toBeDefined();
      expect(QueryOptimizer.SELECT_FIELDS.video.detail).toBeDefined();
      
      // Check minimal fields include required properties
      expect(QueryOptimizer.SELECT_FIELDS.video.minimal.id).toBe(true);
      expect(QueryOptimizer.SELECT_FIELDS.video.minimal.title).toBe(true);
    });

    it('should have creator select fields', () => {
      expect(QueryOptimizer.SELECT_FIELDS.creator.minimal).toBeDefined();
      expect(QueryOptimizer.SELECT_FIELDS.creator.card).toBeDefined();
      expect(QueryOptimizer.SELECT_FIELDS.creator.detail).toBeDefined();
    });

    it('should have blog select fields', () => {
      expect(QueryOptimizer.SELECT_FIELDS.blog.minimal).toBeDefined();
      expect(QueryOptimizer.SELECT_FIELDS.blog.card).toBeDefined();
      expect(QueryOptimizer.SELECT_FIELDS.blog.detail).toBeDefined();
    });
  });

  describe('Where Clauses', () => {
    it('should have published videos clause', () => {
      const clause = QueryOptimizer.WHERE_CLAUSES.publishedVideos;
      expect(clause.status).toBe('PUBLISHED');
      expect(clause.publishedAt).toBeDefined();
      expect(clause.publishedAt.lte).toBeInstanceOf(Date);
    });

    it('should have published blogs clause', () => {
      const clause = QueryOptimizer.WHERE_CLAUSES.publishedBlogs;
      expect(clause.status).toBe('PUBLISHED');
      expect(clause.publishedAt).toBeDefined();
      expect(clause.publishedAt.lte).toBeInstanceOf(Date);
    });

    it('should have active creators clause', () => {
      const clause = QueryOptimizer.WHERE_CLAUSES.activeCreators;
      expect(clause.status).toBe('ACTIVE');
    });
  });

  describe('Order By Clauses', () => {
    it('should have video ordering options', () => {
      expect(QueryOptimizer.ORDER_BY.videos.recent).toEqual({ publishedAt: 'desc' });
      expect(QueryOptimizer.ORDER_BY.videos.popular).toEqual({ viewCount: 'desc' });
      expect(QueryOptimizer.ORDER_BY.videos.trending).toBeInstanceOf(Array);
    });

    it('should have creator ordering options', () => {
      expect(QueryOptimizer.ORDER_BY.creators.popular).toEqual({ followerCount: 'desc' });
      expect(QueryOptimizer.ORDER_BY.creators.recent).toEqual({ createdAt: 'desc' });
      expect(QueryOptimizer.ORDER_BY.creators.alphabetical).toEqual({ displayName: 'asc' });
    });
  });
});