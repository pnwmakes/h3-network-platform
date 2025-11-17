import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from './logger';

// Common validation schemas for H3 Network
export const ValidationSchemas = {
    // User schemas
    user: {
        create: z.object({
            name: z
                .string()
                .min(2, 'Name must be at least 2 characters')
                .max(100, 'Name must not exceed 100 characters')
                .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
            email: z
                .string()
                .email('Invalid email address')
                .max(254, 'Email must not exceed 254 characters')
                .toLowerCase(),
            password: z
                .string()
                .min(8, 'Password must be at least 8 characters')
                .max(128, 'Password must not exceed 128 characters')
                .regex(
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    'Password must contain uppercase, lowercase, and number'
                ),
            role: z
                .enum(['USER', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'])
                .optional()
                .default('USER'),
        }),

        update: z.object({
            name: z
                .string()
                .min(2, 'Name must be at least 2 characters')
                .max(100, 'Name must not exceed 100 characters')
                .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters')
                .optional(),
            email: z
                .string()
                .email('Invalid email address')
                .max(254, 'Email must not exceed 254 characters')
                .toLowerCase()
                .optional(),
        }),
    },

    // Creator schemas
    creator: {
        create: z.object({
            displayName: z
                .string()
                .min(2, 'Display name must be at least 2 characters')
                .max(100, 'Display name must not exceed 100 characters'),
            bio: z
                .string()
                .max(1000, 'Bio must not exceed 1000 characters')
                .optional(),
            showName: z
                .string()
                .max(100, 'Show name must not exceed 100 characters')
                .optional(),
            websiteUrl: z
                .string()
                .url('Invalid website URL')
                .optional()
                .or(z.literal('')),
            instagramUrl: z
                .string()
                .regex(
                    /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/,
                    'Invalid Instagram URL'
                )
                .optional()
                .or(z.literal('')),
            linkedinUrl: z
                .string()
                .regex(
                    /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
                    'Invalid LinkedIn URL'
                )
                .optional()
                .or(z.literal('')),
            tiktokUrl: z
                .string()
                .regex(
                    /^https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]{1,24}\/?$/,
                    'Invalid TikTok URL'
                )
                .optional()
                .or(z.literal('')),
        }),

        update: z.object({
            displayName: z
                .string()
                .min(2, 'Display name must be at least 2 characters')
                .max(100, 'Display name must not exceed 100 characters')
                .optional(),
            bio: z
                .string()
                .max(1000, 'Bio must not exceed 1000 characters')
                .optional(),
            showName: z
                .string()
                .max(100, 'Show name must not exceed 100 characters')
                .optional(),
            websiteUrl: z
                .string()
                .url('Invalid website URL')
                .optional()
                .or(z.literal('')),
            instagramUrl: z
                .string()
                .regex(
                    /^https:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/,
                    'Invalid Instagram URL'
                )
                .optional()
                .or(z.literal('')),
            linkedinUrl: z
                .string()
                .regex(
                    /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
                    'Invalid LinkedIn URL'
                )
                .optional()
                .or(z.literal('')),
            tiktokUrl: z
                .string()
                .regex(
                    /^https:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]{1,24}\/?$/,
                    'Invalid TikTok URL'
                )
                .optional()
                .or(z.literal('')),
        }),
    },

    // Video schemas
    video: {
        create: z.object({
            title: z
                .string()
                .min(1, 'Title is required')
                .max(200, 'Title must not exceed 200 characters'),
            description: z
                .string()
                .max(5000, 'Description must not exceed 5000 characters')
                .optional(),
            youtubeId: z
                .string()
                .regex(/^[a-zA-Z0-9_-]{11}$/, 'Invalid YouTube ID format'),
            tags: z
                .array(z.string().max(50, 'Tag must not exceed 50 characters'))
                .max(20, 'Maximum 20 tags allowed')
                .optional()
                .default([]),
            topic: z
                .enum([
                    'REENTRY',
                    'ADDICTION',
                    'INCARCERATION',
                    'CRIMINAL_JUSTICE_REFORM',
                    'GENERAL',
                    'CRIMINAL_JUSTICE',
                    'RECOVERY',
                    'FAMILY',
                    'RELATIONSHIPS',
                    'LAW',
                    'GAME',
                    'REHABILITATION',
                    'NON_PROFIT',
                    'READING',
                    'POLITICS',
                ])
                .optional(),
            guestName: z
                .string()
                .max(100, 'Guest name must not exceed 100 characters')
                .optional(),
            episodeNumber: z
                .number()
                .int('Episode number must be an integer')
                .positive('Episode number must be positive')
                .max(9999, 'Episode number must not exceed 9999')
                .optional(),
            seasonNumber: z
                .number()
                .int('Season number must be an integer')
                .positive('Season number must be positive')
                .max(999, 'Season number must not exceed 999')
                .optional(),
        }),

        update: z.object({
            title: z
                .string()
                .min(1, 'Title is required')
                .max(200, 'Title must not exceed 200 characters')
                .optional(),
            description: z
                .string()
                .max(5000, 'Description must not exceed 5000 characters')
                .optional(),
            tags: z
                .array(z.string().max(50, 'Tag must not exceed 50 characters'))
                .max(20, 'Maximum 20 tags allowed')
                .optional(),
            topic: z
                .enum([
                    'REENTRY',
                    'ADDICTION',
                    'INCARCERATION',
                    'CRIMINAL_JUSTICE_REFORM',
                    'GENERAL',
                    'CRIMINAL_JUSTICE',
                    'RECOVERY',
                    'FAMILY',
                    'RELATIONSHIPS',
                    'LAW',
                    'GAME',
                    'REHABILITATION',
                    'NON_PROFIT',
                    'READING',
                    'POLITICS',
                ])
                .optional(),
            guestName: z
                .string()
                .max(100, 'Guest name must not exceed 100 characters')
                .optional(),
            episodeNumber: z
                .number()
                .int('Episode number must be an integer')
                .positive('Episode number must be positive')
                .max(9999, 'Episode number must not exceed 9999')
                .optional(),
            seasonNumber: z
                .number()
                .int('Season number must be an integer')
                .positive('Season number must be positive')
                .max(999, 'Season number must not exceed 999')
                .optional(),
            status: z
                .enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'])
                .optional(),
        }),
    },

    // Blog schemas
    blog: {
        create: z.object({
            title: z
                .string()
                .min(1, 'Title is required')
                .max(300, 'Title must not exceed 300 characters'),
            content: z
                .string()
                .min(50, 'Content must be at least 50 characters')
                .max(100000, 'Content must not exceed 100,000 characters'),
            excerpt: z
                .string()
                .max(500, 'Excerpt must not exceed 500 characters')
                .optional(),
            tags: z
                .array(z.string().max(50, 'Tag must not exceed 50 characters'))
                .max(20, 'Maximum 20 tags allowed')
                .optional()
                .default([]),
            topic: z
                .enum([
                    'REENTRY',
                    'ADDICTION',
                    'INCARCERATION',
                    'CRIMINAL_JUSTICE_REFORM',
                    'GENERAL',
                    'CRIMINAL_JUSTICE',
                    'RECOVERY',
                    'FAMILY',
                    'RELATIONSHIPS',
                    'LAW',
                    'GAME',
                    'REHABILITATION',
                    'NON_PROFIT',
                    'READING',
                    'POLITICS',
                ])
                .optional(),
            readTime: z
                .number()
                .int('Read time must be an integer')
                .positive('Read time must be positive')
                .max(300, 'Read time must not exceed 300 minutes')
                .optional(),
        }),

        update: z.object({
            title: z
                .string()
                .min(1, 'Title is required')
                .max(300, 'Title must not exceed 300 characters')
                .optional(),
            content: z
                .string()
                .min(50, 'Content must be at least 50 characters')
                .max(100000, 'Content must not exceed 100,000 characters')
                .optional(),
            excerpt: z
                .string()
                .max(500, 'Excerpt must not exceed 500 characters')
                .optional(),
            tags: z
                .array(z.string().max(50, 'Tag must not exceed 50 characters'))
                .max(20, 'Maximum 20 tags allowed')
                .optional(),
            topic: z
                .enum([
                    'REENTRY',
                    'ADDICTION',
                    'INCARCERATION',
                    'CRIMINAL_JUSTICE_REFORM',
                    'GENERAL',
                    'CRIMINAL_JUSTICE',
                    'RECOVERY',
                    'FAMILY',
                    'RELATIONSHIPS',
                    'LAW',
                    'GAME',
                    'REHABILITATION',
                    'NON_PROFIT',
                    'READING',
                    'POLITICS',
                ])
                .optional(),
            readTime: z
                .number()
                .int('Read time must be an integer')
                .positive('Read time must be positive')
                .max(300, 'Read time must not exceed 300 minutes')
                .optional(),
            status: z
                .enum(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'])
                .optional(),
        }),
    },

    // Search schemas
    search: z.object({
        q: z
            .string()
            .min(1, 'Search query is required')
            .max(200, 'Search query must not exceed 200 characters'),
        type: z.enum(['video', 'creator', 'blog', 'all']).default('all'),
        page: z.coerce
            .number()
            .int('Page must be an integer')
            .positive('Page must be positive')
            .max(1000, 'Page must not exceed 1000')
            .default(1),
        limit: z.coerce
            .number()
            .int('Limit must be an integer')
            .positive('Limit must be positive')
            .max(100, 'Limit must not exceed 100')
            .default(20),
    }),

    // File upload schemas
    fileUpload: z.object({
        type: z.enum(['image', 'avatar', 'thumbnail', 'banner']),
        size: z.number().max(5 * 1024 * 1024, 'File size must not exceed 5MB'),
        mimeType: z
            .string()
            .regex(
                /^image\/(jpeg|jpg|png|webp|gif)$/,
                'Only image files are allowed'
            ),
    }),

    // Pagination schemas
    pagination: z.object({
        page: z.coerce
            .number()
            .int('Page must be an integer')
            .positive('Page must be positive')
            .max(1000, 'Page must not exceed 1000')
            .default(1),
        limit: z.coerce
            .number()
            .int('Limit must be an integer')
            .positive('Limit must be positive')
            .max(100, 'Limit must not exceed 100')
            .default(20),
    }),
};

// Content sanitization functions
export const ContentSanitizer = {
    // Sanitize HTML content for blogs
    sanitizeHtml(html: string): string {
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
                'p',
                'br',
                'strong',
                'em',
                'u',
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'ul',
                'ol',
                'li',
                'a',
                'blockquote',
                'pre',
                'code',
                'img',
            ],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
            ALLOWED_URI_REGEXP: /^https?:\/\/|^\/|^#/,
        });
    },

    // Sanitize plain text (removes HTML, trims whitespace)
    sanitizeText(text: string): string {
        return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
            .replace(/\s+/g, ' ')
            .trim();
    },

    // Sanitize and validate URLs
    sanitizeUrl(url: string): string | null {
        try {
            const cleanUrl = this.sanitizeText(url);
            const parsedUrl = new URL(cleanUrl);

            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
                return null;
            }

            return parsedUrl.toString();
        } catch {
            return null;
        }
    },

    // Sanitize file names
    sanitizeFileName(fileName: string): string {
        return fileName
            .replace(/[^a-zA-Z0-9._-]/g, '_')
            .replace(/_{2,}/g, '_')
            .toLowerCase()
            .substring(0, 100);
    },

    // Sanitize tags array
    sanitizeTags(tags: string[]): string[] {
        return tags
            .map((tag) => this.sanitizeText(tag))
            .filter((tag) => tag.length > 0 && tag.length <= 50)
            .slice(0, 20);
    },
};

