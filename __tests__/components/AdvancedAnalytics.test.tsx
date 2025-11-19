import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdvancedAnalytics } from '@/components/creator/AdvancedAnalytics';

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
        replace: vi.fn(),
        refresh: vi.fn(),
    }),
}));

// Mock UI components
vi.mock('@/components/ui/card', () => ({
    Card: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => React.createElement('div', { className }, children),
    CardContent: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => React.createElement('div', { className }, children),
    CardHeader: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => React.createElement('div', { className }, children),
    CardTitle: ({
        children,
        className,
    }: {
        children: React.ReactNode;
        className?: string;
    }) => React.createElement('h3', { className }, children),
}));

vi.mock('@/components/ui/tabs', () => ({
    Tabs: ({ children, defaultValue }: any) => (
        <div data-testid='tabs' data-default={defaultValue}>
            {children}
        </div>
    ),
    TabsContent: ({ children, value }: any) => (
        <div data-testid={`tab-content-${value}`}>{children}</div>
    ),
    TabsList: ({ children }: any) => (
        <div data-testid='tabs-list'>{children}</div>
    ),
    TabsTrigger: ({ children, value }: any) => (
        <button data-testid={`tab-trigger-${value}`}>{children}</button>
    ),
}));

vi.mock('@/components/ui/button', () => ({
    Button: ({ children, onClick, disabled, variant }: any) => (
        <button onClick={onClick} disabled={disabled} data-variant={variant}>
            {children}
        </button>
    ),
}));

vi.mock('@/components/ui/select', () => ({
    Select: ({ children, value, onValueChange }: any) => (
        <div
            data-testid='select'
            data-value={value}
            onClick={() => onValueChange?.('test')}
        >
            {children}
        </div>
    ),
    SelectContent: ({ children }: any) => <div>{children}</div>,
    SelectItem: ({ children, value }: any) => (
        <option value={value}>{children}</option>
    ),
    SelectTrigger: ({ children }: any) => <div>{children}</div>,
    SelectValue: () => <span>Select Value</span>,
}));

vi.mock('@/components/ui/badge', () => ({
    Badge: ({ children, className }: any) => (
        <span className={className}>{children}</span>
    ),
}));

const mockAnalyticsData = {
    overview: {
        totalViews: 125430,
        totalLikes: 8920,
        totalComments: 1240,
        totalShares: 680,
        engagementRate: 7.2,
        avgViewDuration: 240,
        subscriberGrowth: 15.5,
        contentCount: 28,
    },
    timeRange: {
        views: [
            { date: '2024-01-15', count: 1500 },
            { date: '2024-01-16', count: 2200 },
        ],
        engagement: [
            { date: '2024-01-15', rate: 6.5 },
            { date: '2024-01-16', rate: 7.8 },
        ],
        contentPublished: [
            { date: '2024-01-15', count: 2 },
            { date: '2024-01-16', count: 1 },
        ],
    },
    contentPerformance: {
        videos: [
            {
                id: '1',
                title: 'Test Video 1',
                type: 'video' as const,
                publishedAt: '2024-01-15T10:00:00Z',
                views: 15420,
                likes: 890,
                comments: 124,
                shares: 67,
                engagementRate: 8.5,
                avgViewDuration: 280,
                status: 'PUBLISHED',
                performance: 'excellent' as const,
            },
        ],
        blogs: [
            {
                id: '2',
                title: 'Test Blog 1',
                type: 'blog' as const,
                publishedAt: '2024-01-12T09:00:00Z',
                views: 4320,
                likes: 234,
                comments: 45,
                shares: 23,
                engagementRate: 7.1,
                readTime: 5,
                status: 'PUBLISHED',
                performance: 'good' as const,
            },
        ],
    },
    audienceInsights: {
        demographics: {
            ageGroups: [
                { range: '18-24', percentage: 15 },
                { range: '25-34', percentage: 35 },
            ],
            locations: [
                { country: 'United States', percentage: 78 },
                { country: 'Canada', percentage: 12 },
            ],
            interests: [
                { topic: 'Criminal Justice Reform', percentage: 45 },
                { topic: 'Addiction Recovery', percentage: 38 },
            ],
        },
        behavior: {
            peakHours: [
                { hour: 9, activity: 85 },
                { hour: 14, activity: 92 },
            ],
            deviceTypes: [
                { type: 'Mobile', percentage: 65 },
                { type: 'Desktop', percentage: 35 },
            ],
        },
    },
    goals: {
        monthly: {
            target: 50000,
            current: 32450,
            period: 'January 2024',
        },
        quarterly: {
            target: 150000,
            current: 89230,
            period: 'Q1 2024',
        },
    },
};

