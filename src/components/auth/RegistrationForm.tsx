'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

// Public registration is always USER role
// Creators must apply separately through admin approval
export function RegistrationForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        // Force USER role for all public registrations
        role: 'USER' as const,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Show success message
            setSuccess(true);

            // Auto-login after successful registration
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                callbackUrl: '/',
            });

            if (!result?.ok) {
                setError(
                    'Account created but auto-login failed. Please sign in manually.'
                );
                setSuccess(false);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Registration failed'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (error) setError('');
    };

    if (success) {
        return (
            <Card className='w-full max-w-md mx-auto'>
                <CardContent className='p-6'>
                    <div className='text-center'>
                        <CheckCircle className='h-16 w-16 text-green-500 mx-auto mb-4' />
                        <h3 className='text-lg font-semibold mb-2'>
                            Registration Successful!
                        </h3>
                        <p className='text-gray-600 mb-4'>
                            Welcome to H3 Network! You&apos;re being signed in
                            automatically.
                        </p>
                        <div className='flex items-center justify-center space-x-2 text-sm text-gray-500'>
                            <Loader2 className='h-4 w-4 animate-spin' />
                            <span>Signing you in...</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='w-full max-w-md mx-auto'>
            <CardHeader>
                <CardTitle>Join H3 Network</CardTitle>
                <CardDescription>
                    Create your account to access exclusive content and support
                    our community
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    {error && (
                        <Alert variant='destructive'>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className='space-y-2'>
                        <Label htmlFor='name'>Full Name</Label>
                        <Input
                            id='name'
                            type='text'
                            value={formData.name}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => handleInputChange('name', e.target.value)}
                            required
                            placeholder='Enter your full name'
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='email'>Email Address</Label>
                        <Input
                            id='email'
                            type='email'
                            value={formData.email}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => handleInputChange('email', e.target.value)}
                            required
                            placeholder='Enter your email'
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='password'>Password</Label>
                        <Input
                            id='password'
                            type='password'
                            value={formData.password}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => handleInputChange('password', e.target.value)}
                            required
                            placeholder='Create a secure password'
                            minLength={8}
                        />
                    </div>

                    <div className='space-y-2'>
                        <Label htmlFor='confirmPassword'>
                            Confirm Password
                        </Label>
                        <Input
                            id='confirmPassword'
                            type='password'
                            value={formData.confirmPassword}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                                handleInputChange(
                                    'confirmPassword',
                                    e.target.value
                                )
                            }
                            required
                            placeholder='Confirm your password'
                            minLength={8}
                        />
                    </div>

                    <Button
                        type='submit'
                        className='w-full'
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Creating Account...
                            </>
                        ) : (
                            <>
                                <Mail className='mr-2 h-4 w-4' />
                                Create Account
                            </>
                        )}
                    </Button>

                    <div className='text-center text-sm text-gray-600'>
                        Already have an account?{' '}
                        <button
                            type='button'
                            onClick={() => router.push('/auth/signin')}
                            className='text-blue-600 hover:underline'
                        >
                            Sign in here
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
