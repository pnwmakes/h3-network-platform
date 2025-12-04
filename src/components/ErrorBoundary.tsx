'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });

        // TODO: Log to error tracking service (Sentry) when configured
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
                    <Card className='w-full max-w-2xl'>
                        <CardHeader>
                            <CardTitle className='flex items-center text-red-600'>
                                <AlertCircle className='h-6 w-6 mr-2' />
                                Something went wrong
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <p className='text-gray-700'>
                                We encountered an unexpected error. Please try
                                refreshing the page or return to the home page.
                            </p>

                            {process.env.NODE_ENV === 'development' &&
                                this.state.error && (
                                    <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                                        <p className='text-sm font-mono text-red-800 mb-2'>
                                            <strong>Error:</strong>{' '}
                                            {this.state.error.message}
                                        </p>
                                        {this.state.errorInfo && (
                                            <details className='text-xs font-mono text-red-700'>
                                                <summary className='cursor-pointer hover:text-red-900'>
                                                    Stack trace
                                                </summary>
                                                <pre className='mt-2 overflow-auto max-h-64 bg-red-100 p-2 rounded'>
                                                    {
                                                        this.state.errorInfo
                                                            .componentStack
                                                    }
                                                </pre>
                                            </details>
                                        )}
                                    </div>
                                )}

                            <div className='flex gap-3'>
                                <Button
                                    onClick={this.handleReset}
                                    className='flex-1'
                                >
                                    <RefreshCw className='h-4 w-4 mr-2' />
                                    Refresh Page
                                </Button>
                                <Link href='/' className='flex-1'>
                                    <Button
                                        variant='outline'
                                        className='w-full'
                                    >
                                        <Home className='h-4 w-4 mr-2' />
                                        Go Home
                                    </Button>
                                </Link>
                            </div>

                            <p className='text-xs text-gray-500 text-center'>
                                If this problem persists, please contact
                                support.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
