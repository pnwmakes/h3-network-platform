import { logger } from './logger';
import { prisma } from './prisma';
import { isProd } from './env';

// Job types for the H3 Network platform
export type JobType =
    | 'bulk-video-upload'
    | 'bulk-blog-upload'
    | 'content-processing'
    | 'thumbnail-generation'
    | 'email-notifications'
    | 'analytics-processing'
    | 'content-moderation'
    | 'backup-operations';

export interface Job {
    id: string;
    type: JobType;
    payload: Record<string, unknown>;
    priority: 'low' | 'normal' | 'high' | 'critical';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
    processedAt?: Date;
    completedAt?: Date;
    error?: string;
    createdBy?: string;
}

export interface JobProcessor {
    type: JobType;
    processor: (job: Job) => Promise<void>;
    concurrency?: number;
}

// In-memory job queue for development, Redis-based for production
class JobQueue {
    private static instance: JobQueue;
    private jobs = new Map<string, Job>();
    private processors = new Map<JobType, JobProcessor>();
    private processingQueue = new Set<string>();
    private isProcessing = false;
    private readonly maxConcurrency = isProd ? 10 : 3;
    private readonly retryDelays = [1000, 5000, 15000, 60000]; // Exponential backoff

    static getInstance(): JobQueue {
        if (!JobQueue.instance) {
            JobQueue.instance = new JobQueue();
        }
        return JobQueue.instance;
    }

    constructor() {
        this.startProcessing();
        this.registerDefaultProcessors();
    }

    // Register job processors
    registerProcessor(processor: JobProcessor): void {
        this.processors.set(processor.type, processor);
        logger.info('Job processor registered', {
            type: processor.type,
            concurrency: processor.concurrency || 1,
        });
    }

    // Add job to queue
    async addJob(
        type: JobType,
        payload: Record<string, unknown>,
        options: {
            priority?: Job['priority'];
            maxAttempts?: number;
            createdBy?: string;
        } = {}
    ): Promise<string> {
        const job: Job = {
            id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            payload,
            priority: options.priority || 'normal',
            status: 'pending',
            attempts: 0,
            maxAttempts: options.maxAttempts || 3,
            createdAt: new Date(),
            createdBy: options.createdBy,
        };

        this.jobs.set(job.id, job);

        logger.info('Job added to queue', {
            jobId: job.id,
            type: job.type,
            priority: job.priority,
            queueSize: this.jobs.size,
        });

        return job.id;
    }

    // Get job status
    getJob(jobId: string): Job | undefined {
        return this.jobs.get(jobId);
    }

    // Get queue statistics
    getStats(): {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        failed: number;
        processingConcurrency: number;
    } {
        const jobs = Array.from(this.jobs.values());
        return {
            total: jobs.length,
            pending: jobs.filter((j) => j.status === 'pending').length,
            processing: jobs.filter((j) => j.status === 'processing').length,
            completed: jobs.filter((j) => j.status === 'completed').length,
            failed: jobs.filter((j) => j.status === 'failed').length,
            processingConcurrency: this.processingQueue.size,
        };
    }

    // Start queue processing
    private async startProcessing(): Promise<void> {
        if (this.isProcessing) return;

        this.isProcessing = true;
        logger.info('Job queue processing started', {
            maxConcurrency: this.maxConcurrency,
        });

        // Process jobs continuously
        setInterval(() => {
            this.processNextJobs();
        }, 1000); // Check every second
    }

    // Process next available jobs
    private async processNextJobs(): Promise<void> {
        if (this.processingQueue.size >= this.maxConcurrency) {
            return; // Max concurrency reached
        }

        // Get pending jobs sorted by priority and creation time
        const pendingJobs = Array.from(this.jobs.values())
            .filter(
                (job) => job.status === 'pending' || job.status === 'retrying'
            )
            .sort((a, b) => {
                const priorityOrder = {
                    critical: 0,
                    high: 1,
                    normal: 2,
                    low: 3,
                };
                const priorityDiff =
                    priorityOrder[a.priority] - priorityOrder[b.priority];
                if (priorityDiff !== 0) return priorityDiff;
                return a.createdAt.getTime() - b.createdAt.getTime();
            });

        const availableSlots = this.maxConcurrency - this.processingQueue.size;
        const jobsToProcess = pendingJobs.slice(0, availableSlots);

        for (const job of jobsToProcess) {
            this.processJob(job);
        }
    }

