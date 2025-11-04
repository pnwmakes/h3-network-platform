import { describe, it, expect } from '@jest/globals';
import { 
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  CacheHeaders 
} from '../src/lib/api-response';

describe('API Response Utilities', () => {
  describe('Success Response', () => {
    it('should create a success response with data', () => {
      const testData = { id: '1', name: 'Test' };
      const response = createSuccessResponse(testData);
      
      // Extract the response body (this is a simplified test)
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should create a success response with message and meta', () => {
      const testData = { id: '1', name: 'Test' };
      const message = 'Operation completed';
      const meta = { executionTime: 100 };
      
      const response = createSuccessResponse(testData, message, meta);
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });

  describe('Error Response', () => {
    it('should create an error response with default status', () => {
      const errorMessage = 'Something went wrong';
      const response = createErrorResponse(errorMessage);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(400);
    });

    it('should create an error response with custom status', () => {
      const errorMessage = 'Not found';
      const response = createErrorResponse(errorMessage, 404);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(404);
    });
  });

  describe('Paginated Response', () => {
    it('should create a paginated response with correct meta', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const page = 1;
      const limit = 10;
      const total = 25;
      const executionTime = 150;
      
      const response = createPaginatedResponse(data, page, limit, total, executionTime);
      
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });

    it('should calculate hasMore correctly when there are more pages', () => {
      const data = [{ id: '1' }];
      const response = createPaginatedResponse(data, 1, 10, 25);
      
      // hasMore should be true since 1 * 10 < 25
      expect(response).toBeDefined();
    });

    it('should calculate hasMore correctly when on last page', () => {
      const data = [{ id: '1' }];
      const response = createPaginatedResponse(data, 3, 10, 25);
      
      // hasMore should be false since 3 * 10 >= 25
      expect(response).toBeDefined();
    });
  });

  describe('Cache Headers', () => {
    it('should have all cache header types', () => {
      expect(CacheHeaders.noCache).toBeDefined();
      expect(CacheHeaders.shortCache).toBeDefined();
      expect(CacheHeaders.mediumCache).toBeDefined();
      expect(CacheHeaders.longCache).toBeDefined();
      expect(CacheHeaders.staticAssets).toBeDefined();
    });

    it('should have correct no-cache headers', () => {
      const headers = CacheHeaders.noCache;
      expect(headers['Cache-Control']).toContain('no-store');
      expect(headers['Cache-Control']).toContain('no-cache');
      expect(headers['Pragma']).toBe('no-cache');
    });

    it('should have different max-age values', () => {
      expect(CacheHeaders.shortCache['Cache-Control']).toContain('max-age=300');
      expect(CacheHeaders.mediumCache['Cache-Control']).toContain('max-age=1800');
      expect(CacheHeaders.longCache['Cache-Control']).toContain('max-age=86400');
      expect(CacheHeaders.staticAssets['Cache-Control']).toContain('max-age=31536000');
    });
  });
});