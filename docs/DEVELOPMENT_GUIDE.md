# H3 Network Platform - Development Guide

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Redis instance (optional for development)
- Git

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd h3-network-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npm run db:seed

# Start development server
npm run dev
```

### Environment Setup
Create `.env.local` with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/h3_platform_dev"
DIRECT_URL="postgresql://username:password@localhost:5432/h3_platform_dev"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret"

# YouTube API
YOUTUBE_API_KEY="your-youtube-api-key"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Sentry (optional)
SENTRY_DSN="your-sentry-dsn"
```

## Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── videos/        # Video management endpoints
│   │   ├── creators/      # Creator management endpoints
│   │   ├── health/        # Health check endpoint
│   │   └── docs/          # API documentation endpoint
│   ├── (auth)/            # Authentication pages
│   ├── creator/           # Creator dashboard
│   ├── videos/            # Video pages
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components
│   ├── forms/             # Form components
│   ├── video/             # Video-related components
│   └── creator/           # Creator-specific components
├── lib/                   # Utility libraries
│   ├── api-response.ts    # API response utilities
│   ├── cache.ts           # Caching system
│   ├── query-optimizer.ts # Database query optimization
│   ├── logger.ts          # Logging utilities
│   ├── prisma.ts          # Prisma client
│   ├── auth.ts            # NextAuth configuration
│   └── utils.ts           # General utilities
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── middleware.ts          # Next.js middleware
```

## Development Workflow

### Running the Application
```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Database Development
```bash
# Create and apply migration
npx prisma migrate dev --name "your-migration-name"

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio

# Generate Prisma client after schema changes
npx prisma generate
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- __tests__/cache.test.ts
```

## Architecture Guidelines

### API Design Principles
1. **RESTful Design**: Use appropriate HTTP methods and status codes
2. **Consistent Response Format**: All responses follow the same structure
3. **Error Handling**: Comprehensive error handling with proper status codes
4. **Performance**: Caching, query optimization, and async operations
5. **Security**: Input validation, authentication, and rate limiting

### Database Design
- **Prisma ORM**: Type-safe database access
- **Migrations**: Version-controlled schema changes
- **Relationships**: Proper foreign key constraints
- **Indexes**: Performance optimization for common queries
- **Soft Deletes**: Preserve data integrity

### Caching Strategy
- **Multi-tier Caching**: In-memory + Redis for scalability
- **TTL Management**: Appropriate cache durations
- **Cache Invalidation**: Automatic cleanup and updates
- **Performance Monitoring**: Cache hit/miss tracking

### Performance Optimization
- **Query Optimization**: Select only needed fields
- **Connection Pooling**: Efficient database connections
- **Async Operations**: Non-blocking operations where possible
- **Monitoring**: Performance metrics and alerting

## Code Standards

### TypeScript
- Use strict TypeScript configuration
- Define proper interfaces and types
- Avoid `any` type unless absolutely necessary
- Use type assertions carefully

```typescript
// Good
interface VideoData {
  id: string;
  title: string;
  duration: number;
}

const video: VideoData = {
  id: 'video_123',
  title: 'Example Video',
  duration: 1800
};

// Avoid
const video: any = { ... };
```

### React Components
- Use functional components with hooks
- Implement proper prop typing
- Follow component naming conventions
- Use proper state management

```typescript
interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnailUrl: string;
  };
  onPlay: (videoId: string) => void;
}

export function VideoCard({ video, onPlay }: VideoCardProps) {
  return (
    <div className="video-card">
      <img src={video.thumbnailUrl} alt={video.title} />
      <h3>{video.title}</h3>
      <button onClick={() => onPlay(video.id)}>Play</button>
    </div>
  );
}
```

### API Routes
- Use proper HTTP methods and status codes
- Implement comprehensive error handling
- Add request validation
- Include performance monitoring

