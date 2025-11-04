import * as Sentry from '@sentry/nextjs';
import { env } from '@/lib/env';

if (env.SENTRY_DSN) {
    Sentry.init({
        dsn: env.SENTRY_DSN,
        
        // Performance monitoring
        tracesSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
        
        // Debug mode in development
        debug: env.NODE_ENV === 'development',
        
        // Environment
        environment: env.NODE_ENV,
        
        // Release tracking
        release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
        
        // Edge runtime specific configuration
        beforeSend(event) {
            return event;
        },
    });
}