describe('AdvancedAnalytics Component', () => {
    beforeEach(() => {
        // Reset fetch mock before each test
        (global.fetch as any).mockReset();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('Loading States', () => {
        it('displays loading spinner while fetching data', async () => {
            // Mock delayed response
            (global.fetch as any).mockImplementationOnce(
                () =>
                    new Promise((resolve) =>
                        setTimeout(
                            () =>
                                resolve({
                                    ok: true,
                                    json: () =>
                                        Promise.resolve({
                                            analytics: mockAnalyticsData,
                                        }),
                                }),
                            100
                        )
                    )
            );

            render(<AdvancedAnalytics />);

            expect(screen.getByRole('status')).toBeInTheDocument();
            expect(screen.getByText(/loading/i)).toBeInTheDocument();
        });

        it('displays error state when API fails', async () => {
            (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

            render(<AdvancedAnalytics />);

            await waitFor(() => {
                expect(
                    screen.getByText(/analytics unavailable/i)
                ).toBeInTheDocument();
                expect(screen.getByText(/try again/i)).toBeInTheDocument();
            });
        });
    });

    describe('Data Display', () => {
        beforeEach(() => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ analytics: mockAnalyticsData }),
            });
        });

        it('renders analytics dashboard with data', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                expect(
                    screen.getByText('Analytics Dashboard')
                ).toBeInTheDocument();
                expect(
                    screen.getByText(
                        'Track your content performance and audience engagement'
                    )
                ).toBeInTheDocument();
            });
        });

        it('displays overview metrics correctly', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                expect(screen.getByText('125.4K')).toBeInTheDocument(); // totalViews formatted
                expect(screen.getByText('7.2%')).toBeInTheDocument(); // engagementRate
                expect(screen.getByText('4:00')).toBeInTheDocument(); // avgViewDuration formatted
                expect(screen.getByText('28')).toBeInTheDocument(); // contentCount
            });
        });

        it('shows content performance data', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                expect(screen.getByText('Test Video 1')).toBeInTheDocument();
                expect(screen.getByText('Test Blog 1')).toBeInTheDocument();
                expect(screen.getByText('15.4K views')).toBeInTheDocument();
                expect(screen.getByText('4.3K views')).toBeInTheDocument();
            });
        });
    });

    describe('User Interactions', () => {
        beforeEach(() => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ analytics: mockAnalyticsData }),
            });
        });

        it('handles time range filter changes', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                const timeRangeSelect = screen.getByTestId('select');
                fireEvent.click(timeRangeSelect);
            });

            // Should trigger new API call with updated time range
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('timeRange=test'),
                expect.any(Object)
            );
        });

        it('handles refresh button click', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                const refreshButton = screen.getByRole('button', {
                    name: /refresh/i,
                });
                fireEvent.click(refreshButton);
            });

            // Should trigger additional API call
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        it('handles export functionality', async () => {
            // Mock URL.createObjectURL and related DOM methods
            global.URL.createObjectURL = vi.fn(() => 'mock-url');
            global.URL.revokeObjectURL = vi.fn();

            const mockLink = {
                click: vi.fn(),
                href: '',
                download: '',
            };
            vi.spyOn(document, 'createElement').mockReturnValue(
                mockLink as any
            );
            vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn());
            vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn());

            render(<AdvancedAnalytics />);

            await waitFor(() => {
                const exportButton = screen.getByRole('button', {
                    name: /export/i,
                });
                fireEvent.click(exportButton);
            });

            expect(mockLink.click).toHaveBeenCalled();
            expect(global.URL.createObjectURL).toHaveBeenCalled();
        });
    });

    describe('Defensive Programming', () => {
        it('handles undefined analytics data gracefully', async () => {
            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ analytics: null }),
            });

            render(<AdvancedAnalytics />);

            await waitFor(() => {
                expect(
                    screen.getByText(/analytics unavailable/i)
                ).toBeInTheDocument();
            });
        });

        it('handles missing nested properties', async () => {
            const incompleteData = {
                overview: {
                    totalViews: 1000,
                    // Missing other required properties
                },
                // Missing other required sections
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ analytics: incompleteData }),
            });

            render(<AdvancedAnalytics />);

            await waitFor(() => {
                // Should not crash and should handle missing data
                expect(
                    screen.getByText('Analytics Dashboard')
                ).toBeInTheDocument();
            });
        });

        it('formats numbers safely with invalid inputs', async () => {
            const dataWithInvalidNumbers = {
                ...mockAnalyticsData,
                overview: {
                    ...mockAnalyticsData.overview,
                    totalViews: 'invalid' as any,
                    engagementRate: undefined as any,
                },
            };

            (global.fetch as any).mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({ analytics: dataWithInvalidNumbers }),
            });

            render(<AdvancedAnalytics />);

            await waitFor(() => {
                // Should display default values instead of crashing
                expect(screen.getByText('0')).toBeInTheDocument(); // Invalid number formatted as 0
                expect(screen.getByText('0.0%')).toBeInTheDocument(); // Undefined percentage formatted as 0.0%
            });
        });
    });

    describe('Tab Navigation', () => {
        beforeEach(() => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ analytics: mockAnalyticsData }),
            });
        });

        it('renders all tab triggers', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                expect(
                    screen.getByTestId('tab-trigger-performance')
                ).toBeInTheDocument();
                expect(
                    screen.getByTestId('tab-trigger-audience')
                ).toBeInTheDocument();
                expect(
                    screen.getByTestId('tab-trigger-content')
                ).toBeInTheDocument();
                expect(
                    screen.getByTestId('tab-trigger-goals')
                ).toBeInTheDocument();
            });
        });

        it('displays performance tab content by default', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                expect(
                    screen.getByTestId('tab-content-performance')
                ).toBeInTheDocument();
                expect(screen.getByText('Views Over Time')).toBeInTheDocument();
                expect(
                    screen.getByText('Top Performing Content')
                ).toBeInTheDocument();
            });
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            (global.fetch as any).mockResolvedValue({
                ok: true,
                json: () => Promise.resolve({ analytics: mockAnalyticsData }),
            });
        });

        it('has proper ARIA labels and roles', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                // Check for proper button roles
                expect(
                    screen.getByRole('button', { name: /refresh/i })
                ).toBeInTheDocument();
                expect(
                    screen.getByRole('button', { name: /export/i })
                ).toBeInTheDocument();

                // Check for proper heading structure
                expect(
                    screen.getByRole('heading', {
                        name: /analytics dashboard/i,
                    })
                ).toBeInTheDocument();
            });
        });

        it('maintains focus management for interactive elements', async () => {
            render(<AdvancedAnalytics />);

            await waitFor(() => {
                const refreshButton = screen.getByRole('button', {
                    name: /refresh/i,
                });
                refreshButton.focus();
                expect(document.activeElement).toBe(refreshButton);
            });
        });
    });
});
