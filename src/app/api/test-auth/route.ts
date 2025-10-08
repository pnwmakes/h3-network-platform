import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        return NextResponse.json({
            hasSession: !!session,
            userId: session?.user?.id || null,
            userEmail: session?.user?.email || null,
            userName: session?.user?.name || null,
        });
    } catch (error) {
        console.error('Error getting session:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
