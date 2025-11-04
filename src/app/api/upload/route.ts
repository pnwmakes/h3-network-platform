import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { withApiSecurity, createErrorResponse } from '@/lib/security';
import { logger } from '@/lib/logger';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const POST = withApiSecurity(async (request: NextRequest) => {
    try {
        logger.info('Upload API called');

        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            logger.securityEvent('Unauthorized upload attempt', 'medium', {
                endpoint: '/api/upload',
            });
            return createErrorResponse('Unauthorized', 401);
        }

        logger.info('File upload attempt', {
            userId: session.user.id,
            userEmail: session.user.email || undefined,
        });

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        logger.info('File upload details', {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadType: type,
        });

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            logger.warn('Invalid file type upload attempt', {
                fileType: file.type,
                userId: session.user.id,
            });
            return createErrorResponse('Only image files are allowed', 400);
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            console.log('File too large:', file.size);
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        // Convert to buffer for processing
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Check if we're in a serverless environment (like Netlify)
        const isServerless =
            process.env.NETLIFY ||
            process.env.VERCEL ||
            !process.env.NODE_ENV ||
            process.env.NODE_ENV === 'production';

        if (isServerless) {
            // For serverless environments, use base64 data URL
            const base64 = buffer.toString('base64');
            const dataUrl = `data:${file.type};base64,${base64}`;

            console.log(
                'Upload successful (serverless), converted to data URL'
            );

            return NextResponse.json({
                success: true,
                url: dataUrl,
                filename: file.name,
                type: 'data-url',
            });
        } else {
            // For local development, save to filesystem
            const uploadDir = join(
                process.cwd(),
                'public',
                'uploads',
                type || 'misc'
            );
            console.log('Upload directory:', uploadDir);

            if (!existsSync(uploadDir)) {
                console.log('Creating upload directory');
                await mkdir(uploadDir, { recursive: true });
            }

            // Generate unique filename
            const fileExtension = file.name.split('.').pop();
            const filename = `${
                session.user.id
            }-${Date.now()}.${fileExtension}`;
            const filepath = join(uploadDir, filename);

            console.log('Saving file to:', filepath);
            await writeFile(filepath, buffer);

            // Return the URL
            const url = `/uploads/${type || 'misc'}/${filename}`;
            console.log('Upload successful (local), URL:', url);

            return NextResponse.json({
                success: true,
                url,
                filename,
                type: 'file',
            });
        }
    } catch (error) {
        logger.error('Upload error', {
            error: error instanceof Error ? error.message : String(error),
            endpoint: '/api/upload',
        });
        return createErrorResponse('Upload failed', 500);
    }
});
