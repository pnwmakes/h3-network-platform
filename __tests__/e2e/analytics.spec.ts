import { test, expect } from '@playwright/test';

test.describe('Analytics Dashboard E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to the analytics page
        await page.goto('/creator/analytics');
    });

    test.describe('Page Load and Initial State', () => {
        test('loads analytics dashboard with correct title', async ({
            page,
        }) => {
            await expect(page).toHaveTitle(/H3 Network/);
            await expect(
                page.getByRole('heading', { name: 'Analytics Dashboard' })
            ).toBeVisible();
            await expect(
                page.getByText(
                    'Track your content performance and audience engagement'
                )
            ).toBeVisible();
        });

        test('displays loading state initially', async ({ page }) => {
            // Intercept API call to simulate slow response
            await page.route('/api/creator/analytics*', async (route) => {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                route.continue();
            });

            await page.reload();

            // Should show loading spinner
            await expect(page.locator('.animate-spin')).toBeVisible();
        });

        test('displays error state when API fails', async ({ page }) => {
            // Intercept API call to return error
            await page.route('/api/creator/analytics*', (route) => {
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Server error' }),
                });
            });

            await page.reload();

            await expect(page.getByText('Analytics Unavailable')).toBeVisible();
            await expect(
                page.getByRole('button', { name: 'Try Again' })
            ).toBeVisible();
        });
    });

    test.describe('Data Display and Metrics', () => {
        test('displays overview metrics cards', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            // Check for metric cards
            await expect(page.getByText('Total Views')).toBeVisible();
            await expect(page.getByText('Engagement Rate')).toBeVisible();
            await expect(page.getByText('Avg View Duration')).toBeVisible();
            await expect(page.getByText('Content Published')).toBeVisible();

            // Check for metric values (should contain numbers/percentages)
            const viewsCard = page
                .locator('text=Total Views')
                .locator('..')
                .locator('..');
            await expect(viewsCard).toContainText(/\d/); // Contains numbers
        });

        test('displays formatted numbers correctly', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            // Look for formatted numbers (K, M suffixes, percentages, time formats)
            const metricsSection = page
                .locator('[data-testid="metrics-overview"]')
                .first();

            // Should find formatted view counts
            await expect(page.locator('text=/\\d+\\.\\d+[KM]/')).toBeVisible();

            // Should find percentage values
            await expect(page.locator('text=/\\d+\\.\\d+%/')).toBeVisible();

            // Should find time duration format (M:SS)
            await expect(page.locator('text=/\\d+:\\d{2}/')).toBeVisible();
        });
    });

    test.describe('Tab Navigation', () => {
        test('switches between analytics tabs', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            // Check default tab (Performance)
            const performanceTab = page.getByRole('tab', {
                name: 'Performance',
            });
            await expect(performanceTab).toHaveAttribute(
                'data-state',
                'active'
            );
            await expect(page.getByText('Views Over Time')).toBeVisible();

            // Switch to Audience tab
            await page.getByRole('tab', { name: 'Audience' }).click();
            await expect(page.getByText('Audience Demographics')).toBeVisible();
            await expect(page.getByText('Age Groups')).toBeVisible();

            // Switch to Content tab
            await page.getByRole('tab', { name: 'Content' }).click();
            await expect(
                page.getByText('All Content Performance')
            ).toBeVisible();

            // Switch to Goals tab
            await page.getByRole('tab', { name: 'Goals' }).click();
            await expect(page.getByText('Monthly Goals')).toBeVisible();
            await expect(page.getByText('Quarterly Goals')).toBeVisible();
        });

        test('displays content in performance tab', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            // Should show top performing content
            await expect(
                page.getByText('Top Performing Content')
            ).toBeVisible();

            // Should display content items with performance badges
            const performanceBadges = page.locator(
                '.bg-green-100, .bg-blue-100, .bg-yellow-100, .bg-red-100'
            );
            await expect(performanceBadges.first()).toBeVisible();
        });

        test('displays audience insights correctly', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            await page.getByRole('tab', { name: 'Audience' }).click();

            // Check age group bars
            const ageGroupSection = page
                .locator('text=Age Groups')
                .locator('..');
            await expect(ageGroupSection).toContainText('18-24');
            await expect(ageGroupSection).toContainText('25-34');

            // Check progress bars are visible
            await expect(
                page.locator('.bg-blue-500.h-2.rounded-full')
            ).toBeVisible();
        });
    });

    test.describe('Interactive Controls', () => {
        test('changes time range filter', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            // Find time range select
            const timeRangeSelect = page.locator('select').first();
            await timeRangeSelect.selectOption('30d');

            // Should trigger API call with new time range
            const response = page.waitForResponse(
                (response) =>
                    response.url().includes('/api/creator/analytics') &&
                    response.url().includes('timeRange=30d')
            );

            await response;
        });

        test('changes content filter', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            // Find content filter select
            const contentSelect = page.locator('select').last();
            await contentSelect.selectOption('videos');

            // Should trigger API call with new filter
            const response = page.waitForResponse(
                (response) =>
                    response.url().includes('/api/creator/analytics') &&
                    response.url().includes('filter=videos')
            );

            await response;
        });

        test('refresh button works', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            const refreshButton = page
                .getByRole('button')
                .filter({ hasText: /refresh/i });

            // Click refresh and wait for API call
            const responsePromise = page.waitForResponse(
                '/api/creator/analytics*'
            );
            await refreshButton.click();
            await responsePromise;

            // Button should show loading state briefly
            await expect(refreshButton.locator('.animate-spin')).toBeVisible();
        });

        test('export functionality works', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            // Set up download expectation
            const downloadPromise = page.waitForEvent('download');

            await page.getByRole('button', { name: /export/i }).click();

            const download = await downloadPromise;
            expect(download.suggestedFilename()).toMatch(
                /creator-analytics-\d{4}-\d{2}-\d{2}\.json/
            );
        });
    });

    test.describe('Content Performance Table', () => {
        test('displays content table with correct data', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            await page.getByRole('tab', { name: 'Content' }).click();

            // Check table headers
            await expect(
                page.getByRole('columnheader', { name: 'Content' })
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Type' })
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Views' })
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Engagement' })
            ).toBeVisible();
            await expect(
                page.getByRole('columnheader', { name: 'Performance' })
            ).toBeVisible();

            // Check for content rows
            const contentRows = page.locator('tbody tr');
            await expect(contentRows).toHaveCount(3); // Should have sample content
        });

        test('sorts content by publish date by default', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            await page.getByRole('tab', { name: 'Content' }).click();

            const publishDates = page.locator('tbody tr td:last-child');
            const firstDate = await publishDates.first().textContent();
            const lastDate = await publishDates.last().textContent();

            // First date should be more recent than last date
            expect(new Date(firstDate!).getTime()).toBeGreaterThan(
                new Date(lastDate!).getTime()
            );
        });
    });

    test.describe('Goals Progress', () => {
        test('displays goal progress bars', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            await page.getByRole('tab', { name: 'Goals' }).click();

            // Check monthly goals
            await expect(page.getByText('Monthly Goals')).toBeVisible();
            await expect(page.getByText('Views Target')).toBeVisible();

            // Check progress bars
            const progressBars = page.locator(
                '.bg-blue-500.h-2.rounded-full, .bg-green-500.h-2.rounded-full'
            );
            await expect(progressBars).toHaveCount(2); // Monthly and quarterly
        });

        test('shows progress percentages', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            await page.getByRole('tab', { name: 'Goals' }).click();

            // Should display percentage completion
            await expect(
                page.locator('text=/\\d+\\.\\d+% of monthly goal/')
            ).toBeVisible();
            await expect(
                page.locator('text=/\\d+\\.\\d+% of quarterly goal/')
            ).toBeVisible();
        });
    });

    test.describe('Responsive Design', () => {
        test('adapts to mobile viewport', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForLoadState('networkidle');

            // Check that metric cards stack vertically
            const metricCards = page.locator('[class*="grid-cols-1"]').first();
            await expect(metricCards).toBeVisible();

            // Check that controls stack on mobile
            const controlsSection = page.locator('.flex-col');
            await expect(controlsSection).toBeVisible();
        });

        test('works on tablet viewport', async ({ page }) => {
            await page.setViewportSize({ width: 768, height: 1024 });
            await page.waitForLoadState('networkidle');

            // Should display properly on tablet
            await expect(page.getByText('Analytics Dashboard')).toBeVisible();

            // Tabs should be accessible
            await page.getByRole('tab', { name: 'Audience' }).click();
            await expect(page.getByText('Audience Demographics')).toBeVisible();
        });
    });

    test.describe('Performance and Loading', () => {
        test('loads within acceptable time limits', async ({ page }) => {
            const startTime = Date.now();

            await page.goto('/creator/analytics');
            await page.waitForLoadState('networkidle');

            const loadTime = Date.now() - startTime;
            expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
        });

        test('handles concurrent API requests properly', async ({ page }) => {
            await page.waitForLoadState('networkidle');

            // Quickly change filters multiple times
            const timeRangeSelect = page.locator('select').first();
            await timeRangeSelect.selectOption('7d');
            await timeRangeSelect.selectOption('30d');
            await timeRangeSelect.selectOption('90d');

            // Should handle the requests gracefully without errors
            await page.waitForLoadState('networkidle');
            await expect(page.getByText('Analytics Dashboard')).toBeVisible();
        });
    });

    test.describe('Error Recovery', () => {
        test('recovers from network errors', async ({ page }) => {
            // First load successfully
            await page.waitForLoadState('networkidle');
            await expect(page.getByText('Analytics Dashboard')).toBeVisible();

            // Simulate network failure
            await page.route('/api/creator/analytics*', (route) => {
                route.abort();
            });

            // Try to refresh
            await page
                .getByRole('button')
                .filter({ hasText: /refresh/i })
                .click();

            // Should show error state
            await expect(page.getByText('Analytics Unavailable')).toBeVisible();

            // Remove network failure
            await page.unroute('/api/creator/analytics*');

            // Try again should work
            await page.getByRole('button', { name: 'Try Again' }).click();
            await expect(page.getByText('Analytics Dashboard')).toBeVisible();
        });
    });
});
