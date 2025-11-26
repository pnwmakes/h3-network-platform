'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function DebugAuthPage() {
    const { data: session, status } = useSession();
    const [cookies, setCookies] = useState<string>('');
    const [envInfo, setEnvInfo] = useState<Record<string, unknown> | null>(
        null
    );

    useEffect(() => {
        setCookies(document.cookie);

        // Fetch server-side env info
        fetch('/api/debug-env')
            .then((res) => res.json())
            .then((data) => setEnvInfo(data))
            .catch((err) => console.error(err));
    }, []);

    return (
        <div className='min-h-screen bg-gray-50 p-8'>
            <div className='max-w-4xl mx-auto space-y-6'>
                <h1 className='text-3xl font-bold'>
                    Authentication Debug Info
                </h1>

                {/* Session Info */}
                <div className='bg-white p-6 rounded-lg shadow'>
                    <h2 className='text-xl font-semibold mb-4'>
                        Session Status
                    </h2>
                    <div className='space-y-2'>
                        <p>
                            <strong>Status:</strong>{' '}
                            <span
                                className={
                                    status === 'authenticated'
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }
                            >
                                {status}
                            </span>
                        </p>
                        <p>
                            <strong>Session Data:</strong>
                        </p>
                        <pre className='bg-gray-100 p-4 rounded overflow-x-auto text-sm'>
                            {JSON.stringify(session, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Cookie Info */}
                <div className='bg-white p-6 rounded-lg shadow'>
                    <h2 className='text-xl font-semibold mb-4'>
                        Browser Cookies
                    </h2>
                    <div className='space-y-2'>
                        <p>
                            <strong>All Cookies:</strong>
                        </p>
                        <pre className='bg-gray-100 p-4 rounded overflow-x-auto text-sm'>
                            {cookies || 'No cookies found'}
                        </pre>
                        <div className='mt-4'>
                            <p>
                                <strong>NextAuth Cookies:</strong>
                            </p>
                            <ul className='list-disc ml-6 mt-2'>
                                {cookies
                                    .split(';')
                                    .filter((c) => c.includes('next-auth'))
                                    .map((cookie, i) => (
                                        <li
                                            key={i}
                                            className='text-sm font-mono'
                                        >
                                            {cookie.trim()}
                                        </li>
                                    ))}
                                {cookies
                                    .split(';')
                                    .filter((c) => c.includes('next-auth'))
                                    .length === 0 && (
                                    <li className='text-red-600'>
                                        No NextAuth cookies found!
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Environment Info */}
                <div className='bg-white p-6 rounded-lg shadow'>
                    <h2 className='text-xl font-semibold mb-4'>
                        Server Environment
                    </h2>
                    <pre className='bg-gray-100 p-4 rounded overflow-x-auto text-sm'>
                        {envInfo
                            ? JSON.stringify(envInfo, null, 2)
                            : 'Loading...'}
                    </pre>
                </div>

                {/* Test Buttons */}
                <div className='bg-white p-6 rounded-lg shadow'>
                    <h2 className='text-xl font-semibold mb-4'>Actions</h2>
                    <div className='space-x-4'>
                        <button
                            onClick={() =>
                                (window.location.href = '/auth/signin')
                            }
                            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                        >
                            Go to Sign In
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className='bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700'
                        >
                            Reload Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