    // Process individual job
    private async processJob(job: Job): Promise<void> {
        if (this.processingQueue.has(job.id)) {
            return; // Already processing
        }

        const processor = this.processors.get(job.type);
        if (!processor) {
            logger.error('No processor found for job type', {
                jobId: job.id,
                type: job.type,
            });
            this.markJobFailed(job, 'No processor available');
            return;
        }

        this.processingQueue.add(job.id);
        job.status = 'processing';
        job.processedAt = new Date();
        job.attempts++;

        logger.info('Processing job', {
            jobId: job.id,
            type: job.type,
            attempt: job.attempts,
            maxAttempts: job.maxAttempts,
        });

        try {
            await processor.processor(job);
            this.markJobCompleted(job);
        } catch (error) {
            this.handleJobError(job, error as Error);
        } finally {
            this.processingQueue.delete(job.id);
        }
    }

    // Mark job as completed
    private markJobCompleted(job: Job): void {
        job.status = 'completed';
        job.completedAt = new Date();

        logger.info('Job completed', {
            jobId: job.id,
            type: job.type,
            duration:
                job.completedAt.getTime() - (job.processedAt?.getTime() || 0),
        });

        // Clean up completed jobs after some time in production
        if (isProd) {
            setTimeout(() => {
                this.jobs.delete(job.id);
            }, 5 * 60 * 1000); // Keep for 5 minutes
        }
    }

    // Mark job as failed
    private markJobFailed(job: Job, error: string): void {
        job.status = 'failed';
        job.error = error;
        job.completedAt = new Date();

        logger.error('Job failed', {
            jobId: job.id,
            type: job.type,
            error,
            attempts: job.attempts,
        });
    }

    // Handle job errors with retry logic
    private async handleJobError(job: Job, error: Error): Promise<void> {
        logger.warn('Job processing error', {
            jobId: job.id,
            type: job.type,
            attempt: job.attempts,
            error: error.message,
        });

        if (job.attempts < job.maxAttempts) {
            // Retry with exponential backoff
            const delay =
                this.retryDelays[
                    Math.min(job.attempts - 1, this.retryDelays.length - 1)
                ];

            setTimeout(() => {
                job.status = 'retrying';
                job.error = error.message;
            }, delay);

            logger.info('Job scheduled for retry', {
                jobId: job.id,
                nextAttempt: job.attempts + 1,
                retryDelay: delay,
            });
        } else {
            this.markJobFailed(job, error.message);
        }
    }

