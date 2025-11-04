# H3 Network Platform - API Reference

## Overview
The H3 Network Platform provides a RESTful API for managing video content, user authentication, and system monitoring. All endpoints include performance monitoring, caching, and comprehensive error handling.

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

## Authentication
The API uses NextAuth.js for authentication with session-based security.

```typescript
// Example authenticated request
const response = await fetch('/api/videos', {
  headers: {
    'Cookie': 'session-token=...'
  }
});
```

## Rate Limiting
- **Limit**: 100 requests per minute per IP address
- **Headers**: Rate limit information included in response headers
- **Enforcement**: Redis-based distributed rate limiting

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635780000
```

## Performance Headers
All API responses include performance metrics:

```
X-Execution-Time: 45
X-Cache-Status: HIT|MISS
Cache-Control: public, max-age=1800
```

## Endpoints

### System Endpoints

#### Health Check
Get system status and performance metrics.

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-04T19:30:00.000Z",
  "database": {
    "connected": true,
    "responseTime": 12
  },
  "cache": {
    "connected": true,
    "hits": 1523,
    "misses": 234,
    "size": 1757,
    "hitRatio": 0.867
  },
  "memory": {
    "used": 45.2,
    "total": 100.0,
    "percentage": 45.2
  },
  "uptime": 86400,
  "version": "1.0.0"
}
```

#### API Documentation
Get comprehensive API documentation.

```http
GET /api/docs
```

**Response:**
```json
{
  "name": "H3 Network Platform API",
  "version": "1.0.0",
  "description": "RESTful API for H3 Network media platform",
  "baseUrl": "/api",
  "authentication": "NextAuth.js sessions",
  "rateLimit": {
    "requests": 100,
    "window": "1 minute",
    "scope": "IP address"
  },
  "endpoints": [...]
}
```

### Video Endpoints

#### Get Video by ID
Retrieve a specific video with caching and performance optimization.

```http
GET /api/videos/{id}
```

**Parameters:**
- `id` (string, required): Video ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "video_123",
    "title": "Criminal Justice Reform: A Path Forward",
    "description": "Discussion on modern approaches to criminal justice reform...",
    "youtubeVideoId": "dQw4w9WgXcQ",
    "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    "duration": 1800,
    "publishedAt": "2024-11-01T10:00:00.000Z",
    "viewCount": 1524,
    "creator": {
      "id": "creator_456",
      "name": "John Doe",
      "profileImage": "https://example.com/profile.jpg"
    },
    "tags": ["criminal justice", "reform", "policy"],
    "category": "EDUCATION",
    "isPublished": true
  },
  "meta": {
    "executionTime": 42,
    "cacheStatus": "HIT",
    "viewUpdated": true
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Video not found",
  "code": "VIDEO_NOT_FOUND",
  "timestamp": "2024-11-04T19:30:00.000Z"
}
```

**Status Codes:**
- `200`: Success
- `404`: Video not found
- `429`: Rate limit exceeded
- `500`: Internal server error

**Performance Features:**
- 30-minute cache TTL
- Async view count updates
- Optimized database queries
- Cache hit/miss tracking

#### List Videos
Get paginated list of videos with filtering and sorting.

```http
GET /api/videos?page=1&limit=10&sort=publishedAt&order=desc&category=EDUCATION
```

**Query Parameters:**
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 10, max: 50): Items per page
- `sort` (string, optional, default: publishedAt): Sort field
- `order` (string, optional, default: desc): Sort order (asc/desc)
- `category` (string, optional): Filter by category
- `creatorId` (string, optional): Filter by creator
- `published` (boolean, optional): Filter by published status

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "video_123",
      "title": "Criminal Justice Reform: A Path Forward",
      "thumbnailUrl": "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      "duration": 1800,
      "publishedAt": "2024-11-01T10:00:00.000Z",
      "viewCount": 1524,
      "creator": {
        "name": "John Doe"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16,
    "hasMore": true
  },
  "meta": {
    "executionTime": 67,
    "cacheStatus": "MISS"
  }
}
```

### Creator Endpoints

#### Get Creator Profile
Retrieve creator information with their videos.

