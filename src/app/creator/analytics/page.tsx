import { AdvancedAnalytics } from '@/components/creator/AdvancedAnalytics';

export default function CreatorAnalyticsPage() {
    return (
        <div className='space-y-8'>
            {/* Header */}
            <div className='border-b border-gray-200 pb-5'>
                <h1 className='text-3xl font-bold leading-6 text-gray-900'>
                    Analytics & Insights
                </h1>
                <p className='mt-2 max-w-4xl text-sm text-gray-500'>
                    Track your content performance, audience engagement, and
                    growth metrics.
                </p>
            </div>

            {/* Analytics Dashboard */}
            <AdvancedAnalytics />
        </div>
    );
}
