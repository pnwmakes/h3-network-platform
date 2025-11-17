'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Mail,
    BarChart3,
    Settings,
    Shield,
    FileText,
    VideoIcon,
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    if (status === 'loading') {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
        );
    }

    if (!session || session.user.role !== 'SUPER_ADMIN') {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-center'>
                    <Shield className='h-12 w-12 text-red-500 mx-auto mb-4' />
                    <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                        Access Denied
                    </h1>
                    <p className='text-gray-600'>
                        You don&apos;t have permission to access the admin area.
                    </p>
                </div>
            </div>
        );
    }

    const navigation = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
        },
        {
            name: 'User Management',
            href: '/admin/users',
            icon: Users,
        },
        {
            name: 'Newsletter Management',
            href: '/admin/newsletter',
            icon: Mail,
        },
        {
            name: 'Content Management',
            href: '/admin/content',
            icon: VideoIcon,
        },
        {
            name: 'Analytics',
            href: '/admin/analytics',
            icon: BarChart3,
        },
        {
            name: 'Reports',
            href: '/admin/reports',
            icon: FileText,
        },
        {
            name: 'Settings',
            href: '/admin/settings',
            icon: Settings,
        },
    ];

    const isActive = (href: string) => {
        if (href === '/admin/dashboard') {
            return pathname === '/admin/dashboard' || pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <div className='min-h-screen bg-gray-50'>
            <div className='flex'>
                {/* Sidebar */}
                <div className='w-64 bg-white shadow-lg border-r border-gray-200'>
                    <div className='p-6'>
                        <div className='flex items-center gap-3'>
                            <Shield className='h-8 w-8 text-red-600' />
                            <div>
                                <h1 className='text-lg font-bold text-gray-900'>
                                    Admin Panel
                                </h1>
                                <p className='text-sm text-gray-500'>
                                    H3 Network Management
                                </p>
                            </div>
                        </div>
                    </div>

                    <nav className='mt-6'>
                        <div className='px-3'>
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center gap-3 px-3 py-2 mb-1 text-sm font-medium rounded-md transition-colors ${
                                            isActive(item.href)
                                                ? 'bg-red-50 text-red-700 border-r-2 border-red-600'
                                                : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                                        }`}
                                    >
                                        <Icon className='h-4 w-4' />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>

                    {/* User Info */}
                    <div className='absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-gray-50'>
                        <div className='flex items-center gap-3'>
                            <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
                                <span className='text-sm font-medium text-red-700'>
                                    {session.user.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className='text-sm font-medium text-gray-900'>
                                    {session.user.name}
                                </p>
                                <p className='text-xs text-gray-500'>
                                    Super Admin
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className='flex-1'>{children}</div>
            </div>
        </div>
    );
}
