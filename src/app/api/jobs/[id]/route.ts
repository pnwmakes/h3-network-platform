import { NextRequest, NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/security';
import { JobUtils } from '@/lib/job-queue';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const job = JobUtils.getJobStatus(id);

        if (!job) {
            return createErrorResponse('Job not found', 404);
        }

        return NextResponse.json({
            success: true,
            data: {
                id: job.id,
                type: job.type,
                status: job.status,
                priority: job.priority,
                attempts: job.attempts,
                maxAttempts: job.maxAttempts,
                createdAt: job.createdAt,
                processedAt: job.processedAt,
                completedAt: job.completedAt,
                error: job.error,
                progress:
                    job.status === 'completed'
                        ? 100
                        : job.status === 'processing'
                        ? 50
                        : job.status === 'failed'
                        ? 0
                        : 10,
            },
        });
    } catch {
        return createErrorResponse('Failed to get job status', 500);
    }
}
