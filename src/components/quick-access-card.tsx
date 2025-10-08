'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Bookmark, Play, Clock } from 'lucide-react';

export function QuickAccessCard() {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Your Content
            </h3>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {/* Saved Videos */}
                <Link
                    href='/profile?tab=saved'
                    className='group flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200'
                >
                    <div className='flex-shrink-0'>
                        <Bookmark className='h-5 w-5 text-blue-600 group-hover:text-blue-700' />
                    </div>
                    <div>
                        <div className='text-sm font-medium text-gray-900 group-hover:text-blue-700'>
                            Saved Videos
                        </div>
                        <div className='text-xs text-gray-500'>Watch later</div>
                    </div>
                </Link>

                {/* Continue Watching */}
                <Link
                    href='/profile?tab=history'
                    className='group flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all duration-200'
                >
                    <div className='flex-shrink-0'>
                        <Play className='h-5 w-5 text-green-600 group-hover:text-green-700' />
                    </div>
                    <div>
                        <div className='text-sm font-medium text-gray-900 group-hover:text-green-700'>
                            Continue Watching
                        </div>
                        <div className='text-xs text-gray-500'>
                            Resume videos
                        </div>
                    </div>
                </Link>

                {/* Viewing History */}
                <Link
                    href='/profile?tab=history'
                    className='group flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-200'
                >
                    <div className='flex-shrink-0'>
                        <Clock className='h-5 w-5 text-purple-600 group-hover:text-purple-700' />
                    </div>
                    <div>
                        <div className='text-sm font-medium text-gray-900 group-hover:text-purple-700'>
                            Watch History
                        </div>
                        <div className='text-xs text-gray-500'>All videos</div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
