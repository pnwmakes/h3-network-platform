import { NextRequest, NextResponse } from 'next/server';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';
import { JobUtils } from '@/lib/job-queue';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function handler(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return createErrorResponse('Unauthorized', 401);
    }

    if (req.method === 'GET') {
        // Get queue statistics
        const stats = JobUtils.getQueueStats();

        return NextResponse.json({
            success: true,
            data: {
                queueStats: stats,
                timestamp: new Date().toISOString(),
            },
        });
    }

    if (req.method === 'POST') {
        try {
            const body = await req.json();
            const { type, payload, priority = 'normal' } = body;

            if (!type || !payload) {
                return createErrorResponse('Missing job type or payload', 400);
            }

            let jobId: string;

            switch (type) {
                case 'bulk-video-upload':
                    if (!payload.videos || !Array.isArray(payload.videos)) {
                        return createErrorResponse('Invalid videos array', 400);
                    }
                    jobId = await JobUtils.addBulkVideoUpload(
                        payload.videos,
                        session.user.id,
                        priority
                    );
                    break;

                case 'bulk-blog-upload':
                    if (!payload.blogs || !Array.isArray(payload.blogs)) {
                        return createErrorResponse('Invalid blogs array', 400);
                    }
                    jobId = await JobUtils.addBulkBlogUpload(
                        payload.blogs,
                        session.user.id,
                        priority
                    );
                    break;

                case 'content-processing':
                    if (
                        !payload.contentId ||
                        !payload.contentType ||
                        !payload.operations
                    ) {
                        return createErrorResponse(
                            'Missing content processing parameters',
                            400
                        );
                    }
                    jobId = await JobUtils.addContentProcessing(
                        payload.contentId,
                        payload.contentType,
                        payload.operations,
                        priority
                    );
                    break;

                default:
                    return createErrorResponse('Unknown job type', 400);
            }

            logger.info('Job created via API', {
                jobId,
                type,
                userId: session.user.id,
                priority,
            });

            return NextResponse.json({
                success: true,
                data: {
                    jobId,
                    type,
                    priority,
                    status: 'pending',
                    message: 'Job created successfully',
                },
            });
        } catch (error) {
            logger.error('Job creation failed', {
                error: error instanceof Error ? error.message : String(error),
                userId: session.user.id,
            });

            return createErrorResponse('Failed to create job', 500);
        }
    }

    return createErrorResponse('Method not allowed', 405);
}

export const GET = withApiSecurity(handler);
export const POST = withApiSecurity(handler);
