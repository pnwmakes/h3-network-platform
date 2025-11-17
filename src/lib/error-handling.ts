import { NextResponse } from 'next/server';
import { logger } from './logger';
import { env, isProd } from './env';

// Error types for the H3 Network platform
export enum ErrorType {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
    FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR',
}

// Custom error class for H3 Network
export class H3NetworkError extends Error {
    public readonly type: ErrorType;
    public readonly statusCode: number;
    public readonly details?: Record<string, unknown>;
    public readonly userMessage: string;
    public readonly isOperational: boolean;

    constructor(
        type: ErrorType,
        message: string,
        statusCode: number,
        userMessage?: string,
        details?: Record<string, unknown>,
        isOperational = true
    ) {
        super(message);
        this.name = 'H3NetworkError';
        this.type = type;
        this.statusCode = statusCode;
        this.userMessage = userMessage || this.getDefaultUserMessage(type);
        this.details = details;
        this.isOperational = isOperational;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, H3NetworkError);
        }
    }

    private getDefaultUserMessage(type: ErrorType): string {
        switch (type) {
            case ErrorType.VALIDATION_ERROR:
                return 'The information provided is not valid. Please check your input and try again.';
            case ErrorType.AUTHENTICATION_ERROR:
                return 'Authentication failed. Please sign in and try again.';
            case ErrorType.AUTHORIZATION_ERROR:
                return 'You do not have permission to perform this action.';
            case ErrorType.NOT_FOUND_ERROR:
                return 'The requested resource was not found.';
            case ErrorType.RATE_LIMIT_ERROR:
                return 'Too many requests. Please wait a moment and try again.';
            case ErrorType.DATABASE_ERROR:
                return 'A database error occurred. Please try again later.';
            case ErrorType.EXTERNAL_SERVICE_ERROR:
                return 'An external service is temporarily unavailable. Please try again later.';
            case ErrorType.FILE_UPLOAD_ERROR:
                return 'File upload failed. Please check your file and try again.';
            case ErrorType.NETWORK_ERROR:
                return 'Network error occurred. Please check your connection and try again.';
            case ErrorType.INTERNAL_ERROR:
                return 'An unexpected error occurred. Our team has been notified.';
            default:
                return 'An error occurred. Please try again.';
        }
    }

    toJSON(): Record<string, unknown> {
        return {
            type: this.type,
            message: this.userMessage,
            statusCode: this.statusCode,
            ...(this.details && { details: this.details }),
            timestamp: new Date().toISOString(),
            ...(env.NODE_ENV === 'development' && {
                technicalMessage: this.message,
                stack: this.stack,
            }),
        };
    }
}

// Error factory functions
export const ErrorFactory = {
    validationError(
        message: string,
        details?: Record<string, unknown>,
        userMessage?: string
    ): H3NetworkError {
        return new H3NetworkError(
            ErrorType.VALIDATION_ERROR,
            message,
            400,
            userMessage,
            details
        );
    },

    authenticationError(
        message = 'Authentication required',
        userMessage?: string
    ): H3NetworkError {
        return new H3NetworkError(
            ErrorType.AUTHENTICATION_ERROR,
            message,
            401,
            userMessage
        );
    },

    authorizationError(
        message = 'Insufficient permissions',
        userMessage?: string
    ): H3NetworkError {
        return new H3NetworkError(
            ErrorType.AUTHORIZATION_ERROR,
            message,
            403,
            userMessage
        );
    },

    notFoundError(resource: string, userMessage?: string): H3NetworkError {
        return new H3NetworkError(
            ErrorType.NOT_FOUND_ERROR,
            `${resource} not found`,
            404,
            userMessage
        );
    },

    rateLimitError(
        message = 'Rate limit exceeded',
        retryAfter?: number
    ): H3NetworkError {
        return new H3NetworkError(
            ErrorType.RATE_LIMIT_ERROR,
            message,
            429,
            undefined,
            { retryAfter }
        );
    },

    databaseError(
        operation: string,
        originalError?: Error,
        userMessage?: string
    ): H3NetworkError {
        return new H3NetworkError(
            ErrorType.DATABASE_ERROR,
            `Database operation failed: ${operation}`,
            500,
            userMessage,
            { operation, originalError: originalError?.message }
        );
    },

    externalServiceError(
        service: string,
        originalError?: Error,
        userMessage?: string
    ): H3NetworkError {
        return new H3NetworkError(
            ErrorType.EXTERNAL_SERVICE_ERROR,
            `External service error: ${service}`,
            503,
            userMessage,
            { service, originalError: originalError?.message }
        );
    },

    fileUploadError(reason: string, userMessage?: string): H3NetworkError {
        return new H3NetworkError(
            ErrorType.FILE_UPLOAD_ERROR,
            `File upload failed: ${reason}`,
            400,
            userMessage,
            { reason }
        );
    },

    internalError(
        message: string,
        originalError?: Error,
        userMessage?: string
    ): H3NetworkError {
        return new H3NetworkError(
            ErrorType.INTERNAL_ERROR,
            message,
            500,
            userMessage,
            { originalError: originalError?.message },
            false // Not operational - indicates a programming error
        );
    },
};

