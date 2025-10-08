'use client';

import { useState } from 'react';
import { User, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react';

interface AccountSettingsProps {
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export default function AccountSettings({ user }: AccountSettingsProps) {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/users/${user.id}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                }),
            });

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Profile updated successfully!',
                });
            } else {
                const data = await response.json();
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to update profile',
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage({
                type: 'error',
                text: 'Password must be at least 6 characters',
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch(`/api/users/${user.id}/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword,
                }),
            });

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: 'Password updated successfully!',
                });
                setFormData((prev) => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));
            } else {
                const data = await response.json();
                setMessage({
                    type: 'error',
                    text: data.error || 'Failed to update password',
                });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update password' });
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    return (
        <div className='space-y-8'>
            <div>
                <h3 className='text-2xl font-bold text-gray-900 mb-6'>
                    Account Settings
                </h3>

                {/* Message Display */}
                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${
                            message.type === 'success'
                                ? 'bg-green-50 border border-green-200 text-green-800'
                                : 'bg-red-50 border border-red-200 text-red-800'
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Profile Information */}
                <div className='bg-gray-50 rounded-lg p-6 mb-8'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <User className='h-5 w-5 mr-2 text-gray-600' />
                        Profile Information
                    </h4>

                    <form onSubmit={handleProfileUpdate} className='space-y-4'>
                        <div>
                            <label
                                htmlFor='name'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Full Name
                            </label>
                            <input
                                type='text'
                                id='name'
                                name='name'
                                value={formData.name}
                                onChange={handleInputChange}
                                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor='email'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Email Address
                            </label>
                            <div className='relative'>
                                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                                <input
                                    type='email'
                                    id='email'
                                    name='email'
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className='w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Account Type
                            </label>
                            <div className='px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700'>
                                {user.role.charAt(0).toUpperCase() +
                                    user.role.slice(1).toLowerCase()}
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        >
                            <Save className='h-4 w-4 mr-2' />
                            {loading ? 'Saving...' : 'Save Profile'}
                        </button>
                    </form>
                </div>

                {/* Password Change */}
                <div className='bg-gray-50 rounded-lg p-6'>
                    <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                        <Lock className='h-5 w-5 mr-2 text-gray-600' />
                        Change Password
                    </h4>

                    <form onSubmit={handlePasswordChange} className='space-y-4'>
                        <div>
                            <label
                                htmlFor='currentPassword'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Current Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={
                                        showPasswords.current
                                            ? 'text'
                                            : 'password'
                                    }
                                    id='currentPassword'
                                    name='currentPassword'
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    required
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        togglePasswordVisibility('current')
                                    }
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                >
                                    {showPasswords.current ? (
                                        <EyeOff className='h-5 w-5' />
                                    ) : (
                                        <Eye className='h-5 w-5' />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor='newPassword'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                New Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={
                                        showPasswords.new ? 'text' : 'password'
                                    }
                                    id='newPassword'
                                    name='newPassword'
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    required
                                    minLength={6}
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        togglePasswordVisibility('new')
                                    }
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                >
                                    {showPasswords.new ? (
                                        <EyeOff className='h-5 w-5' />
                                    ) : (
                                        <Eye className='h-5 w-5' />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor='confirmPassword'
                                className='block text-sm font-medium text-gray-700 mb-1'
                            >
                                Confirm New Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={
                                        showPasswords.confirm
                                            ? 'text'
                                            : 'password'
                                    }
                                    id='confirmPassword'
                                    name='confirmPassword'
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                    required
                                    minLength={6}
                                />
                                <button
                                    type='button'
                                    onClick={() =>
                                        togglePasswordVisibility('confirm')
                                    }
                                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600'
                                >
                                    {showPasswords.confirm ? (
                                        <EyeOff className='h-5 w-5' />
                                    ) : (
                                        <Eye className='h-5 w-5' />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type='submit'
                            disabled={loading}
                            className='inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                        >
                            <Lock className='h-4 w-4 mr-2' />
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
