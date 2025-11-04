import { z } from 'zod';

// Environment variable validation schema
const envSchema = z.object({
    // Database
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

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

    // App Configuration
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    APP_NAME: z.string().default('H3 Network Media Platform'),
    APP_URL: z.string().url('APP_URL must be a valid URL'),
});

// Validate environment variables
function validateEnv() {
    try {
        return envSchema.parse(process.env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error('❌ Environment validation failed:');
            error.issues.forEach((issue) => {
                console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
            });
            process.exit(1);
        }
        throw error;
    }
}

// Export validated environment variables
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
