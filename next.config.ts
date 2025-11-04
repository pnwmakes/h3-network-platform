import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'img.youtube.com',
                port: '',
                pathname: '/vi/**',
            },
            {
                protocol: 'https',
                hostname: 'i.ytimg.com',
                port: '',
                pathname: '/vi/**',
            },
        ],
    },
    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
            {
                // API routes get additional security headers
                source: '/api/(.*)',
                headers: [
                    {
                        key: 'X-Robots-Tag',
                        value: 'noindex',
                    },
                    {
                        key: 'Cache-Control',
                        value: 'no-store, must-revalidate',
                    },
                ],
            },
        ];
    },
    // Environment variable validation
    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY,
    },

    // Production optimizations
    output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

    // Reduce bundle size
    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{member}}',
        },
    },

    // Enable experimental features for better performance
    experimental: {
        optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    },

    // External packages for server components
    serverExternalPackages: ['@prisma/client'],
};

// Export with Sentry configuration
export default withSentryConfig(
    nextConfig,
    {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,

        // Only print logs for uploading source maps in CI
        silent: !process.env.CI,

        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
        // This can increase your server load as well as your hosting bill.
        // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
        // side errors will fail.
        tunnelRoute: "/monitoring",

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,

        // Enables automatic instrumentation of Vercel Cron Monitors.
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/instrumentation/automatic-instrumentation/
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/instrumentation/automatic-instrumentation/#vercel-cron-monitors
        automaticVercelMonitors: true,
    }
);
