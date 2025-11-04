import { env, isProd } from './env';
import * as Sentry from '@sentry/nextjs';

// Log levels
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
    userId?: string;
    requestId?: string;
    ip?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    [key: string]: string | number | boolean | undefined;
}

class Logger {
    private shouldLog(level: LogLevel): boolean {
        if (isProd) {
            return ['error', 'warn', 'info'].includes(level);
        }
        return true; // Log everything in development
    }

    private formatMessage(
        level: LogLevel,
        message: string,
        context?: LogContext
    ): string {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            service: 'h3-network-platform',
            environment: env.NODE_ENV,
            ...context,
        };

        if (isProd) {
            return JSON.stringify(logEntry);
        } else {
            // Pretty format for development
            const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
            return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
        }
    }

    private log(level: LogLevel, message: string, context?: LogContext): void {
        if (!this.shouldLog(level)) return;

        const formattedMessage = this.formatMessage(level, message, context);

        switch (level) {
            case 'error':
                console.error(formattedMessage);
                break;
            case 'warn':
                console.warn(formattedMessage);
                break;
            case 'info':
                console.info(formattedMessage);
                break;
            case 'debug':
                console.debug(formattedMessage);
                break;
        }
    }

    error(message: string, context?: LogContext): void {
        this.log('error', message, context);

        // Send errors to Sentry in production
        if (env.SENTRY_DSN) {
            Sentry.withScope((scope) => {
                if (context) {
                    // Add context as tags and extra data
                    Object.entries(context).forEach(([key, value]) => {
                        if (
                            typeof value === 'string' ||
                            typeof value === 'number'
                        ) {
                            scope.setTag(key, value);
                        } else {
                            scope.setExtra(key, value);
                        }
                    });
                }

                scope.setLevel('error');
                Sentry.captureMessage(message);
            });
        }
    }

    warn(message: string, context?: LogContext): void {
        this.log('warn', message, context);
    }

    info(message: string, context?: LogContext): void {
        this.log('info', message, context);
    }

    debug(message: string, context?: LogContext): void {
        this.log('debug', message, context);
    }

    // API-specific logging helpers
    apiRequest(
        method: string,
        endpoint: string,
        context?: Omit<LogContext, 'method' | 'endpoint'>
    ): void {
        this.info(`API Request: ${method} ${endpoint}`, {
            method,
            endpoint,
            ...context,
        });
    }

    apiResponse(
        method: string,
        endpoint: string,
        status: number,
        responseTime?: number,
        context?: LogContext
    ): void {
        const level = status >= 400 ? 'warn' : 'info';
        this.log(level, `API Response: ${method} ${endpoint} - ${status}`, {
            method,
            endpoint,
            status,
            responseTime,
            ...context,
        });
    }

    apiError(
        method: string,
        endpoint: string,
        error: Error,
        context?: LogContext
    ): void {
        this.error(`API Error: ${method} ${endpoint} - ${error.message}`, {
            method,
            endpoint,
            error: error.name,
            stack: isProd ? undefined : error.stack,
            ...context,
        });
    }

    // Database logging helpers
    dbQuery(query: string, duration?: number, context?: LogContext): void {
        this.debug(`Database Query: ${query}`, {
            query: isProd ? '[REDACTED]' : query,
            duration,
            ...context,
        });
    }

    dbError(operation: string, error: Error, context?: LogContext): void {
        this.error(`Database Error: ${operation} - ${error.message}`, {
            operation,
            error: error.name,
            stack: isProd ? undefined : error.stack,
            ...context,
        });
    }

    // Auth logging helpers
    authAttempt(email: string, success: boolean, context?: LogContext): void {
        this.info(
            `Auth Attempt: ${email} - ${success ? 'SUCCESS' : 'FAILED'}`,
            {
                email: isProd ? '[REDACTED]' : email,
                success,
                ...context,
            }
        );
    }

    // Exception logging with Sentry integration
    exception(error: Error, context?: LogContext): void {
        const errorMessage = `Exception: ${error.message}`;
        this.log('error', errorMessage, {
            ...context,
            stack: error.stack,
            errorName: error.name,
        });

        // Send exceptions to Sentry
        if (env.SENTRY_DSN) {
            Sentry.withScope((scope) => {
                if (context) {
                    Object.entries(context).forEach(([key, value]) => {
                        if (
                            typeof value === 'string' ||
                            typeof value === 'number'
                        ) {
                            scope.setTag(key, value);
                        } else {
                            scope.setExtra(key, value);
                        }
                    });
                }

                scope.setLevel('error');
                Sentry.captureException(error);
            });
        }
    }

    // Security event logging
    securityEvent(
        event: string,
        severity: 'low' | 'medium' | 'high',
        context?: LogContext
    ): void {
        const level =
            severity === 'high'
                ? 'error'
                : severity === 'medium'
                ? 'warn'
                : 'info';
        this.log(level, `Security Event: ${event}`, {
            event,
            severity,
            ...context,
        });
    }
}

// Export singleton logger instance
export const logger = new Logger();

// Helper function to create request context
export function createRequestContext(req: {
    headers?: Record<string, string | string[]>;
    ip?: string;
    connection?: { remoteAddress?: string };
    method?: string;
    url?: string;
}): LogContext {
    return {
        requestId: Array.isArray(req.headers?.['x-request-id'])
            ? req.headers['x-request-id'][0]
            : req.headers?.['x-request-id'] || `req_${Date.now()}`,
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: Array.isArray(req.headers?.['user-agent'])
            ? req.headers['user-agent'][0]
            : req.headers?.['user-agent'],
        method: req.method,
        endpoint: req.url,
    };
}
