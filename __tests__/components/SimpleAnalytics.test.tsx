import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

// Simple test component for demonstration
const TestAnalytics = () => {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/creator/analytics');
                if (response.ok) {
                    const result = await response.json();
                    setData(result);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div role='status'>Loading analytics...</div>;
    }

    if (!data) {
        return <div>Analytics Unavailable</div>;
    }

    return (
        <div>
            <h1>Analytics Dashboard</h1>
            <p>Track your content performance</p>
            <div data-testid='analytics-content'>Analytics data loaded</div>
        </div>
    );
};

// Mock fetch
global.fetch = vi.fn();

describe('Analytics Component Tests', () => {
    beforeEach(() => {
        (global.fetch as any).mockClear();
    });

    it('displays loading state initially', async () => {
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
                                        analytics: {
                                            overview: { totalViews: 1000 },
                                        },
                                    }),
                            }),
                        100
                    )
                )
        );

        render(<TestAnalytics />);

        expect(screen.getByRole('status')).toBeInTheDocument();
        expect(screen.getByText('Loading analytics...')).toBeInTheDocument();
    });

    it('displays analytics dashboard when data loads', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    analytics: { overview: { totalViews: 1000 } },
                }),
        });

        render(<TestAnalytics />);

        await waitFor(() => {
            expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();
            expect(
                screen.getByText('Track your content performance')
            ).toBeInTheDocument();
            expect(screen.getByTestId('analytics-content')).toBeInTheDocument();
        });
    });

    it('displays error state when API fails', async () => {
        (global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

        render(<TestAnalytics />);

        await waitFor(() => {
            expect(
                screen.getByText('Analytics Unavailable')
            ).toBeInTheDocument();
        });
    });

    it('calls the correct API endpoint', async () => {
        (global.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: () =>
                Promise.resolve({
                    analytics: { overview: { totalViews: 1000 } },
                }),
        });

        render(<TestAnalytics />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/creator/analytics');
        });
    });
});

// Test utility functions
describe('Utility Functions', () => {
    const formatNumber = (num: number | string | undefined): string => {
        const numValue = typeof num === 'string' ? parseInt(num) : num;
        if (typeof numValue !== 'number' || isNaN(numValue)) {
            return '0';
        }
        if (numValue >= 1000000) return (numValue / 1000000).toFixed(1) + 'M';
        if (numValue >= 1000) return (numValue / 1000).toFixed(1) + 'K';
        return numValue.toString();
    };

    const formatPercentage = (num: number | string | undefined): string => {
        const numValue = typeof num === 'string' ? parseFloat(num) : num;
        if (typeof numValue !== 'number' || isNaN(numValue)) {
            return '0.0%';
        }
        return `${numValue.toFixed(1)}%`;
    };

    it('formats numbers correctly', () => {
        expect(formatNumber(1000)).toBe('1.0K');
        expect(formatNumber(1500)).toBe('1.5K');
        expect(formatNumber(1000000)).toBe('1.0M');
        expect(formatNumber(2500000)).toBe('2.5M');
        expect(formatNumber(500)).toBe('500');
    });

    it('handles invalid numbers safely', () => {
        expect(formatNumber(undefined)).toBe('0');
        expect(formatNumber('invalid')).toBe('0');
        expect(formatNumber(NaN)).toBe('0');
    });

    it('formats percentages correctly', () => {
        expect(formatPercentage(7.234)).toBe('7.2%');
        expect(formatPercentage(15.678)).toBe('15.7%');
        expect(formatPercentage(0)).toBe('0.0%');
    });

    it('handles invalid percentages safely', () => {
        expect(formatPercentage(undefined)).toBe('0.0%');
        expect(formatPercentage('invalid')).toBe('0.0%');
        expect(formatPercentage(NaN)).toBe('0.0%');
    });
});
