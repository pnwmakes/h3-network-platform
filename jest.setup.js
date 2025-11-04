// Jest setup file
import { jest } from '@jest/globals'

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-purposes-only'
process.env.NEXTAUTH_URL = 'http://localhost:3000'
process.env.APP_URL = 'http://localhost:3000'

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
// import '@testing-library/jest-dom'

// Mock Redis
global.Redis = class MockRedis {
  constructor() {
    this.data = new Map();
  }
  
  async get(key) {
    return this.data.get(key) || null;
  }
  
  async set(key, value) {
    this.data.set(key, value);
    return 'OK';
  }
  
  async del(key) {
    return this.data.delete(key) ? 1 : 0;
  }
  
  async quit() {
    return 'OK';
  }
};

// Mock Sentry
jest.mock('@sentry/nextjs', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  withScope: jest.fn((callback) => callback({
    setTag: jest.fn(),
    setLevel: jest.fn(),
    setContext: jest.fn(),
  })),
}));

// Mock Prisma client for tests (update path)
jest.mock('./src/lib/prisma', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    video: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    creator: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $disconnect: jest.fn(),
  },
}));

// Mock Redis for tests
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    setEx: jest.fn(),
    del: jest.fn(),
    flushDb: jest.fn(),
  })),
}))

// Mock Sentry for tests
jest.mock('@sentry/nextjs', () => ({
  withScope: jest.fn((callback) => callback({
    setTag: jest.fn(),
    setExtra: jest.fn(),
    setLevel: jest.fn(),
  })),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
}))

// Setup global test timeout
jest.setTimeout(10000)