```typescript
import { NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-response';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const startTime = Date.now();
    
    // Validate input
    if (!params.id) {
      return createErrorResponse('Video ID is required', 400);
    }
    
    // Fetch data
    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: { /* only needed fields */ }
    });
    
    if (!video) {
      return createErrorResponse('Video not found', 404);
    }
    
    const executionTime = Date.now() - startTime;
    
    return createSuccessResponse(video, undefined, { executionTime });
  } catch (error) {
    logger.error('Error fetching video', { error, videoId: params.id });
    return createErrorResponse('Internal server error', 500);
  }
}
```

### Error Handling
- Use consistent error response format
- Log errors with appropriate context
- Handle different error types appropriately
- Provide helpful error messages

```typescript
try {
  // Risky operation
} catch (error) {
  if (error instanceof ValidationError) {
    return createErrorResponse(error.message, 400);
  }
  
  if (error instanceof NotFoundError) {
    return createErrorResponse('Resource not found', 404);
  }
  
  // Log unexpected errors
  logger.error('Unexpected error', { error, context });
  return createErrorResponse('Internal server error', 500);
}
```

## Testing Guidelines

### Test Structure
- **Unit Tests**: Individual functions and components
- **Integration Tests**: API endpoints and workflows
- **Component Tests**: React component behavior

### Test Examples
```typescript
// Unit test
describe('Cache System', () => {
  it('should store and retrieve data correctly', async () => {
    await cache.set('test-key', { data: 'test' }, 1000);
    const result = await cache.get('test-key');
    expect(result).toEqual({ data: 'test' });
  });
});

// API integration test
describe('Video API', () => {
  it('should return video data', async () => {
    const response = await fetch('/api/videos/test-id');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe('test-id');
  });
});
```

### Mocking
- Mock external dependencies
- Use proper TypeScript typing for mocks
- Reset mocks between tests

```typescript
jest.mock('../src/lib/prisma', () => ({
  prisma: {
    video: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    }
  }
}));
```

## Common Development Tasks

### Adding a New API Endpoint
1. Create the route file in `src/app/api/`
2. Implement proper request handling
3. Add input validation
4. Include error handling
5. Add caching if appropriate
6. Write tests
7. Update API documentation

### Adding a New Component
1. Create component file in appropriate directory
2. Define proper TypeScript interfaces
3. Implement component logic
4. Add proper styling with Tailwind CSS
5. Write component tests
6. Update Storybook (if applicable)

### Database Schema Changes
1. Modify `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev`
3. Update TypeScript types
4. Update related API endpoints
5. Test changes thoroughly

### Adding New Environment Variables
1. Add to `.env.example`
2. Update documentation
3. Add to deployment configuration
4. Update validation in `src/lib/env.ts`

## Debugging

### Development Tools
- **React Developer Tools**: Component inspection
- **Prisma Studio**: Database inspection
- **Next.js DevTools**: Performance and debugging
- **VS Code Extensions**: TypeScript, Prisma, Tailwind CSS

### Logging
- Use structured logging with context
- Include relevant metadata
- Use appropriate log levels
- Monitor logs in production

```typescript
logger.info('Video viewed', {
  videoId,
  userId,
  timestamp: new Date().toISOString(),
  userAgent: request.headers.get('user-agent')
});
```

### Performance Debugging
- Monitor API response times
- Check cache hit/miss ratios
- Review database query performance
- Use Sentry for error tracking

## Deployment

### Development Deployment
```bash
# Build and test locally
npm run build
npm start

# Test production build
NODE_ENV=production npm start
```

### Environment-Specific Configuration
- Development: `.env.local`
- Staging: `.env.staging`
- Production: Environment variables in deployment platform

## Contributing

### Git Workflow
1. Create feature branch from `main`
2. Make changes with descriptive commits
3. Write/update tests
4. Create pull request
5. Review and merge

### Commit Messages
Use conventional commit format:
```
feat: add video search functionality
fix: resolve cache invalidation issue
docs: update API documentation
test: add unit tests for video service
```

### Code Review Checklist
- [ ] TypeScript errors resolved
- [ ] Tests written and passing
- [ ] Performance considerations addressed
- [ ] Security implications reviewed
- [ ] Documentation updated
- [ ] Error handling implemented

---

**Last Updated**: November 2024  
**Development Guide Version**: 1.0.0