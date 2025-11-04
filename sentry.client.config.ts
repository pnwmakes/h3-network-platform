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
        
        // Error filtering
        beforeSend(event) {
            // Filter out development errors in production
            if (env.NODE_ENV === 'production' && event.exception) {
                const error = event.exception.values?.[0];
                
                // Skip common development errors
                if (error?.value?.includes('ChunkLoadError') ||
                    error?.value?.includes('Loading CSS chunk')) {
                    return null;
                }
            }
            
            return event;
        },
        
        // Additional configuration
        integrations: [
            Sentry.replayIntegration({
                // Capture replay for errors only in production
                maskAllText: env.NODE_ENV === 'production',
                blockAllMedia: env.NODE_ENV === 'production',
            }),
        ],
        
        // Session replay sample rate
        replaysSessionSampleRate: env.NODE_ENV === 'production' ? 0.01 : 0.1,
        replaysOnErrorSampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
}