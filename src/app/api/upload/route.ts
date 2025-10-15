import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        console.log('Upload API called');
        
        const session = await getServerSession(authOptions);
        console.log('Session:', session?.user ? { id: session.user.id, email: session.user.email } : 'No session');

        if (!session?.user?.id) {
            console.log('No valid session found');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;

        console.log('File received:', file ? { name: file.name, size: file.size, type: file.type } : 'No file');
        console.log('Upload type:', type);

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            console.log('Invalid file type:', file.type);
            return NextResponse.json(
                { error: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            console.log('File too large:', file.size);
            return NextResponse.json(
                { error: 'File size must be less than 5MB' },
                { status: 400 }
            );
        }

        // Create upload directory
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
        const filename = `${session.user.id}-${Date.now()}.${fileExtension}`;
        const filepath = join(uploadDir, filename);
        
        console.log('Saving file to:', filepath);

        // Convert file to buffer and save
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Return the URL
        const url = `/uploads/${type || 'misc'}/${filename}`;
        console.log('Upload successful, URL:', url);

        return NextResponse.json({
            success: true,
            url,
            filename,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