// Error handler for API routes
export function handleApiError(error: unknown, context?: string): NextResponse {
    const errorId = `err_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

    // Handle known H3NetworkError instances
    if (error instanceof H3NetworkError) {
        logger.warn('API error handled', {
            errorId,
            type: error.type,
            message: error.message,
            statusCode: error.statusCode,
            context: context || 'unknown',
            hasDetails: !!error.details,
        });

        const responseBody = {
            success: false,
            error: {
                id: errorId,
                type: error.type,
                message: error.userMessage,
                ...(error.details && { details: error.details }),
                timestamp: new Date().toISOString(),
            },
            ...(env.NODE_ENV === 'development' && {
                debug: {
                    technicalMessage: error.message,
                    stack: error.stack,
                },
            }),
        };

        return NextResponse.json(responseBody, {
            status: error.statusCode,
            headers: {
                'X-Error-ID': errorId,
                'X-Error-Type': error.type,
            },
        });
    }

    // Handle standard JavaScript errors
    if (error instanceof Error) {
        logger.error('Unhandled API error', {
            errorId,
            message: error.message,
            stack: error.stack,
            context: context || 'unknown',
        });

        const responseBody = {
            success: false,
            error: {
                id: errorId,
                type: ErrorType.INTERNAL_ERROR,
                message:
                    'An unexpected error occurred. Our team has been notified.',
                timestamp: new Date().toISOString(),
            },
            ...(env.NODE_ENV === 'development' && {
                debug: {
                    technicalMessage: error.message,
                    stack: error.stack,
                },
            }),
        };

        return NextResponse.json(responseBody, {
            status: 500,
            headers: {
                'X-Error-ID': errorId,
                'X-Error-Type': ErrorType.INTERNAL_ERROR,
            },
        });
    }

    // Handle unknown errors
    logger.error('Unknown error type', {
        errorId,
        error: String(error),
        context: context || 'unknown',
    });

    const responseBody = {
        success: false,
        error: {
            id: errorId,
            type: ErrorType.INTERNAL_ERROR,
            message:
                'An unexpected error occurred. Our team has been notified.',
            timestamp: new Date().toISOString(),
        },
        ...(env.NODE_ENV === 'development' && {
            debug: {
                rawError: String(error),
            },
        }),
    };

    return NextResponse.json(responseBody, {
        status: 500,
        headers: {
            'X-Error-ID': errorId,
            'X-Error-Type': ErrorType.INTERNAL_ERROR,
        },
    });
}

// Global error handler wrapper for API routes
export function withErrorHandler<
    T extends (...args: unknown[]) => Promise<NextResponse>
>(handler: T, context?: string): T {
    return (async (...args: Parameters<T>): Promise<NextResponse> => {
        try {
            return await handler(...args);
        } catch (error) {
            return handleApiError(error, context);
        }
    }) as T;
}

// Database operation wrapper with error handling
export async function withDatabaseErrorHandler<T>(
    operation: () => Promise<T>,
    operationName: string
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        logger.dbError(operationName, error as Error);

        if (error instanceof Error) {
            // Check for specific database error patterns
            if (error.message.includes('unique constraint')) {
                throw ErrorFactory.validationError(
                    `${operationName}: Duplicate entry`,
                    { constraint: 'unique', operation: operationName },
                    'This information is already in use. Please try different values.'
                );
            }

            if (error.message.includes('foreign key')) {
                throw ErrorFactory.validationError(
                    `${operationName}: Invalid reference`,
                    { constraint: 'foreign_key', operation: operationName },
                    'Referenced resource does not exist.'
                );
            }

            if (error.message.includes('not-null')) {
                throw ErrorFactory.validationError(
                    `${operationName}: Missing required field`,
                    { constraint: 'not_null', operation: operationName },
                    'Required information is missing.'
                );
            }

            // Connection errors
            if (
                error.message.includes('connect') ||
                error.message.includes('timeout')
            ) {
                throw ErrorFactory.databaseError(
                    operationName,
                    error,
                    'Database connection issue. Please try again in a moment.'
                );
            }
        }

        // Default database error
        throw ErrorFactory.databaseError(operationName, error as Error);
    }
}

// Retry mechanism for operations
export async function withRetry<T>(
    operation: () => Promise<T>,
    options: {
        maxAttempts?: number;
        delayMs?: number;
        backoffMultiplier?: number;
        shouldRetry?: (error: Error) => boolean;
        onRetry?: (attempt: number, error: Error) => void;
    } = {}
): Promise<T> {
    const {
        maxAttempts = 3,
        delayMs = 1000,
        backoffMultiplier = 2,
        shouldRetry = () => true,
        onRetry,
    } = options;

    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts || !shouldRetry(lastError)) {
                throw lastError;
            }

            if (onRetry) {
                onRetry(attempt, lastError);
            }

            const delay = delayMs * Math.pow(backoffMultiplier, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

// Circuit breaker pattern for external services
export class CircuitBreaker {
    private failures = 0;
    private lastFailureTime = 0;
    private state: 'closed' | 'open' | 'half-open' = 'closed';

    constructor(
        private readonly threshold: number = 5,
        private readonly timeout: number = 60000, // 1 minute
        private readonly monitoringWindow: number = 300000 // 5 minutes
    ) {}

    async execute<T>(operation: () => Promise<T>): Promise<T> {
        if (this.state === 'open') {
            if (Date.now() - this.lastFailureTime > this.timeout) {
                this.state = 'half-open';
            } else {
                throw ErrorFactory.externalServiceError(
                    'Circuit breaker open',
                    undefined,
                    'Service is temporarily unavailable. Please try again later.'
                );
            }
        }

        try {
            const result = await operation();

            if (this.state === 'half-open') {
                this.reset();
            }

            return result;
        } catch (error) {
            this.recordFailure();
            throw error;
        }
    }

    private recordFailure(): void {
        this.failures++;
        this.lastFailureTime = Date.now();

        if (this.failures >= this.threshold) {
            this.state = 'open';
            logger.warn('Circuit breaker opened', {
                failures: this.failures,
                threshold: this.threshold,
            });
        }
    }

    private reset(): void {
        this.failures = 0;
        this.state = 'closed';
        this.lastFailureTime = 0;
    }

    getState(): { state: string; failures: number; lastFailureTime: number } {
        return {
            state: this.state,
            failures: this.failures,
            lastFailureTime: this.lastFailureTime,
        };
    }
}

// Error boundary for critical operations
export async function withErrorBoundary<T>(
    operation: () => Promise<T>,
    fallback?: () => Promise<T>,
    context?: string
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        logger.error('Error boundary triggered', {
            context: context || 'unknown',
            error: error instanceof Error ? error.message : String(error),
        });

        if (fallback) {
            try {
                logger.info('Executing fallback operation', { context });
                return await fallback();
            } catch (fallbackError) {
                logger.error('Fallback operation also failed', {
                    context,
                    originalError:
                        error instanceof Error ? error.message : String(error),
                    fallbackError:
                        fallbackError instanceof Error
                            ? fallbackError.message
                            : String(fallbackError),
                });
                throw error; // Throw original error
            }
        }

        throw error;
    }
}

// Production error monitoring setup
export function initializeErrorMonitoring(): void {
    if (isProd) {
        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled promise rejection', {
                reason:
                    reason instanceof Error ? reason.message : String(reason),
                stack: reason instanceof Error ? reason.stack : undefined,
                promise: promise.toString(),
            });
        });

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception', {
                message: error.message,
                stack: error.stack,
            });

            // Graceful shutdown
            process.exit(1);
        });

        logger.info('Error monitoring initialized for production');
    }
}
