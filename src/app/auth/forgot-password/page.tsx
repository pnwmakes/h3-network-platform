'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [resetInfo, setResetInfo] = useState<{
        resetToken: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Password reset link generated!',
                });
                setResetInfo({ resetToken: data.resetToken });
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to process request',
                });
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            setMessage({
                type: 'error',
                text: 'Network error. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <div className='mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                        <Mail className='h-6 w-6 text-blue-600' />
                    </div>
                    <CardTitle className='text-2xl'>Forgot Password?</CardTitle>
                    <p className='text-sm text-gray-600 mt-2'>
                        Enter your email to reset your password
                    </p>
                </CardHeader>
                <CardContent>
                    {message && (
                        <Alert
                            variant={
                                message.type === 'error' ? 'destructive' : 'default'
                            }
                            className='mb-4'
                        >
                            {message.type === 'success' && (
                                <CheckCircle className='h-4 w-4' />
                            )}
                            <AlertDescription>{message.text}</AlertDescription>
                        </Alert>
                    )}

                    {resetInfo ? (
                        <div className='space-y-4'>
                            <div className='bg-blue-50 p-4 rounded-lg border border-blue-200'>
                                <p className='text-sm text-blue-900 mb-3'>
                                    <strong>Password Reset Link:</strong>
                                </p>
                                <div className='bg-white p-3 rounded border border-blue-300 mb-3 break-all'>
                                    <code className='text-xs'>
                                        {`${window.location.origin}/auth/set-password/${resetInfo.resetToken}`}
                                    </code>
                                </div>
                                <p className='text-xs text-blue-800'>
                                    This link will expire in 24 hours. Copy and use it to
                                    reset your password.
                                </p>
                            </div>
                            <Link href='/auth/login' className='block'>
                                <Button className='w-full'>Return to Login</Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='email'>Email Address</Label>
                                <Input
                                    id='email'
                                    type='email'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder='Enter your email'
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button
                                type='submit'
                                className='w-full'
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                        Processing...
                                    </>
                                ) : (
                                    'Reset Password'
                                )}
                            </Button>

                            <div className='text-center pt-4'>
                                <Link
                                    href='/auth/login'
                                    className='text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center'
                                >
                                    <ArrowLeft className='h-4 w-4 mr-1' />
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}

                    <div className='mt-6 pt-6 border-t'>
                        <p className='text-xs text-gray-500 text-center'>
                            Note: When email service is configured, reset links will be
                            sent automatically to your email.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
