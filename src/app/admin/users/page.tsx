'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
    Users,
    Search,
    Filter,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'VIEWER' | 'CREATOR' | 'ADMIN' | 'SUPER_ADMIN';
    emailVerified: string | null;
    createdAt: string;
    creator?: {
        id: string;
        displayName: string;
        isActive: boolean;
    };
}

interface UserManagementData {
    users: User[];
    pagination: {
        total: number;
        pages: number;
        current: number;
        perPage: number;
    };
    filters: {
        roles: string[];
        statuses: string[];
    };
}

export default function UserManagement() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState<UserManagementData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const params = new URLSearchParams({
                page: currentPage.toString(),
                ...(selectedRole !== 'all' && { role: selectedRole }),
                ...(selectedStatus !== 'all' && { status: selectedStatus }),
                ...(searchQuery && { search: searchQuery }),
            });

            const response = await fetch(`/api/admin/users?${params}`);
            const responseData = await response.json();

            if (response.ok) {
                setData({
                    users: responseData.data?.users || [],
                    pagination: {
                        total: responseData.data?.pagination?.total || 0,
                        pages: responseData.data?.pagination?.pages || 1,
                        current: currentPage,
                        perPage: 10,
                    },
                    filters: {
                        roles: ['VIEWER', 'CREATOR', 'ADMIN', 'SUPER_ADMIN'],
                        statuses: [
                            'active',
                            'inactive',
                            'verified',
                            'unverified',
                        ],
                    },
                });
            } else {
                throw new Error(responseData.error || 'Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedRole, selectedStatus, searchQuery]);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session?.user) {
            router.push('/auth/signin');
            return;
        }

        if (session.user.role !== 'SUPER_ADMIN') {
            router.push('/');
            return;
        }

        fetchUsers();
    }, [
        session,
        status,
        router,
        currentPage,
        selectedRole,
        selectedStatus,
        searchQuery,
        fetchUsers,
    ]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            const result = await response.json();
            if (result.success) {
                fetchUsers(); // Refresh the list
            } else {
                alert('Failed to update user role: ' + result.error);
            }
        } catch (error) {
            console.error('Role update error:', error);
            alert('Failed to update user role');
        }
    };

    const handleUserAction = async (
        userId: string,
        action: 'activate' | 'deactivate' | 'delete'
    ) => {
        if (
            action === 'delete' &&
            !confirm(
                'Are you sure you want to delete this user? This action cannot be undone.'
            )
        ) {
            return;
        }

        try {
            const response = await fetch(
                `/api/admin/users/${userId}/${action}`,
                {
                    method: action === 'delete' ? 'DELETE' : 'PUT',
                }
            );

            const result = await response.json();
            if (result.success) {
                fetchUsers(); // Refresh the list
            } else {
                alert(`Failed to ${action} user: ` + result.error);
            }
        } catch (error) {
            console.error(`User ${action} error:`, error);
            alert(`Failed to ${action} user`);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'ADMIN':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'CREATOR':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Card className='w-96'>
                    <CardContent className='p-6 text-center'>
                        <h2 className='text-xl font-semibold mb-4 text-red-600'>
                            Error
                        </h2>
                        <p className='text-gray-600 mb-4'>{error}</p>
                        <Button onClick={() => fetchUsers()}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!data) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <Card className='w-96'>
                    <CardContent className='p-6 text-center'>
                        <h2 className='text-xl font-semibold mb-4'>
                            Unable to Load Users
                        </h2>
                        <p className='text-gray-600 mb-4'>
                            There was an issue loading the user management
                            system.
                        </p>
                        <Button onClick={() => fetchUsers()}>Retry</Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gray-50'>
            {/* Header */}
            <div className='bg-white shadow-sm border-b'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center py-4'>
                        <div className='flex items-center space-x-4'>
                            <Link
                                href='/admin/dashboard'
                                className='text-gray-500 hover:text-gray-700'
                            >
                                <ChevronLeft className='h-5 w-5' />
                            </Link>
                            <Users className='h-8 w-8 text-blue-600' />
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900'>
                                    User Management
                                </h1>
                                <p className='text-sm text-gray-500'>
                                    Manage all platform users and permissions
                                </p>
                            </div>
                        </div>
                        <Badge
                            variant='outline'
                            className='bg-red-50 text-red-700 border-red-200'
                        >
                            Super Admin Access
                        </Badge>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Search and Filters */}
                <Card className='mb-6'>
                    <CardContent className='p-6'>
                        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
                            <div className='flex items-center space-x-4 flex-1 max-w-md'>
                                <div className='relative flex-1'>
                                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                                    <input
                                        type='text'
                                        placeholder='Search users by name or email...'
                                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                </div>
                            </div>

                            <div className='flex items-center space-x-4'>
                                <Button
                                    variant='outline'
                                    onClick={() => setShowFilters(!showFilters)}
                                    className='flex items-center space-x-2'
                                >
                                    <Filter className='h-4 w-4' />
                                    <span>Filters</span>
                                </Button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className='mt-4 pt-4 border-t border-gray-200'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Role
                                        </label>
                                        <select
                                            value={selectedRole}
                                            onChange={(e) =>
                                                setSelectedRole(e.target.value)
                                            }
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        >
                                            <option value='all'>
                                                All Roles
                                            </option>
                                            <option value='VIEWER'>
                                                Viewer
                                            </option>
                                            <option value='CREATOR'>
                                                Creator
                                            </option>
                                            <option value='ADMIN'>Admin</option>
                                            <option value='SUPER_ADMIN'>
                                                Super Admin
                                            </option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            Status
                                        </label>
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) =>
                                                setSelectedStatus(
                                                    e.target.value
                                                )
                                            }
                                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                                        >
                                            <option value='all'>
                                                All Statuses
                                            </option>
                                            <option value='active'>
                                                Active
                                            </option>
                                            <option value='inactive'>
                                                Inactive
                                            </option>
                                            <option value='verified'>
                                                Email Verified
                                            </option>
                                            <option value='unverified'>
                                                Email Unverified
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center justify-between'>
                            <span>Users ({data?.pagination?.total || 0})</span>
                            <div className='text-sm text-gray-500'>
                                Page {data?.pagination?.current || 1} of{' '}
                                {data?.pagination?.pages || 1}
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='overflow-x-auto'>
                            <table className='w-full table-auto'>
                                <thead>
                                    <tr className='border-b border-gray-200'>
                                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                                            User
                                        </th>
                                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                                            Role
                                        </th>
                                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                                            Status
                                        </th>
                                        <th className='text-left py-3 px-4 font-medium text-gray-700'>
                                            Joined
                                        </th>
                                        <th className='text-right py-3 px-4 font-medium text-gray-700'>
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.users?.map((user) => (
                                        <tr
                                            key={user.id}
                                            className='border-b border-gray-100 hover:bg-gray-50'
                                        >
                                            <td className='py-4 px-4'>
                                                <div>
                                                    <div className='font-medium text-gray-900'>
                                                        {user.name}
                                                    </div>
                                                    <div className='text-sm text-gray-500'>
                                                        {user.email}
                                                    </div>
                                                    {user.creator && (
                                                        <div className='text-xs text-blue-600 mt-1'>
                                                            Creator:{' '}
                                                            {
                                                                user.creator
                                                                    .displayName
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='py-4 px-4'>
                                                <select
                                                    value={user.role}
                                                    onChange={(e) =>
                                                        handleRoleChange(
                                                            user.id,
                                                            e.target.value
                                                        )
                                                    }
                                                    className={`px-2 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                                                        user.role
                                                    )}`}
                                                    disabled={
                                                        user.role ===
                                                            'SUPER_ADMIN' &&
                                                        user.email ===
                                                            session?.user?.email
                                                    }
                                                >
                                                    <option value='VIEWER'>
                                                        Viewer
                                                    </option>
                                                    <option value='CREATOR'>
                                                        Creator
                                                    </option>
                                                    <option value='ADMIN'>
                                                        Admin
                                                    </option>
                                                    <option value='SUPER_ADMIN'>
                                                        Super Admin
                                                    </option>
                                                </select>
                                            </td>
                                            <td className='py-4 px-4'>
                                                <div className='flex flex-col space-y-1'>
                                                    <Badge
                                                        variant='secondary'
                                                        className={
                                                            user.emailVerified
                                                                ? 'bg-green-100 text-green-800'
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }
                                                    >
                                                        {user.emailVerified
                                                            ? 'Verified'
                                                            : 'Unverified'}
                                                    </Badge>
                                                    {user.creator && (
                                                        <Badge
                                                            variant='secondary'
                                                            className={
                                                                user.creator
                                                                    .isActive
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-gray-100 text-gray-800'
                                                            }
                                                        >
                                                            {user.creator
                                                                .isActive
                                                                ? 'Active Creator'
                                                                : 'Inactive Creator'}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='py-4 px-4 text-sm text-gray-600'>
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className='py-4 px-4'>
                                                <div className='flex items-center justify-end space-x-2'>
                                                    {user.creator && (
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={() =>
                                                                handleUserAction(
                                                                    user.id,
                                                                    user.creator!
                                                                        .isActive
                                                                        ? 'deactivate'
                                                                        : 'activate'
                                                                )
                                                            }
                                                            className='flex items-center space-x-1'
                                                        >
                                                            {user.creator
                                                                .isActive ? (
                                                                <UserX className='h-3 w-3' />
                                                            ) : (
                                                                <UserCheck className='h-3 w-3' />
                                                            )}
                                                            <span>
                                                                {user.creator
                                                                    .isActive
                                                                    ? 'Deactivate'
                                                                    : 'Activate'}
                                                            </span>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size='sm'
                                                        variant='outline'
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/users/${user.id}`
                                                            )
                                                        }
                                                        className='flex items-center space-x-1'
                                                    >
                                                        <Edit className='h-3 w-3' />
                                                        <span>Edit</span>
                                                    </Button>
                                                    {user.email !==
                                                        session?.user
                                                            ?.email && (
                                                        <Button
                                                            size='sm'
                                                            variant='outline'
                                                            onClick={() =>
                                                                handleUserAction(
                                                                    user.id,
                                                                    'delete'
                                                                )
                                                            }
                                                            className='flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50'
                                                        >
                                                            <Trash2 className='h-3 w-3' />
                                                            <span>Delete</span>
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {(data?.pagination?.pages || 1) > 1 && (
                            <div className='mt-6 flex items-center justify-between'>
                                <div className='text-sm text-gray-500'>
                                    Showing{' '}
                                    {((data?.pagination?.current || 1) - 1) *
                                        (data?.pagination?.perPage || 10) +
                                        1}{' '}
                                    to{' '}
                                    {Math.min(
                                        (data?.pagination?.current || 1) *
                                            (data?.pagination?.perPage || 10),
                                        data?.pagination?.total || 0
                                    )}{' '}
                                    of {data?.pagination?.total || 0} users
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                            setCurrentPage((prev) =>
                                                Math.max(1, prev - 1)
                                            )
                                        }
                                        disabled={
                                            (data?.pagination?.current || 1) ===
                                            1
                                        }
                                        className='flex items-center space-x-1'
                                    >
                                        <ChevronLeft className='h-4 w-4' />
                                        <span>Previous</span>
                                    </Button>
                                    <div className='flex items-center space-x-1'>
                                        {Array.from(
                                            {
                                                length: Math.min(
                                                    5,
                                                    data.pagination.pages
                                                ),
                                            },
                                            (_, i) => {
                                                const page = i + 1;
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={
                                                            page ===
                                                            (data?.pagination
                                                                ?.current || 1)
                                                                ? 'default'
                                                                : 'outline'
                                                        }
                                                        size='sm'
                                                        onClick={() =>
                                                            setCurrentPage(page)
                                                        }
                                                        className='w-8 h-8 p-0'
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            }
                                        )}
                                    </div>
                                    <Button
                                        variant='outline'
                                        size='sm'
                                        onClick={() =>
                                            setCurrentPage(
                                                Math.min(
                                                    data?.pagination?.pages ||
                                                        1,
                                                    currentPage + 3
                                                )
                                            )
                                        }
                                        disabled={
                                            (data?.pagination?.current || 1) ===
                                            (data?.pagination?.pages || 1)
                                        }
                                        className='flex items-center space-x-1'
                                    >
                                        <span>Next</span>
                                        <ChevronRight className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
