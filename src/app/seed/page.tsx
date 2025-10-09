'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SeedResult {
    success: boolean;
    message?: string;
    error?: string;
    created?: {
        users: number;
        creators: number;
        shows: number;
        videos: number;
    };
}

export default function SeedPage() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [result, setResult] = useState<SeedResult | null>(null);

    const runSeed = async () => {
        setIsSeeding(true);
        setResult(null);
        
        try {
            const response = await fetch('/api/seed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ 
                success: false, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">
                    H3 Network Database Seeder
                </h1>
                
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <p className="text-gray-600 mb-6">
                        Click the button below to populate the H3 Network database with sample content including Noah, Rita, videos, and shows.
                        <br />
                        <small className="text-gray-500">Using direct database connection for reliable seeding.</small>
                    </p>
                    
                    <button
                        onClick={runSeed}
                        disabled={isSeeding}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                    >
                        {isSeeding ? 'Seeding Database...' : 'Seed H3 Network Database'}
                    </button>
                    
                    {result && (
                        <div className={`mt-6 p-4 rounded-lg ${
                            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                        }`}>
                            <h3 className={`font-semibold ${
                                result.success ? 'text-green-800' : 'text-red-800'
                            }`}>
                                {result.success ? 'Success!' : 'Error'}
                            </h3>
                            <p className={`mt-2 ${
                                result.success ? 'text-green-700' : 'text-red-700'
                            }`}>
                                {result.success ? result.message : result.error}
                            </p>
                            {result.created && (
                                <div className="mt-3 text-green-700 text-sm">
                                    <p>Created:</p>
                                    <ul className="list-disc list-inside ml-4">
                                        <li>{result.created.users} users</li>
                                        <li>{result.created.creators} creators</li>
                                        <li>{result.created.shows} shows</li>
                                        <li>{result.created.videos} videos</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {result?.success && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-2">Next Steps:</h4>
                            <div className="text-blue-700 text-sm space-y-1">
                                <p>• <Link href="/videos" className="underline hover:text-blue-900">Check Videos Page</Link></p>
                                <p>• <Link href="/creators" className="underline hover:text-blue-900">Check Creators Page</Link></p>
                                <p>• Test user: test@h3network.org / password123</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}