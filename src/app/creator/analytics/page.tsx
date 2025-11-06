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

            {/* Coming Soon */}
            <div className='text-center py-16'>
                <div className='mx-auto h-16 w-16 text-6xl mb-4'>📊</div>
                <h3 className='text-lg font-medium text-gray-900 mb-2'>
                    Analytics Dashboard Coming Soon
                </h3>
                <p className='text-sm text-gray-500 mb-6 max-w-md mx-auto'>
                    We&apos;re building comprehensive analytics to help you
                    understand your audience and optimize your content strategy.
                </p>
                <div className='bg-green-50 border border-green-200 rounded-lg p-6 max-w-lg mx-auto'>
                    <h4 className='font-medium text-green-900 mb-2'>
                        Planned Analytics Features:
                    </h4>
                    <ul className='text-sm text-green-800 space-y-1 text-left'>
                        <li>• Video & blog performance metrics</li>
                        <li>• Audience engagement tracking</li>
                        <li>• Growth trends and insights</li>
                        <li>• Content optimization recommendations</li>
                        <li>• Revenue and monetization tracking</li>
                        <li>• Export reports and data</li>
                    </ul>
                </div>
                <div className='mt-8'>
                    <p className='text-xs text-gray-400'>
                        For now, you can view basic stats in your{' '}
                        <a
                            href='/creator'
                            className='text-blue-600 hover:underline'
                        >
                            Dashboard Overview
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
