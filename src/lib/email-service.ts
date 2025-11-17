import nodemailer from 'nodemailer';
import {
    generateNewsletterHTML,
    generateNewsletterText,
    EmailTemplateData,
} from './email-templates';
import { prisma } from './prisma';
import { logger } from './logger';

interface EmailConfig {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
}

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
    from?: string;
}

class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private config: EmailConfig | null = null;

    constructor() {
        this.initializeTransporter();
    }

    private initializeTransporter() {
        try {
            // Check for email configuration in environment variables
            const emailHost = process.env.EMAIL_HOST;
            const emailPort = process.env.EMAIL_PORT;
            const emailUser = process.env.EMAIL_USER;
            const emailPass = process.env.EMAIL_PASS;

            if (!emailHost || !emailPort || !emailUser || !emailPass) {
                logger.warn(
                    'Email configuration not found in environment variables. Email sending will be simulated.'
                );
                return;
            }

            this.config = {
                host: emailHost,
                port: parseInt(emailPort),
                secure: emailPort === '465', // true for 465, false for other ports
                user: emailUser,
                pass: emailPass,
            };

            this.transporter = nodemailer.createTransporter({
                host: this.config.host,
                port: this.config.port,
                secure: this.config.secure,
                auth: {
                    user: this.config.user,
                    pass: this.config.pass,
                },
                tls: {
                    rejectUnauthorized: false, // For development
                },
            });

            logger.info('Email transporter initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize email transporter', {
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }

    async sendEmail(options: SendEmailOptions): Promise<boolean> {
        if (!this.transporter) {
            logger.info(
                'Email sending simulated (no transporter configured):',
                {
                    to: options.to,
                    subject: options.subject,
                    bodyPreview: options.text.substring(0, 100) + '...',
                }
            );
            return true; // Simulate success for development
        }

        try {
            const result = await this.transporter.sendMail({
                from: options.from || `"H3 Network" <${this.config?.user}>`,
                to: options.to,
                subject: options.subject,
                text: options.text,
                html: options.html,
            });

            logger.info('Email sent successfully:', {
                messageId: result.messageId,
                to: options.to,
                subject: options.subject,
            });

            return true;
        } catch (error) {
            logger.error('Failed to send email', {
                error: error instanceof Error ? error.message : String(error),
                to: options.to,
                subject: options.subject,
            });
            return false;
        }
    }

    async sendNewsletterToSubscriber(
        newsletterId: string,
        subscriberEmail: string,
        subscriberName?: string
    ): Promise<boolean> {
        try {
            // Get newsletter data
            const newsletter = await prisma.newsletter.findUnique({
                where: { id: newsletterId },
            });

            if (!newsletter) {
                logger.error('Newsletter not found:', { newsletterId });
                return false;
            }

            // Generate unsubscribe token
            const unsubscribeToken = await this.generateUnsubscribeToken(
                subscriberEmail
            );
            const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
            const unsubscribeUrl = `${baseUrl}/newsletter/unsubscribe?token=${unsubscribeToken}`;
            const viewInBrowserUrl = `${baseUrl}/newsletter/view/${newsletterId}`;

            // Prepare template data
            const templateData: EmailTemplateData = {
                newsletter,
                subscriberName,
                unsubscribeUrl,
                viewInBrowserUrl,
            };

            // Generate HTML and text versions
            const html = generateNewsletterHTML(templateData);
            const text = generateNewsletterText(templateData);

            // Send email
            const success = await this.sendEmail({
                to: subscriberEmail,
                subject: newsletter.subject,
                html,
                text,
            });

            // Find the subscriber record
            const subscriber = await prisma.newsletterSubscriber.findUnique({
                where: { email: subscriberEmail },
            });

            if (subscriber) {
                if (success) {
                    // Record the send
                    await prisma.newsletterSend.create({
                        data: {
                            newsletterId,
                            subscriberId: subscriber.id,
                            sentAt: new Date(),
                            status: 'SENT',
                        },
                    });
                } else {
                    // Record the failure
                    await prisma.newsletterSend.create({
                        data: {
                            newsletterId,
                            subscriberId: subscriber.id,
                            sentAt: new Date(),
                            status: 'FAILED',
                        },
                    });
                }
            }

            return success;
        } catch (error) {
            logger.error('Failed to send newsletter to subscriber', {
                error: error instanceof Error ? error.message : String(error),
                newsletterId,
                subscriberEmail,
            });

            // Record the failure
            try {
                const subscriber = await prisma.newsletterSubscriber.findUnique(
                    {
                        where: { email: subscriberEmail },
                    }
                );

                if (subscriber) {
                    await prisma.newsletterSend.create({
                        data: {
                            newsletterId,
                            subscriberId: subscriber.id,
                            sentAt: new Date(),
                            status: 'FAILED',
                        },
                    });
                }
            } catch (recordError) {
                logger.error('Failed to record newsletter send failure', {
                    error:
                        recordError instanceof Error
                            ? recordError.message
                            : String(recordError),
                });
            }

            return false;
        }
    }

    async sendNewsletterCampaign(newsletterId: string): Promise<{
        success: boolean;
        sentCount: number;
        failedCount: number;
        totalSubscribers: number;
    }> {
        try {
            // Get newsletter data
            const newsletter = await prisma.newsletter.findUnique({
                where: { id: newsletterId },
            });

            if (!newsletter) {
                throw new Error('Newsletter not found');
            }

            if (newsletter.status !== 'DRAFT') {
                throw new Error('Newsletter is not in draft status');
            }

            // Update newsletter status to SENDING
            await prisma.newsletter.update({
                where: { id: newsletterId },
                data: {
                    status: 'SENDING',
                },
            });

            // Get all active subscribers
            // Note: Simplified for now - in production, filter by preferences
            const subscribers = await prisma.newsletterSubscriber.findMany({
                where: {
                    isActive: true,
                },
            });

            const totalSubscribers = subscribers.length;
            let sentCount = 0;
            let failedCount = 0;

            // Send newsletter to each subscriber
            for (const subscriber of subscribers) {
                const success = await this.sendNewsletterToSubscriber(
                    newsletterId,
                    subscriber.email,
                    subscriber.name || undefined
                );

                if (success) {
                    sentCount++;
                } else {
                    failedCount++;
                }

                // Add a small delay to avoid overwhelming the email server
                await new Promise((resolve) => setTimeout(resolve, 100));
            }

            // Update newsletter status and statistics
            const finalStatus =
                failedCount === totalSubscribers ? 'FAILED' : 'SENT';

            await prisma.newsletter.update({
                where: { id: newsletterId },
                data: {
                    status: finalStatus,
                    sentAt: new Date(),
                    recipientCount: sentCount,
                },
            });

            logger.info('Newsletter campaign completed:', {
                newsletterId,
                totalSubscribers,
                sentCount,
                failedCount,
                finalStatus,
            });

            return {
                success: sentCount > 0,
                sentCount,
                failedCount,
                totalSubscribers,
            };
        } catch (error) {
            logger.error('Failed to send newsletter campaign', {
                error: error instanceof Error ? error.message : String(error),
                newsletterId,
            });

            // Update newsletter status to FAILED
            try {
                await prisma.newsletter.update({
                    where: { id: newsletterId },
                    data: {
                        status: 'FAILED',
                    },
                });
            } catch (updateError) {
                logger.error('Failed to update newsletter status to FAILED', {
                    error:
                        updateError instanceof Error
                            ? updateError.message
                            : String(updateError),
                });
            }

            return {
                success: false,
                sentCount: 0,
                failedCount: 0,
                totalSubscribers: 0,
            };
        }
    }

    private async generateUnsubscribeToken(email: string): Promise<string> {
        // Simple token generation - in production, use a more secure method
        const timestamp = Date.now().toString();
        const emailHash = Buffer.from(email).toString('base64');
        return `${emailHash}.${timestamp}`;
    }

    async validateUnsubscribeToken(token: string): Promise<string | null> {
        try {
            const [emailHash, timestamp] = token.split('.');
            const email = Buffer.from(emailHash, 'base64').toString();

            // Check if token is not older than 30 days (for security)
            const tokenAge = Date.now() - parseInt(timestamp);
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

            if (tokenAge > maxAge) {
                return null;
            }

            return email;
        } catch {
            return null;
        }
    }

    async testConnection(): Promise<boolean> {
        if (!this.transporter) {
            logger.info(
                'Email service is in simulation mode (no configuration found)'
            );
            return true; // Consider simulation mode as "working"
        }

        try {
            await this.transporter.verify();
            logger.info('Email service connection test successful');
            return true;
        } catch (error) {
            logger.error('Email service connection test failed', {
                error: error instanceof Error ? error.message : String(error),
            });
            return false;
        }
    }
}

// Export a singleton instance
export const emailService = new EmailService();
