'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import {
    ChevronLeft,
    Settings,
    Save,
    RefreshCw,
    Globe,
    Mail,
    Shield,
    BarChart3,
    Share2,
} from 'lucide-react';

interface SettingsData {
    platform: {
        siteName: string;
        siteDescription: string;
        maintenanceMode: boolean;
        registrationEnabled: boolean;
        emailVerificationRequired: boolean;
    };
    content: {
        autoApprovalEnabled: boolean;
        maxVideoFileSize: number;
        maxImageFileSize: number;
        allowedVideoFormats: string[];
        allowedImageFormats: string[];
    };
    email: {
        smtpHost: string;
        smtpPort: string;
        smtpSecure: boolean;
        fromEmail: string;
        fromName: string;
    };
    analytics: {
        googleAnalyticsId: string;
        facebookPixelId: string;
        hotjarId: string;
    };
    social: {
        facebookUrl: string;
        twitterUrl: string;
        instagramUrl: string;
        youtubeUrl: string;
        linkedinUrl: string;
    };
    security: {
        sessionTimeout: number;
        maxLoginAttempts: number;
        lockoutDuration: number;
        passwordMinLength: number;
        requireStrongPasswords: boolean;
    };
}

export default function AdminSettings() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [settings, setSettings] = useState<SettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'loading') return;

        if (!session) {
            router.push('/auth/signin');
            return;
        }

        if (session.user.role !== 'SUPER_ADMIN') {
            router.push('/');
            return;
        }

        fetchSettings();
    }, [session, status, router]);

    const fetchSettings = async () => {
        try {
            setError(null);
            const response = await fetch('/api/admin/settings');
            const data = await response.json();

            if (data.success) {
                setSettings(data.settings);
            } else {
                throw new Error(data.error || 'Failed to fetch settings');
            }
        } catch (error) {
            console.error('Settings fetch error:', error);
            setError('Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        if (!settings) return;

        try {
            setSaving(true);
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });

            const data = await response.json();

            if (data.success) {
                toast({
                    title: 'Settings Saved',
                    description: 'Platform settings have been updated successfully.',
                });
            } else {
                throw new Error(data.error || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Settings save error:', error);
            toast({
                title: 'Error',
                description: 'Failed to save settings. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setSaving(false);
        }
    };

    const updateSettings = (section: keyof SettingsData, field: string, value: string | number | boolean | string[]) => {
        if (!settings) return;
        
        setSettings({
            ...settings,
            [section]: {
                ...settings[section],
                [field]: value,
            },
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
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <Card className='w-96'>
                    <CardContent className='p-6 text-center'>
                        <h2 className='text-xl font-semibold mb-4'>Error Loading Settings</h2>
                        <p className='text-gray-600 mb-4'>{error}</p>
                        <Button onClick={() => window.location.reload()}>
                            Try Again
                        </Button>
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
                            <Settings className='h-8 w-8 text-blue-600' />
                            <div>
                                <h1 className='text-2xl font-bold text-gray-900'>
                                    Platform Settings
                                </h1>
                                <p className='text-sm text-gray-500'>
                                    Configure H3 Network platform settings
                                </p>
                            </div>
                        </div>
                        <div className='flex items-center space-x-3'>
                            <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
                                Super Admin Access
                            </Badge>
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={fetchSettings}
                                disabled={loading}
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <Button
                                size='sm'
                                onClick={handleSaveSettings}
                                disabled={saving}
                            >
                                <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <Tabs defaultValue='platform' className='space-y-6'>
                    <TabsList className='grid w-full grid-cols-6'>
                        <TabsTrigger value='platform'>Platform</TabsTrigger>
                        <TabsTrigger value='content'>Content</TabsTrigger>
                        <TabsTrigger value='email'>Email</TabsTrigger>
                        <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                        <TabsTrigger value='social'>Social</TabsTrigger>
                        <TabsTrigger value='security'>Security</TabsTrigger>
                    </TabsList>

                    <TabsContent value='platform' className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <Globe className='h-5 w-5 mr-2' />
                                    Platform Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='siteName'>Site Name</Label>
                                        <Input
                                            id='siteName'
                                            value={settings?.platform.siteName || ''}
                                            onChange={(e) => updateSettings('platform', 'siteName', e.target.value)}
                                            placeholder='H3 Network Platform'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='siteDescription'>Site Description</Label>
                                        <Textarea
                                            id='siteDescription'
                                            value={settings?.platform.siteDescription || ''}
                                            onChange={(e) => updateSettings('platform', 'siteDescription', e.target.value)}
                                            placeholder='Platform description'
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                
                                <div className='space-y-4'>
                                    <div className='flex items-center justify-between'>
                                        <div className='space-y-0.5'>
                                            <Label>Maintenance Mode</Label>
                                            <p className='text-sm text-gray-500'>
                                                Put the platform in maintenance mode
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings?.platform.maintenanceMode || false}
                                            onCheckedChange={(checked: boolean) => updateSettings('platform', 'maintenanceMode', checked)}
                                        />
                                    </div>
                                    
                                    <div className='flex items-center justify-between'>
                                        <div className='space-y-0.5'>
                                            <Label>Registration Enabled</Label>
                                            <p className='text-sm text-gray-500'>
                                                Allow new user registrations
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings?.platform.registrationEnabled || false}
                                            onCheckedChange={(checked: boolean) => updateSettings('platform', 'registrationEnabled', checked)}
                                        />
                                    </div>
                                    
                                    <div className='flex items-center justify-between'>
                                        <div className='space-y-0.5'>
                                            <Label>Email Verification Required</Label>
                                            <p className='text-sm text-gray-500'>
                                                Require email verification for new accounts
                                            </p>
                                        </div>
                                        <Switch
                                            checked={settings?.platform.emailVerificationRequired || false}
                                            onCheckedChange={(checked: boolean) => updateSettings('platform', 'emailVerificationRequired', checked)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='content' className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle>Content Management</CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='flex items-center justify-between'>
                                    <div className='space-y-0.5'>
                                        <Label>Auto-approval Enabled</Label>
                                        <p className='text-sm text-gray-500'>
                                            Automatically approve new content from trusted creators
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings?.content.autoApprovalEnabled || false}
                                        onCheckedChange={(checked: boolean) => updateSettings('content', 'autoApprovalEnabled', checked)}
                                    />
                                </div>
                                
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='maxVideoFileSize'>Max Video File Size (MB)</Label>
                                        <Input
                                            id='maxVideoFileSize'
                                            type='number'
                                            value={settings?.content.maxVideoFileSize || 0}
                                            onChange={(e) => updateSettings('content', 'maxVideoFileSize', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='maxImageFileSize'>Max Image File Size (MB)</Label>
                                        <Input
                                            id='maxImageFileSize'
                                            type='number'
                                            value={settings?.content.maxImageFileSize || 0}
                                            onChange={(e) => updateSettings('content', 'maxImageFileSize', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='allowedVideoFormats'>Allowed Video Formats</Label>
                                        <Input
                                            id='allowedVideoFormats'
                                            value={settings?.content.allowedVideoFormats.join(', ') || ''}
                                            onChange={(e) => updateSettings('content', 'allowedVideoFormats', e.target.value.split(', '))}
                                            placeholder='mp4, webm, mov'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='allowedImageFormats'>Allowed Image Formats</Label>
                                        <Input
                                            id='allowedImageFormats'
                                            value={settings?.content.allowedImageFormats.join(', ') || ''}
                                            onChange={(e) => updateSettings('content', 'allowedImageFormats', e.target.value.split(', '))}
                                            placeholder='jpg, jpeg, png, webp'
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='email' className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <Mail className='h-5 w-5 mr-2' />
                                    Email Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='smtpHost'>SMTP Host</Label>
                                        <Input
                                            id='smtpHost'
                                            value={settings?.email.smtpHost || ''}
                                            onChange={(e) => updateSettings('email', 'smtpHost', e.target.value)}
                                            placeholder='smtp.gmail.com'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='smtpPort'>SMTP Port</Label>
                                        <Input
                                            id='smtpPort'
                                            value={settings?.email.smtpPort || ''}
                                            onChange={(e) => updateSettings('email', 'smtpPort', e.target.value)}
                                            placeholder='587'
                                        />
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='fromEmail'>From Email</Label>
                                        <Input
                                            id='fromEmail'
                                            type='email'
                                            value={settings?.email.fromEmail || ''}
                                            onChange={(e) => updateSettings('email', 'fromEmail', e.target.value)}
                                            placeholder='noreply@h3network.org'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='fromName'>From Name</Label>
                                        <Input
                                            id='fromName'
                                            value={settings?.email.fromName || ''}
                                            onChange={(e) => updateSettings('email', 'fromName', e.target.value)}
                                            placeholder='H3 Network'
                                        />
                                    </div>
                                </div>
                                
                                <div className='flex items-center justify-between'>
                                    <div className='space-y-0.5'>
                                        <Label>SMTP Secure</Label>
                                        <p className='text-sm text-gray-500'>
                                            Use TLS/SSL for SMTP connection
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings?.email.smtpSecure || false}
                                        onCheckedChange={(checked: boolean) => updateSettings('email', 'smtpSecure', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='analytics' className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <BarChart3 className='h-5 w-5 mr-2' />
                                    Analytics Integration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='space-y-2'>
                                    <Label htmlFor='googleAnalyticsId'>Google Analytics ID</Label>
                                    <Input
                                        id='googleAnalyticsId'
                                        value={settings?.analytics.googleAnalyticsId || ''}
                                        onChange={(e) => updateSettings('analytics', 'googleAnalyticsId', e.target.value)}
                                        placeholder='G-XXXXXXXXXX'
                                    />
                                </div>
                                
                                <div className='space-y-2'>
                                    <Label htmlFor='facebookPixelId'>Facebook Pixel ID</Label>
                                    <Input
                                        id='facebookPixelId'
                                        value={settings?.analytics.facebookPixelId || ''}
                                        onChange={(e) => updateSettings('analytics', 'facebookPixelId', e.target.value)}
                                        placeholder='123456789012345'
                                    />
                                </div>
                                
                                <div className='space-y-2'>
                                    <Label htmlFor='hotjarId'>Hotjar Site ID</Label>
                                    <Input
                                        id='hotjarId'
                                        value={settings?.analytics.hotjarId || ''}
                                        onChange={(e) => updateSettings('analytics', 'hotjarId', e.target.value)}
                                        placeholder='1234567'
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='social' className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <Share2 className='h-5 w-5 mr-2' />
                                    Social Media Links
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='facebookUrl'>Facebook URL</Label>
                                        <Input
                                            id='facebookUrl'
                                            value={settings?.social.facebookUrl || ''}
                                            onChange={(e) => updateSettings('social', 'facebookUrl', e.target.value)}
                                            placeholder='https://facebook.com/h3network'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='twitterUrl'>Twitter URL</Label>
                                        <Input
                                            id='twitterUrl'
                                            value={settings?.social.twitterUrl || ''}
                                            onChange={(e) => updateSettings('social', 'twitterUrl', e.target.value)}
                                            placeholder='https://twitter.com/h3network'
                                        />
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='instagramUrl'>Instagram URL</Label>
                                        <Input
                                            id='instagramUrl'
                                            value={settings?.social.instagramUrl || ''}
                                            onChange={(e) => updateSettings('social', 'instagramUrl', e.target.value)}
                                            placeholder='https://instagram.com/h3network'
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='youtubeUrl'>YouTube URL</Label>
                                        <Input
                                            id='youtubeUrl'
                                            value={settings?.social.youtubeUrl || ''}
                                            onChange={(e) => updateSettings('social', 'youtubeUrl', e.target.value)}
                                            placeholder='https://youtube.com/@h3network'
                                        />
                                    </div>
                                </div>
                                
                                <div className='space-y-2'>
                                    <Label htmlFor='linkedinUrl'>LinkedIn URL</Label>
                                    <Input
                                        id='linkedinUrl'
                                        value={settings?.social.linkedinUrl || ''}
                                        onChange={(e) => updateSettings('social', 'linkedinUrl', e.target.value)}
                                        placeholder='https://linkedin.com/company/h3network'
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value='security' className='space-y-6'>
                        <Card>
                            <CardHeader>
                                <CardTitle className='flex items-center'>
                                    <Shield className='h-5 w-5 mr-2' />
                                    Security Settings
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='sessionTimeout'>Session Timeout (hours)</Label>
                                        <Input
                                            id='sessionTimeout'
                                            type='number'
                                            value={settings?.security.sessionTimeout || 0}
                                            onChange={(e) => updateSettings('security', 'sessionTimeout', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='maxLoginAttempts'>Max Login Attempts</Label>
                                        <Input
                                            id='maxLoginAttempts'
                                            type='number'
                                            value={settings?.security.maxLoginAttempts || 0}
                                            onChange={(e) => updateSettings('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                                
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='lockoutDuration'>Lockout Duration (minutes)</Label>
                                        <Input
                                            id='lockoutDuration'
                                            type='number'
                                            value={settings?.security.lockoutDuration || 0}
                                            onChange={(e) => updateSettings('security', 'lockoutDuration', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label htmlFor='passwordMinLength'>Password Min Length</Label>
                                        <Input
                                            id='passwordMinLength'
                                            type='number'
                                            value={settings?.security.passwordMinLength || 0}
                                            onChange={(e) => updateSettings('security', 'passwordMinLength', parseInt(e.target.value))}
                                        />
                                    </div>
                                </div>
                                
                                <div className='flex items-center justify-between'>
                                    <div className='space-y-0.5'>
                                        <Label>Require Strong Passwords</Label>
                                        <p className='text-sm text-gray-500'>
                                            Enforce strong password requirements
                                        </p>
                                    </div>
                                    <Switch
                                        checked={settings?.security.requireStrongPasswords || false}
                                        onCheckedChange={(checked: boolean) => updateSettings('security', 'requireStrongPasswords', checked)}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}