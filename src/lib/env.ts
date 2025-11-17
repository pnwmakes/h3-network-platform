import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

    // Production Database Configuration
    DATABASE_POOL_SIZE: z
        .string()
        .optional()
        .default('10')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1).max(50)),

    DATABASE_CONNECTION_LIMIT: z
        .string()
        .optional()
        .default('20')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1).max(100)),

    DATABASE_TIMEOUT: z
        .string()
        .optional()
        .default('10000')
        .transform((val) => parseInt(val, 10))
        .pipe(z.number().min(1000).max(60000)),

    DATABASE_SSL_MODE: z
        .enum(['require', 'prefer', 'disable'])
        .optional()
        .default('require'),

    // Redis Configuration (Optional for production rate limiting)
    REDIS_URL: z.string().url('REDIS_URL must be a valid URL').optional(),

    // NextAuth
    NEXTAUTH_SECRET: z
        .string()
        .min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),

    // OAuth
    GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
    GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

    // YouTube API (optional)
    YOUTUBE_API_KEY: z.string().optional(),

    // Sentry (optional for error tracking)
    SENTRY_DSN: z.string().url('SENTRY_DSN must be a valid URL').optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_AUTH_TOKEN: z.string().optional(),

    // App Configuration
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    APP_NAME: z.string().default('H3 Network Media Platform'),
    APP_URL: z.string().url('APP_URL must be a valid URL'),
});

// Validate environment variables (server-side only)
function validateEnv() {
    // Skip validation on client-side
    if (typeof window !== 'undefined') {
        return {} as z.infer<typeof envSchema>;
    }

    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            });
            // Don't exit in Edge Runtime - just throw the error
            throw new Error(
                `Environment validation failed: ${error.issues
                    .map((i) => i.message)
                    .join(', ')}`
            );
        }
        throw error;
    }
}

// Export validated environment variables (only available server-side)
export const env = validateEnv();

// Production environment check
export const isProd = env.NODE_ENV === 'production';
export const isDev = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';

// Security helpers
export function getSecureHeaders() {
    return {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        ...(isProd && {
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        }),
    };
}

// Rate limiting configuration
export const rateLimitConfig = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProd ? 100 : 1000, // limit each IP to 100 requests per windowMs in production
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
};

// Database configuration helpers
export function getDatabaseConfig() {
    return {
        url: env.DATABASE_URL,
        ssl: isProd ? { rejectUnauthorized: false } : false,
        connectionLimit: env.DATABASE_CONNECTION_LIMIT,
        timeout: env.DATABASE_TIMEOUT,
        pool: {
            min: 0,
            max: env.DATABASE_POOL_SIZE,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: env.DATABASE_TIMEOUT,
        },
    };
}

// Prisma configuration for production
export function getPrismaConfig() {
    const baseConfig = {
        datasources: {
            db: {
                url: env.DATABASE_URL,
            },
        },
        log: isDev ? ['query', 'info', 'warn', 'error'] : ['error'],
    };

    if (isProd) {
        return {
            ...baseConfig,
            // Production optimizations
            engineType: 'binary' as const,
            binaryTargets: ['native', 'rhel-openssl-1.0.x'],
        };
    }

    return baseConfig;
}
