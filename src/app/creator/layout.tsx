import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { CreatorSidebar } from '@/components/creator/creator-sidebar';

export default async function CreatorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and has creator privileges
    if (!session) {
        redirect('/auth/signin?callbackUrl=/creator');
    }

    if (!['CREATOR', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        redirect('/');
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='flex'>
                {/* Sidebar */}
                <div className='hidden lg:flex lg:w-64 lg:flex-col'>
                    <CreatorSidebar />
                </div>

                {/* Main content */}
                <div className='flex-1 lg:pl-64'>
                    <div className='py-6'>
                        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
