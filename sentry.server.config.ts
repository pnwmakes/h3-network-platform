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

        // Server-specific configuration
        beforeSend(event) {
            // Filter out common server errors that aren't actionable
            if (event.exception) {
                const error = event.exception.values?.[0];

                // Skip database connection timeouts in development
                if (
                    env.NODE_ENV === 'development' &&
                    error?.value?.includes('Connection timeout')
                ) {
                    return null;
                }
            }

            return event;
        },
    });
}