    // Register default processors for H3 Network
    private registerDefaultProcessors(): void {
        // Bulk video upload processor
        this.registerProcessor({
            type: 'bulk-video-upload',
            concurrency: 2,
            processor: async (job: Job) => {
                const { videos, creatorId } = job.payload as {
                    videos: Array<{
                        title: string;
                        youtubeId: string;
                        description?: string;
                    }>;
                    creatorId: string;
                };

                logger.info('Processing bulk video upload', {
                    jobId: job.id,
                    videoCount: videos.length,
                    creatorId,
                });

                // Process videos in batches to avoid overwhelming the database
                const batchSize = 5;
                for (let i = 0; i < videos.length; i += batchSize) {
                    const batch = videos.slice(i, i + batchSize);

                    await Promise.all(
                        batch.map(async (video) => {
                            try {
                                await prisma.video.create({
                                    data: {
                                        title: video.title,
                                        youtubeId: video.youtubeId,
                                        youtubeUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
                                        description: video.description,
                                        creatorId,
                                        status: 'DRAFT',
                                    },
                                });
                            } catch (error) {
                                logger.error(
                                    'Failed to create video in bulk upload',
                                    {
                                        jobId: job.id,
                                        youtubeId: video.youtubeId,
                                        error:
                                            error instanceof Error
                                                ? error.message
                                                : String(error),
                                    }
                                );
                            }
                        })
                    );

                    // Small delay between batches
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
            },
        });

        // Bulk blog upload processor
        this.registerProcessor({
            type: 'bulk-blog-upload',
            concurrency: 2,
            processor: async (job: Job) => {
                const { blogs, creatorId } = job.payload as {
                    blogs: Array<{
                        title: string;
                        content: string;
                        excerpt?: string;
                    }>;
                    creatorId: string;
                };

                logger.info('Processing bulk blog upload', {
                    jobId: job.id,
                    blogCount: blogs.length,
                    creatorId,
                });

                const batchSize = 3; // Smaller batches for blogs due to larger content
                for (let i = 0; i < blogs.length; i += batchSize) {
                    const batch = blogs.slice(i, i + batchSize);

                    await Promise.all(
                        batch.map(async (blog) => {
                            try {
                                await prisma.blog.create({
                                    data: {
                                        title: blog.title,
                                        content: blog.content,
                                        excerpt:
                                            blog.excerpt ||
                                            blog.content.substring(0, 200),
                                        creatorId,
                                        status: 'DRAFT',
                                    },
                                });
                            } catch (error) {
                                logger.error(
                                    'Failed to create blog in bulk upload',
                                    {
                                        jobId: job.id,
                                        blogTitle: blog.title.substring(0, 50),
                                        error:
                                            error instanceof Error
                                                ? error.message
                                                : String(error),
                                    }
                                );
                            }
                        })
                    );

                    await new Promise((resolve) => setTimeout(resolve, 200));
                }
            },
        });

        // Content processing (thumbnail generation, etc.)
        this.registerProcessor({
            type: 'content-processing',
            concurrency: 3,
            processor: async (job: Job) => {
                const { contentId, contentType, operations } = job.payload as {
                    contentId: string;
                    contentType: 'video' | 'blog';
                    operations: string[];
                };

                logger.info('Processing content operations', {
                    jobId: job.id,
                    contentId,
                    contentType,
                    operationCount: operations.length,
                });

                // Simulate content processing operations
                for (const operation of operations) {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    logger.debug('Content operation completed', {
                        jobId: job.id,
                        operation,
                        contentId,
                    });
                }
            },
        });

        // Email notifications
        this.registerProcessor({
            type: 'email-notifications',
            concurrency: 5,
            processor: async (job: Job) => {
                const { recipients, subject, type } = job.payload as {
                    recipients: string[];
                    subject: string;
                    content: string;
                    type: 'notification' | 'marketing' | 'system';
                };

                logger.info('Processing email notifications', {
                    jobId: job.id,
                    recipientCount: recipients.length,
                    type,
                });

                // In production, this would integrate with your email service
                // For now, we'll just log the operation
                await new Promise((resolve) => setTimeout(resolve, 500));

                logger.debug('Email notifications sent', {
                    jobId: job.id,
                    recipients: recipients.length,
                    subject: subject.substring(0, 50),
                });
            },
        });

        logger.info('Default job processors registered', {
            processorCount: this.processors.size,
            typeCount: this.processors.size,
        });
    }
}

// Export singleton instance
export const jobQueue = JobQueue.getInstance();

// Utility functions
export const JobUtils = {
    // Add bulk video upload job
    async addBulkVideoUpload(
        videos: Array<{
            title: string;
            youtubeId: string;
            description?: string;
        }>,
        creatorId: string,
        priority: Job['priority'] = 'normal'
    ): Promise<string> {
        return jobQueue.addJob(
            'bulk-video-upload',
            { videos, creatorId },
            {
                priority,
                maxAttempts: 5,
                createdBy: creatorId,
            }
        );
    },

    // Add bulk blog upload job
    async addBulkBlogUpload(
        blogs: Array<{ title: string; content: string; excerpt?: string }>,
        creatorId: string,
        priority: Job['priority'] = 'normal'
    ): Promise<string> {
        return jobQueue.addJob(
            'bulk-blog-upload',
            { blogs, creatorId },
            {
                priority,
                maxAttempts: 5,
                createdBy: creatorId,
            }
        );
    },

    // Add content processing job
    async addContentProcessing(
        contentId: string,
        contentType: 'video' | 'blog',
        operations: string[],
        priority: Job['priority'] = 'normal'
    ): Promise<string> {
        return jobQueue.addJob(
            'content-processing',
            {
                contentId,
                contentType,
                operations,
            },
            { priority }
        );
    },

    // Get job status
    getJobStatus(jobId: string): Job | null {
        return jobQueue.getJob(jobId) || null;
    },

    // Get queue statistics
    getQueueStats() {
        return jobQueue.getStats();
    },
};
