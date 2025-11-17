import * as Sentry from '@sentry/nextjs';

// Client-side environment variables (only NEXT_PUBLIC_ prefixed vars are available)
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const NODE_ENV = process.env.NODE_ENV || 'development';

if (SENTRY_DSN) {
    Sentry.init({
        dsn: SENTRY_DSN,

        // Performance monitoring
        tracesSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,

        // Debug mode in development
        debug: NODE_ENV === 'development',

        // Environment
        environment: NODE_ENV,

        // Release tracking
        release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',

        // Error filtering
        beforeSend(event) {
            // Filter out development errors in production
            if (NODE_ENV === 'production' && event.exception) {
                const error = event.exception.values?.[0];

                // Skip common development errors
                if (
                    error?.value?.includes('ChunkLoadError') ||
                    error?.value?.includes('Loading CSS chunk')
                ) {
                    return null;
                }
            }

            return event;
        },

        // Additional configuration
        integrations: [
            Sentry.replayIntegration({
                // Capture replay for errors only in production
                maskAllText: NODE_ENV === 'production',
                blockAllMedia: NODE_ENV === 'production',
            }),
        ],

        // Session replay sample rate
        replaysSessionSampleRate: NODE_ENV === 'production' ? 0.01 : 0.1,
        replaysOnErrorSampleRate: NODE_ENV === 'production' ? 0.1 : 1.0,
    });
}
