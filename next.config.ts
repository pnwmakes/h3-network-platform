import type { NextConfig } from 'next';

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

export default nextConfig;
