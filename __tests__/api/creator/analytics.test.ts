import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/creator/analytics/route';
import { getServerSession } from 'next-auth';

// Mock next-auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

// Mock auth options
vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

const mockGetServerSession = getServerSession as any;

describe('/api/creator/analytics API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Authentication', () => {
        it('returns 401 when user is not authenticated', async () => {
            mockGetServerSession.mockResolvedValueOnce(null);

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('returns 401 when user role is not CREATOR or SUPER_ADMIN', async () => {
            mockGetServerSession.mockResolvedValueOnce({
                user: {
                    id: '1',
                    role: 'USER',
                },
            });

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(401);
            expect(data.error).toBe('Unauthorized');
        });

        it('allows access for CREATOR role', async () => {
            mockGetServerSession.mockResolvedValueOnce({
                user: {
                    id: '1',
                    role: 'CREATOR',
                },
            });

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.analytics).toBeDefined();
        });

        it('allows access for SUPER_ADMIN role', async () => {
            mockGetServerSession.mockResolvedValueOnce({
                user: {
                    id: '1',
                    role: 'SUPER_ADMIN',
                },
            });

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.analytics).toBeDefined();
        });
    });

    describe('Analytics Data Structure', () => {
        beforeEach(() => {
            mockGetServerSession.mockResolvedValue({
                user: {
                    id: '1',
                    role: 'CREATOR',
                },
            });
        });

        it('returns properly structured analytics data', async () => {
            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);

            const analytics = data.analytics;
            expect(analytics).toHaveProperty('overview');
            expect(analytics).toHaveProperty('timeRange');
            expect(analytics).toHaveProperty('contentPerformance');
            expect(analytics).toHaveProperty('audienceInsights');
            expect(analytics).toHaveProperty('goals');
        });

        it('includes all required overview fields', async () => {
            const response = await GET();
            const data = await response.json();
            const overview = data.analytics.overview;

            expect(overview).toHaveProperty('totalViews');
            expect(overview).toHaveProperty('totalLikes');
            expect(overview).toHaveProperty('totalComments');
            expect(overview).toHaveProperty('totalShares');
            expect(overview).toHaveProperty('avgViewDuration');
            expect(overview).toHaveProperty('engagementRate');
            expect(overview).toHaveProperty('subscriberGrowth');
            expect(overview).toHaveProperty('contentCount');

            // Check data types
            expect(typeof overview.totalViews).toBe('number');
            expect(typeof overview.engagementRate).toBe('number');
            expect(typeof overview.subscriberGrowth).toBe('number');
        });

        it('includes time range data with correct structure', async () => {
            const response = await GET();
            const data = await response.json();
            const timeRange = data.analytics.timeRange;

            expect(timeRange).toHaveProperty('views');
            expect(timeRange).toHaveProperty('engagement');
            expect(timeRange).toHaveProperty('contentPublished');

            expect(Array.isArray(timeRange.views)).toBe(true);
            expect(Array.isArray(timeRange.engagement)).toBe(true);
            expect(Array.isArray(timeRange.contentPublished)).toBe(true);

            // Check array item structure
            if (timeRange.views.length > 0) {
                expect(timeRange.views[0]).toHaveProperty('date');
                expect(timeRange.views[0]).toHaveProperty('count');
            }
        });

        it('includes content performance with videos and blogs', async () => {
            const response = await GET();
            const data = await response.json();
            const contentPerformance = data.analytics.contentPerformance;

            expect(contentPerformance).toHaveProperty('videos');
            expect(contentPerformance).toHaveProperty('blogs');
            expect(Array.isArray(contentPerformance.videos)).toBe(true);
            expect(Array.isArray(contentPerformance.blogs)).toBe(true);

            // Check video structure
            if (contentPerformance.videos.length > 0) {
                const video = contentPerformance.videos[0];
                expect(video).toHaveProperty('id');
                expect(video).toHaveProperty('title');
                expect(video).toHaveProperty('type');
                expect(video).toHaveProperty('views');
                expect(video).toHaveProperty('engagement');
            }
        });

        it('includes audience insights with demographics and behavior', async () => {
            const response = await GET();
            const data = await response.json();
            const audienceInsights = data.analytics.audienceInsights;

            expect(audienceInsights).toHaveProperty('demographics');
            expect(audienceInsights).toHaveProperty('behavior');

            const demographics = audienceInsights.demographics;
            expect(demographics).toHaveProperty('ageGroups');
            expect(demographics).toHaveProperty('locations');
            expect(demographics).toHaveProperty('interests');

            const behavior = audienceInsights.behavior;
            expect(behavior).toHaveProperty('peakHours');
            expect(behavior).toHaveProperty('deviceTypes');
        });

        it('includes goals with monthly and quarterly targets', async () => {
            const response = await GET();
            const data = await response.json();
            const goals = data.analytics.goals;

            expect(goals).toHaveProperty('monthly');
            expect(goals).toHaveProperty('quarterly');

            expect(goals.monthly).toHaveProperty('target');
            expect(goals.monthly).toHaveProperty('current');
            expect(goals.monthly).toHaveProperty('period');

            expect(goals.quarterly).toHaveProperty('target');
            expect(goals.quarterly).toHaveProperty('current');
            expect(goals.quarterly).toHaveProperty('period');
        });
    });

    describe('Data Validation', () => {
        beforeEach(() => {
            mockGetServerSession.mockResolvedValue({
                user: {
                    id: '1',
                    role: 'CREATOR',
                },
            });
        });

        it('generates valid numeric ranges for analytics', async () => {
            const response = await GET();
            const data = await response.json();
            const overview = data.analytics.overview;

            expect(overview.totalViews).toBeGreaterThan(0);
            expect(overview.engagementRate).toBeGreaterThan(0);
            expect(overview.subscriberGrowth).toBeGreaterThan(0);
            expect(overview.avgViewDuration).toBeGreaterThan(0);
        });

        it('generates valid date strings in time range data', async () => {
            const response = await GET();
            const data = await response.json();
            const views = data.analytics.timeRange.views;

            views.forEach((item: any) => {
                expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/); // YYYY-MM-DD format
                expect(new Date(item.date).toString()).not.toBe('Invalid Date');
            });
        });

        it('generates content with valid publishedAt dates', async () => {
            const response = await GET();
            const data = await response.json();
            const videos = data.analytics.contentPerformance.videos;

            videos.forEach((video: any) => {
                expect(new Date(video.publishedAt).toString()).not.toBe(
                    'Invalid Date'
                );
                expect(video.publishedAt).toMatch(
                    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
                ); // ISO format
            });
        });

        it('ensures percentage values are within valid ranges', async () => {
            const response = await GET();
            const data = await response.json();
            const ageGroups =
                data.analytics.audienceInsights.demographics.ageGroups;

            ageGroups.forEach((group: any) => {
                expect(group.percentage).toBeGreaterThanOrEqual(0);
                expect(group.percentage).toBeLessThanOrEqual(100);
            });
        });
    });

    describe('Error Handling', () => {
        it('handles session retrieval errors gracefully', async () => {
            mockGetServerSession.mockRejectedValueOnce(
                new Error('Session error')
            );

            const response = await GET();
            const data = await response.json();

            expect(response.status).toBe(500);
            expect(data.error).toBe('Failed to fetch analytics');
        });

        it('returns consistent error format', async () => {
            mockGetServerSession.mockRejectedValueOnce(
                new Error('Database error')
            );

            const response = await GET();
            const data = await response.json();

            expect(data).toHaveProperty('error');
            expect(typeof data.error).toBe('string');
        });
    });

    describe('Performance', () => {
        beforeEach(() => {
            mockGetServerSession.mockResolvedValue({
                user: {
                    id: '1',
                    role: 'CREATOR',
                },
            });
        });

        it('responds within reasonable time limits', async () => {
            const start = Date.now();
            const response = await GET();
            const end = Date.now();

            expect(response.status).toBe(200);
            expect(end - start).toBeLessThan(1000); // Should respond within 1 second
        });

        it('generates consistent data structure across multiple calls', async () => {
            const response1 = await GET();
            const response2 = await GET();

            const data1 = await response1.json();
            const data2 = await response2.json();

            // Structure should be identical even if values differ
            expect(Object.keys(data1.analytics)).toEqual(
                Object.keys(data2.analytics)
            );
            expect(Object.keys(data1.analytics.overview)).toEqual(
                Object.keys(data2.analytics.overview)
            );
        });
    });

    describe('Mock Data Quality', () => {
        beforeEach(() => {
            mockGetServerSession.mockResolvedValue({
                user: {
                    id: '1',
                    role: 'CREATOR',
                },
            });
        });

        it('generates realistic engagement rates', async () => {
            const response = await GET();
            const data = await response.json();
            const engagementRate = data.analytics.overview.engagementRate;

            // Typical engagement rates are between 1-15%
            expect(engagementRate).toBeGreaterThan(1);
            expect(engagementRate).toBeLessThan(15);
        });

        it('generates realistic view counts', async () => {
            const response = await GET();
            const data = await response.json();
            const totalViews = data.analytics.overview.totalViews;

            // Should generate reasonable view counts
            expect(totalViews).toBeGreaterThan(100);
            expect(totalViews).toBeLessThan(1000000);
        });

        it('maintains logical relationships between metrics', async () => {
            const response = await GET();
            const data = await response.json();
            const overview = data.analytics.overview;

            // Likes should typically be less than views
            expect(overview.totalLikes).toBeLessThan(overview.totalViews);

            // Comments should typically be less than likes
            expect(overview.totalComments).toBeLessThan(overview.totalLikes);
        });
    });
});
