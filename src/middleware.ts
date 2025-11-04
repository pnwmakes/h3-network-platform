import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

// Routes that require authentication
const protectedRoutes = ['/profile', '/creator', '/admin'];

// Routes that require specific roles
const roleProtectedRoutes = {
    '/creator': ['CREATOR', 'ADMIN', 'SUPER_ADMIN'],
    '/admin': ['ADMIN', 'SUPER_ADMIN'],
    '/super-admin': ['SUPER_ADMIN'],
};

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const { pathname } = req.nextUrl;

        // Create response with security headers
        const response = NextResponse.next();

        // Add security headers to all responses
        response.headers.set('X-Request-ID', `req_${Date.now()}`);

        // Add cache control headers for dynamic content pages
        if (
            pathname.startsWith('/blogs') ||
            pathname.startsWith('/api/content') ||
            pathname.includes('/blog') ||
            pathname.startsWith('/api/creator/blogs') ||
            pathname.startsWith('/api/admin/content')
        ) {
            response.headers.set(
                'Cache-Control',
                'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
            );
            response.headers.set('Pragma', 'no-cache');
            response.headers.set('Expires', '0');
            response.headers.set('CDN-Cache-Control', 'no-store');
            response.headers.set('Netlify-CDN-Cache-Control', 'no-store');
            response.headers.set('Last-Modified', new Date().toUTCString());
            response.headers.set('ETag', `"${Date.now()}"`);
        }

        // Log security events for protected routes
        if (protectedRoutes.some((route) => pathname.startsWith(route))) {
            if (!token) {
                logger.securityEvent('Unauthorized access attempt', 'medium', {
                    pathname,
                    userAgent: req.headers.get('user-agent') || undefined,
                    ip:
                        req.headers.get('x-forwarded-for') ||
                        req.headers.get('x-real-ip') ||
                        'unknown',
                });
            }
        }

        // Check role-based access
        for (const [route, allowedRoles] of Object.entries(
            roleProtectedRoutes
        )) {
            if (pathname.startsWith(route)) {
                if (!token || !allowedRoles.includes(token.role)) {
                    logger.securityEvent('Insufficient permissions', 'medium', {
                        pathname,
                        userRole: token?.role || 'none',
                        requiredRoles: allowedRoles.join(', '),
                        userId: token?.sub,
                    });

                    return NextResponse.redirect(
                        new URL('/auth/signin', req.url)
                    );
                }
            }
        }

        return response;
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl;

                // Allow public access to most routes
                if (
                    !protectedRoutes.some((route) => pathname.startsWith(route))
                ) {
                    return true;
                }

                // Require authentication for protected routes
                return !!token;
            },
        },
    }
);

export const config = {
    matcher: [
        '/blogs/:path*',
        '/api/content/:path*',
        '/api/creator/blogs/:path*',
        '/api/admin/content/:path*',
        '/profile/:path*',
        '/creator/:path*',
        '/admin/:path*',
        '/super-admin/:path*',
    ],
};
