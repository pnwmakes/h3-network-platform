interface DashboardStats {
    totalVideos: number;
    totalBlogs: number;
    totalViews: number;
    subscriberCount: number;
}

interface CreatorDashboardStatsProps {
    stats: DashboardStats;
}

export function CreatorDashboardStats({ stats }: CreatorDashboardStatsProps) {
    const statItems = [
        {
            name: 'Total Videos',
            value: stats.totalVideos.toLocaleString(),
            icon: '🎥',
            color: 'bg-blue-500',
        },
        {
            name: 'Total Views',
            value: stats.totalViews.toLocaleString(),
            icon: '👀',
            color: 'bg-green-500',
        },
        {
            name: 'Blog Posts',
            value: stats.totalBlogs.toLocaleString(),
            icon: '📝',
            color: 'bg-purple-500',
        },
        {
            name: 'Subscribers',
            value: stats.subscriberCount.toLocaleString(),
            icon: '👥',
            color: 'bg-orange-500',
        },
    ];

    return (
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
            {statItems.map((item) => (
                <div
                    key={item.name}
                    className='relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6'
                >
                    <dt>
                        <div
                            className={`absolute rounded-md p-3 ${item.color}`}
                        >
                            <span
                                className='text-white text-xl'
                                role='img'
                                aria-label={item.name}
                            >
                                {item.icon}
                            </span>
                        </div>
                        <p className='ml-16 truncate text-sm font-medium text-gray-500'>
                            {item.name}
                        </p>
                    </dt>
                    <dd className='ml-16 flex items-baseline'>
                        <p className='text-2xl font-semibold text-gray-900'>
                            {item.value}
                        </p>
                    </dd>
                </div>
            ))}
        </div>
    );
}
