import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

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

        // Add cache control headers for dynamic content pages
        const response = NextResponse.next();
        
        if (pathname.startsWith('/blogs') || pathname.startsWith('/api/content')) {
            response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            response.headers.set('Pragma', 'no-cache');
            response.headers.set('Expires', '0');
            response.headers.set('CDN-Cache-Control', 'no-store');
            response.headers.set('Netlify-CDN-Cache-Control', 'no-store');
        }

        // Check role-based access
        for (const [route, allowedRoles] of Object.entries(
            roleProtectedRoutes
        )) {
            if (pathname.startsWith(route)) {
                if (!token || !allowedRoles.includes(token.role)) {
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
        '/profile/:path*',
        '/creator/:path*',
        '/admin/:path*',
        '/super-admin/:path*',
    ],
};