// Validation helper functions
export const ValidationHelpers = {
    // Validate and sanitize input with schema
    async validateInput<T>(
        schema: z.ZodSchema<T>,
        data: unknown,
        context?: string
    ): Promise<
        { success: true; data: T } | { success: false; errors: string[] }
    > {
        try {
            const result = await schema.safeParseAsync(data);

            if (result.success) {
                return { success: true, data: result.data };
            } else {
                const errors = result.error.issues.map(
                    (issue) => `${issue.path.join('.')}: ${issue.message}`
                );

                logger.warn('Validation failed', {
                    context: context || 'unknown',
                    errorCount: errors.length,
                    firstError: errors[0],
                    dataType: typeof data,
                });

                return { success: false, errors };
            }
        } catch (error) {
            logger.error('Validation error', {
                context: context || 'unknown',
                error: error instanceof Error ? error.message : String(error),
            });

            return {
                success: false,
                errors: ['Validation failed due to internal error'],
            };
        }
    },

    // Check for profanity or inappropriate content
    containsProfanity(text: string): boolean {
        // Basic profanity filter - in production, use a more sophisticated service
        const profanityList: string[] = [
            // Add your profanity words here
            // This is a basic implementation for H3 Network content moderation
        ];

        const lowerText = text.toLowerCase();
        return profanityList.some((word) => lowerText.includes(word));
    },

    // Detect potential XSS attempts
    containsXSS(input: string): boolean {
        const xssPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /<object[^>]*>.*?<\/object>/gi,
            /<embed[^>]*>.*?<\/embed>/gi,
        ];

        return xssPatterns.some((pattern) => pattern.test(input));
    },

    // Validate YouTube ID
    isValidYouTubeId(id: string): boolean {
        return /^[a-zA-Z0-9_-]{11}$/.test(id);
    },

    // Extract YouTube ID from various URL formats
    extractYouTubeId(url: string): string | null {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /^([a-zA-Z0-9_-]{11})$/, // Direct ID
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && this.isValidYouTubeId(match[1])) {
                return match[1];
            }
        }

        return null;
    },

    // Rate limit validation (check if user is making too many requests)
    checkRateLimit(_userId: string, _action: string): boolean {
        // Basic rate limiting - in production, use Redis-based solution
        // This is handled by the security middleware, but can be used for additional checks
        return true; // Simplified for now
    },
};

// Export comprehensive validation middleware
export function createValidationMiddleware<T>(
    schema: z.ZodSchema<T>,
    context: string = 'api'
) {
    return async (data: unknown): Promise<T> => {
        const result = await ValidationHelpers.validateInput(
            schema,
            data,
            context
        );

        if (!result.success) {
            throw new Error(`Validation failed: ${result.errors.join(', ')}`);
        }

        return result.data;
    };
}
