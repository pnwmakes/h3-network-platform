import { Suspense } from 'react';
import { CreatorDashboard } from '@/components/creator/CreatorDashboard';

export default function CreatorDashboardPage() {
    return (
        <div className='min-h-screen bg-gray-50'>
            <Suspense
                fallback={
                    <div className='flex items-center justify-center min-h-screen'>
                        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
                    </div>
                }
            >
                <CreatorDashboard />
            </Suspense>
        </div>
    );
}
