import { describe, it, expect, vi } from 'vitest';
import { GET } from '@/app/api/creator/analytics/route';

// Mock next-auth
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(),
}));

// Mock auth options
vi.mock('@/lib/auth', () => ({
    authOptions: {},
}));

describe('Analytics API Route', () => {
    // Use the mocked function directly
    const { getServerSession } = await import('next-auth');
    const mockGetServerSession = vi.mocked(getServerSession);

    beforeEach(() => {
        vi.clearAllMocks();
    });

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
        } as any);

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
        } as any);

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.analytics).toBeDefined();
    });

    it('returns properly structured analytics data', async () => {
        mockGetServerSession.mockResolvedValue({
            user: {
                id: '1',
                role: 'CREATOR',
            },
        } as any);

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
        mockGetServerSession.mockResolvedValue({
            user: {
                id: '1',
                role: 'CREATOR',
            },
        } as any);

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

    it('generates valid numeric ranges for analytics', async () => {
        mockGetServerSession.mockResolvedValue({
            user: {
                id: '1',
                role: 'CREATOR',
            },
        } as any);

        const response = await GET();
        const data = await response.json();
        const overview = data.analytics.overview;

        expect(overview.totalViews).toBeGreaterThan(0);
        expect(overview.engagementRate).toBeGreaterThan(0);
        expect(overview.subscriberGrowth).toBeGreaterThan(0);
        expect(overview.avgViewDuration).toBeGreaterThan(0);
    });

    it('handles errors gracefully', async () => {
        mockGetServerSession.mockRejectedValueOnce(new Error('Session error'));

        const response = await GET();
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.error).toBe('Failed to fetch analytics');
    });
});
