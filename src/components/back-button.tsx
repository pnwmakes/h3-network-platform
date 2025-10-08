'use client';

import { useRouter } from 'next/navigation';

interface BackButtonProps {
    href?: string;
    label?: string;
}

export function BackButton({
    href = '/videos',
    label = 'Back to Videos',
}: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        // Check if there's history to go back to
        if (window.history.length > 1) {
            router.back();
        } else {
            // Fallback to the provided href
            router.push(href);
        }
    };

    return (
        <div className='mb-6'>
            <button
                onClick={handleBack}
                className='inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200'
            >
                <svg
                    className='w-4 h-4 mr-2'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                >
                    <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
                    />
                </svg>
                {label}
            </button>
        </div>
    );
}
