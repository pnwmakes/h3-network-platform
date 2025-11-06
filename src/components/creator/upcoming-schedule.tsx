import Link from 'next/link';
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';

// TODO: This will be connected to actual scheduled content data
const upcomingItems = [
    {
        id: '1',
        title: 'Weekly Check-in: Recovery Journey Update',
        type: 'video',
        scheduledFor: '2024-11-07T14:00:00Z',
        status: 'scheduled',
    },
    {
        id: '2',
        title: 'Blog: Finding Hope After Setbacks',
        type: 'blog',
        scheduledFor: '2024-11-08T09:00:00Z',
        status: 'draft',
    },
    {
        id: '3',
        title: 'Community Q&A Session',
        type: 'video',
        scheduledFor: '2024-11-10T19:00:00Z',
        status: 'scheduled',
    },
];

function formatScheduleDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

export function UpcomingSchedule() {
    return (
        <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-lg font-medium text-gray-900'>
                            Upcoming Schedule
                        </h2>
                        <p className='text-sm text-gray-500'>
                            Your planned content releases
                        </p>
                    </div>
                    <Link
                        href='/creator/schedule'
                        className='inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                    >
                        <CalendarIcon className='w-4 h-4 mr-1' />
                        View Calendar
                    </Link>
                </div>
            </div>
            <div className='p-6'>
                <div className='space-y-4'>
                    {upcomingItems.length > 0 ? (
                        upcomingItems.map((item) => (
                            <div
                                key={item.id}
                                className='flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50'
                            >
                                <div className='flex-shrink-0'>
                                    <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                                        <span className='text-sm'>
                                            {item.type === 'video'
                                                ? '🎥'
                                                : '📝'}
                                        </span>
                                    </div>
                                </div>
                                <div className='flex-1 min-w-0'>
                                    <p className='text-sm font-medium text-gray-900 truncate'>
                                        {item.title}
                                    </p>
                                    <p className='text-sm text-gray-500'>
                                        {formatScheduleDate(item.scheduledFor)}
                                    </p>
                                </div>
                                <div className='flex-shrink-0'>
                                    <span
                                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                            item.status === 'scheduled'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center py-6'>
                            <CalendarIcon className='mx-auto h-12 w-12 text-gray-400' />
                            <h3 className='mt-2 text-sm font-medium text-gray-900'>
                                No scheduled content
                            </h3>
                            <p className='mt-1 text-sm text-gray-500'>
                                Get started by scheduling your next video or
                                blog post.
                            </p>
                            <div className='mt-6'>
                                <Link
                                    href='/creator/schedule'
                                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
                                >
                                    <PlusIcon className='-ml-1 mr-2 h-5 w-5' />
                                    Schedule Content
                                </Link>
                            </div>
                        </div>
                    )}
                </div>

                {upcomingItems.length > 0 && (
                    <div className='mt-6 pt-4 border-t border-gray-200'>
                        <Link
                            href='/creator/schedule'
                            className='text-sm text-blue-600 hover:text-blue-500 font-medium'
                        >
                            View full schedule →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