```http
GET /api/creators/{id}
```

**Parameters:**
- `id` (string, required): Creator ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "creator_456",
    "name": "John Doe",
    "bio": "Criminal justice reform advocate...",
    "profileImage": "https://example.com/profile.jpg",
    "socialLinks": {
      "twitter": "https://twitter.com/johndoe",
      "youtube": "https://youtube.com/c/johndoe"
    },
    "statistics": {
      "totalVideos": 45,
      "totalViews": 125430,
      "subscriberCount": 12500
    },
    "recentVideos": [...]
  }
}
```

### Authentication Endpoints

#### Get Session
Retrieve current user session information.

```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "user_789",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "USER",
    "image": "https://example.com/avatar.jpg"
  },
  "expires": "2024-12-04T19:30:00.000Z"
}
```

### Search Endpoints

#### Search Content
Search videos, creators, and other content.

```http
GET /api/search?q=criminal%20justice&type=videos&page=1&limit=10
```

**Query Parameters:**
- `q` (string, required): Search query
- `type` (string, optional, default: all): Search type (videos, creators, all)
- `page` (number, optional, default: 1): Page number
- `limit` (number, optional, default: 10): Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "videos": [...],
    "creators": [...],
    "totalResults": 89
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 89,
    "hasMore": true
  }
}
```

## Error Handling

### Error Response Format
All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error"
  },
  "timestamp": "2024-11-04T19:30:00.000Z",
  "requestId": "req_abc123"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## SDKs and Libraries

### JavaScript/TypeScript
```typescript
// Example API client
class H3ApiClient {
  constructor(private baseUrl: string) {}
  
  async getVideo(id: string) {
    const response = await fetch(`${this.baseUrl}/videos/${id}`);
    return response.json();
  }
  
  async searchVideos(query: string, page = 1) {
    const url = `${this.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`;
    const response = await fetch(url);
    return response.json();
  }
}
```

### cURL Examples
```bash
# Get video
curl -X GET "https://your-domain.com/api/videos/video_123" \
  -H "Accept: application/json"

# Search with authentication
curl -X GET "https://your-domain.com/api/search?q=reform" \
  -H "Accept: application/json" \
  -H "Cookie: session-token=..."

# Health check
curl -X GET "https://your-domain.com/api/health"
```

## Rate Limiting

### Limits
- **Default**: 100 requests per minute per IP
- **Authenticated**: 200 requests per minute per user
- **Premium**: 500 requests per minute per user

### Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1635780000
X-RateLimit-Retry-After: 60
```

### Handling Rate Limits
```typescript
async function makeApiRequest(url: string) {
  const response = await fetch(url);
  
  if (response.status === 429) {
    const retryAfter = response.headers.get('X-RateLimit-Retry-After');
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    return null;
  }
  
  return response.json();
}
```

## Caching

### Cache Headers
The API uses intelligent caching with appropriate headers:

- **Static Content**: `Cache-Control: public, max-age=31536000`
- **Dynamic Content**: `Cache-Control: public, max-age=1800`
- **Private Content**: `Cache-Control: private, max-age=300`
- **No Cache**: `Cache-Control: no-store, no-cache`

### Cache Strategies
- **Videos**: 30-minute cache with async updates
- **Search Results**: 5-minute cache
- **User Data**: No cache or short private cache
- **Static Assets**: Long-term caching with versioning

## Webhooks

### Available Webhooks
- `video.published`: New video published
- `video.updated`: Video metadata updated
- `user.registered`: New user registration

### Webhook Format
```json
{
  "event": "video.published",
  "timestamp": "2024-11-04T19:30:00.000Z",
  "data": {
    "videoId": "video_123",
    "title": "New Video Title",
    "creatorId": "creator_456"
  }
}
```

## Monitoring and Analytics

### Performance Metrics
- Response times tracked per endpoint
- Cache hit/miss ratios
- Error rates and types
- Request volume and patterns

### Health Monitoring
- Database connectivity and performance
- Cache system status
- Memory and CPU usage
- Third-party service availability

---

**Last Updated**: November 2024  
**API Version**: 1.0.0  
**Documentation Version**: 1.0.0