'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle, AlertCircle } from 'lucide-react';

export default function SetPasswordPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const router = useRouter();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [token, setToken] = useState<string>('');
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            try {
                const resolvedParams = await params;
                const resetToken = resolvedParams.token;
                setToken(resetToken);
                
                const response = await fetch(`/api/auth/validate-reset-token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: resetToken }),
                });

                if (response.ok) {
                    const data = await response.json();
                    setIsValidToken(true);
                    setUserEmail(data.email);
                } else {
                    setIsValidToken(false);
                    const data = await response.json();
                    setMessage({
                        type: 'error',
                        text: data.error || 'Invalid or expired reset link',
                    });
                }
            } catch (error) {
                console.error('Token validation error:', error);
                setIsValidToken(false);
                setMessage({
                    type: 'error',
                    text: 'Failed to validate reset link',
                });
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validate passwords
        if (password.length < 8) {
            setMessage({
                type: 'error',
                text: 'Password must be at least 8 characters long',
            });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({
                type: 'error',
                text: 'Passwords do not match',
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/set-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Password set successfully! Redirecting to login...',
                });
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            } else {
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to set password',
                });
            }
        } catch (error) {
            console.error('Password set error:', error);
            setMessage({
                type: 'error',
                text: 'Network error. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
                <Card className='w-full max-w-md'>
                    <CardContent className='pt-6 text-center'>
                        <Loader2 className='h-8 w-8 animate-spin mx-auto text-blue-600' />
                        <p className='mt-4 text-gray-600'>
                            Validating reset link...
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
                <Card className='w-full max-w-md border-red-200'>
                    <CardHeader>
                        <CardTitle className='flex items-center text-red-900'>
                            <AlertCircle className='h-5 w-5 mr-2' />
                            Invalid Reset Link
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='space-y-4'>
                        <Alert variant='destructive'>
                            <AlertDescription>
                                {message?.text ||
                                    'This password reset link is invalid or has expired.'}
                            </AlertDescription>
                        </Alert>
                        <p className='text-sm text-gray-600'>
                            Please contact an administrator to request a new invitation.
                        </p>
                        <Button
                            onClick={() => router.push('/auth/login')}
                            className='w-full'
                        >
                            Return to Login
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50 px-4'>
            <Card className='w-full max-w-md'>
                <CardHeader className='text-center'>
                    <div className='mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
                        <Lock className='h-6 w-6 text-blue-600' />
                    </div>
                    <CardTitle className='text-2xl'>Set Your Password</CardTitle>
                    <p className='text-sm text-gray-600 mt-2'>
                        Welcome to H3 Network! Please create a password for your
                        account.
                    </p>
                </CardHeader>
                <CardContent>
                    {message && (
                        <Alert
                            variant={
                                message.type === 'error'
                                    ? 'destructive'
                                    : 'default'
                            }
                            className='mb-4'
                        >
                            {message.type === 'success' && (
                                <CheckCircle className='h-4 w-4' />
                            )}
                            <AlertDescription>{message.text}</AlertDescription>
                        </Alert>
                    )}

                    <div className='mb-6 p-3 bg-blue-50 rounded-lg border border-blue-200'>
                        <p className='text-sm text-blue-900'>
                            <strong>Email:</strong> {userEmail}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div className='space-y-2'>
                            <Label htmlFor='password'>New Password</Label>
                            <Input
                                id='password'
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='Enter your password'
                                required
                                minLength={8}
                                disabled={isLoading}
                            />
                            <p className='text-xs text-gray-500'>
                                Must be at least 8 characters long
                            </p>
                        </div>

                        <div className='space-y-2'>
                            <Label htmlFor='confirmPassword'>
                                Confirm Password
                            </Label>
                            <Input
                                id='confirmPassword'
                                type='password'
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                placeholder='Confirm your password'
                                required
                                minLength={8}
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
                                    Setting Password...
                                </>
                            ) : (
                                'Set Password & Continue'
                            )}
                        </Button>
                    </form>

                    <div className='mt-6 pt-6 border-t'>
                        <p className='text-xs text-gray-500 text-center'>
                            After setting your password, you&apos;ll be redirected to the
                            login page to access your creator dashboard.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
