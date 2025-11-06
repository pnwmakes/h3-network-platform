import Link from 'next/link';
import {
    PlusIcon,
    VideoCameraIcon,
    DocumentTextIcon,
    CalendarIcon,
} from '@heroicons/react/24/outline';

const actions = [
    {
        title: 'Upload Video',
        description: 'Add a new video to your channel',
        href: '/creator/videos/new',
        icon: VideoCameraIcon,
        color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
        title: 'Write Blog Post',
        description: 'Create a new blog article',
        href: '/creator/blogs/new',
        icon: DocumentTextIcon,
        color: 'bg-green-600 hover:bg-green-700',
    },
    {
        title: 'Schedule Content',
        description: 'Plan your content calendar',
        href: '/creator/schedule',
        icon: CalendarIcon,
        color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
        title: 'Bulk Upload',
        description: 'Upload multiple videos at once',
        href: '/creator/videos/bulk-upload',
        icon: PlusIcon,
        color: 'bg-orange-600 hover:bg-orange-700',
    },
];

export function QuickActions() {
    return (
        <div className='bg-white rounded-lg shadow'>
            <div className='px-6 py-4 border-b border-gray-200'>
                <h2 className='text-lg font-medium text-gray-900'>
                    Quick Actions
                </h2>
                <p className='text-sm text-gray-500'>
                    Get started with creating content
                </p>
            </div>
            <div className='p-6'>
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                    {actions.map((action) => (
                        <Link
                            key={action.title}
                            href={action.href}
                            className='group relative rounded-lg p-6 hover:shadow-md transition-shadow'
                        >
                            <div>
                                <span
                                    className={`rounded-lg inline-flex p-3 text-white ${action.color}`}
                                >
                                    <action.icon
                                        className='h-6 w-6'
                                        aria-hidden='true'
                                    />
                                </span>
                            </div>
                            <div className='mt-4'>
                                <h3 className='text-base font-medium text-gray-900 group-hover:text-blue-600'>
                                    {action.title}
                                </h3>
                                <p className='mt-1 text-sm text-gray-500'>
                                    {action.description}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
