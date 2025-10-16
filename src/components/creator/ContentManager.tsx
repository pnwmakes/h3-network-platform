'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Video,
    FileText,
    Search,
    Edit,
    Trash2,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    TrendingUp,
    RefreshCw,
} from 'lucide-react';

interface ContentItem {
    id: string;
    title: string;
    description?: string;
    content?: string;
    excerpt?: string;
    status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED';
    topic: string;
    tags: string[];
    contentTopics: string[];
    viewCount: number;
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    youtubeUrl?: string;
    youtubeId?: string;
    thumbnailUrl?: string;
    featuredImage?: string;
    readTime?: number;
    showName?: string;
    seasonNumber?: number;
    episodeNumber?: number;
    creator: {
        displayName: string;
    };
}

interface ContentManagerProps {
    onCreateNew: (type: 'video' | 'blog') => void;
}

export function ContentManager({ onCreateNew }: ContentManagerProps) {
    const router = useRouter();
    const [videos, setVideos] = useState<ContentItem[]>([]);
    const [blogs, setBlogs] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchContent();

        // Auto-refresh when window gains focus (user switches back to tab)
        const handleFocus = () => {
            if (!document.hidden) {
                fetchContent();
            }
        };

        // Auto-refresh every 30 seconds if tab is visible
        const interval = setInterval(() => {
            if (!document.hidden) {
                fetchContent();
            }
        }, 30000);

        window.addEventListener('focus', handleFocus);
        document.addEventListener('visibilitychange', handleFocus);

        return () => {
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleFocus);
            clearInterval(interval);
        };
    }, []);

    const fetchContent = async (isManualRefresh = false) => {
        try {
            if (isManualRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const [videosResponse, blogsResponse] = await Promise.all([
                fetch('/api/creator/videos', {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                }),
                fetch('/api/creator/blogs', {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                }),
            ]);

            const videosData = await videosResponse.json();
            const blogsData = await blogsResponse.json();

            if (videosData.success) {
                setVideos(videosData.videos);
            }

            if (blogsData.success) {
                setBlogs(blogsData.blogs);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleDelete = async (item: ContentItem, type: 'video' | 'blog') => {
        try {
            const endpoint =
                type === 'video'
                    ? `/api/creator/videos/${item.id}`
                    : `/api/creator/blogs/${item.id}`;

            const response = await fetch(endpoint, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (result.success) {
                // Remove from local state
                if (type === 'video') {
                    setVideos((prev) => prev.filter((v) => v.id !== item.id));
                } else {
                    setBlogs((prev) => prev.filter((b) => b.id !== item.id));
                }
            } else {
                alert('Failed to delete content: ' + result.error);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete content');
        }
    };

    const handleEdit = (item: ContentItem, type: 'video' | 'blog') => {
        if (type === 'video') {
            router.push(`/creator/upload/video?edit=${item.id}`);
        } else {
            router.push(`/creator/upload/blog?edit=${item.id}`);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <Clock className='h-4 w-4 text-yellow-500' />;
            case 'PENDING':
                return <AlertCircle className='h-4 w-4 text-blue-500' />;
            case 'PUBLISHED':
                return <CheckCircle className='h-4 w-4 text-green-500' />;
            case 'REJECTED':
                return <XCircle className='h-4 w-4 text-red-500' />;
            default:
                return <Clock className='h-4 w-4 text-gray-500' />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'PENDING':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'PUBLISHED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const filterContent = (
        content: ContentItem[],
        search: string,
        status: string
    ) => {
        return content.filter((item) => {
            const matchesSearch = search
                ? item.title.toLowerCase().includes(search.toLowerCase()) ||
                  item.description
                      ?.toLowerCase()
                      .includes(search.toLowerCase()) ||
                  item.tags.some((tag) =>
                      tag.toLowerCase().includes(search.toLowerCase())
                  )
                : true;

            const matchesStatus = status === 'all' || item.status === status;

            return matchesSearch && matchesStatus;
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredVideos = filterContent(videos, searchTerm, statusFilter);
    const filteredBlogs = filterContent(blogs, searchTerm, statusFilter);

    const allContent = [...videos, ...blogs].sort(
        (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const filteredAllContent = filterContent(
        allContent,
        searchTerm,
        statusFilter
    );

    const stats = {
        total: videos.length + blogs.length,
        videos: videos.length,
        blogs: blogs.length,
        published: allContent.filter((item) => item.status === 'PUBLISHED')
            .length,
        pending: allContent.filter((item) => item.status === 'PENDING').length,
        totalViews: allContent.reduce((sum, item) => sum + item.viewCount, 0),
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center py-12'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            {/* Stats Overview */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <Card>
                    <CardContent className='p-6'>
                        <div className='flex items-center'>
                            <div className='p-2 bg-blue-100 rounded-lg'>
                                <FileText className='h-6 w-6 text-blue-600' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-sm font-medium text-gray-600'>
                                    Total Content
                                </p>
                                <p className='text-2xl font-bold'>
                                    {stats.total}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='p-6'>
                        <div className='flex items-center'>
                            <div className='p-2 bg-green-100 rounded-lg'>
                                <CheckCircle className='h-6 w-6 text-green-600' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-sm font-medium text-gray-600'>
                                    Published
                                </p>
                                <p className='text-2xl font-bold'>
                                    {stats.published}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='p-6'>
                        <div className='flex items-center'>
                            <div className='p-2 bg-yellow-100 rounded-lg'>
                                <Clock className='h-6 w-6 text-yellow-600' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-sm font-medium text-gray-600'>
                                    Pending Review
                                </p>
                                <p className='text-2xl font-bold'>
                                    {stats.pending}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className='p-6'>
                        <div className='flex items-center'>
                            <div className='p-2 bg-purple-100 rounded-lg'>
                                <TrendingUp className='h-6 w-6 text-purple-600' />
                            </div>
                            <div className='ml-4'>
                                <p className='text-sm font-medium text-gray-600'>
                                    Total Views
                                </p>
                                <p className='text-2xl font-bold'>
                                    {stats.totalViews.toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions and Filters */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                <div className='flex flex-col sm:flex-row gap-4'>
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                        <Input
                            placeholder='Search content...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='pl-10 w-full sm:w-64'
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className='border border-gray-300 rounded-md px-3 py-2 bg-white'
                    >
                        <option value='all'>All Status</option>
                        <option value='DRAFT'>Draft</option>
                        <option value='PENDING'>Pending</option>
                        <option value='PUBLISHED'>Published</option>
                        <option value='REJECTED'>Rejected</option>
                    </select>
                </div>

                <div className='flex gap-2'>
                    <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => fetchContent(true)}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                    <Button
                        variant='outline'
                        onClick={() => onCreateNew('video')}
                    >
                        <Video className='h-4 w-4 mr-2' />
                        New Video
                    </Button>
                    <Button onClick={() => onCreateNew('blog')}>
                        <FileText className='h-4 w-4 mr-2' />
                        New Blog
                    </Button>
                </div>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue='all' className='w-full'>
                <TabsList>
                    <TabsTrigger value='all'>
                        All ({filteredAllContent.length})
                    </TabsTrigger>
                    <TabsTrigger value='videos'>
                        Videos ({filteredVideos.length})
                    </TabsTrigger>
                    <TabsTrigger value='blogs'>
                        Blogs ({filteredBlogs.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value='all' className='mt-6'>
                    <ContentList
                        items={filteredAllContent}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                        formatDate={formatDate}
                    />
                </TabsContent>

                <TabsContent value='videos' className='mt-6'>
                    <ContentList
                        items={filteredVideos}
                        type='video'
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                        formatDate={formatDate}
                    />
                </TabsContent>

                <TabsContent value='blogs' className='mt-6'>
                    <ContentList
                        items={filteredBlogs}
                        type='blog'
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        getStatusIcon={getStatusIcon}
                        getStatusColor={getStatusColor}
                        formatDate={formatDate}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}

interface ContentListProps {
    items: ContentItem[];
    type?: 'video' | 'blog';
    onEdit: (item: ContentItem, type: 'video' | 'blog') => void;
    onDelete: (item: ContentItem, type: 'video' | 'blog') => void;
    getStatusIcon: (status: string) => React.ReactElement;
    getStatusColor: (status: string) => string;
    formatDate: (date: string) => string;
}

function ContentList({
    items,
    type,
    onEdit,
    onDelete,
    getStatusIcon,
    getStatusColor,
    formatDate,
}: ContentListProps) {
    if (items.length === 0) {
        return (
            <Card>
                <CardContent className='p-12 text-center'>
                    <FileText className='h-16 w-16 text-gray-300 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        No content found
                    </h3>
                    <p className='text-gray-600'>
                        {type === 'video'
                            ? 'Create your first video to get started.'
                            : type === 'blog'
                            ? 'Write your first blog post to get started.'
                            : 'Create your first piece of content to get started.'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className='space-y-4'>
            {items.map((item) => {
                const itemType = 'youtubeUrl' in item ? 'video' : 'blog';

                return (
                    <Card key={item.id} className='overflow-hidden'>
                        <CardContent className='p-6'>
                            <div className='flex items-start justify-between'>
                                <div className='flex items-start space-x-4 flex-1'>
                                    <div className='flex-shrink-0'>
                                        {itemType === 'video' ? (
                                            <div className='w-16 h-12 bg-gray-200 rounded overflow-hidden relative'>
                                                {item.thumbnailUrl && (
                                                    <Image
                                                        src={item.thumbnailUrl}
                                                        alt={item.title}
                                                        fill
                                                        className='object-cover'
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <div className='w-16 h-12 bg-green-100 rounded flex items-center justify-center'>
                                                <FileText className='h-6 w-6 text-green-600' />
                                            </div>
                                        )}
                                    </div>

                                    <div className='flex-1 min-w-0'>
                                        <div className='flex items-center gap-2 mb-1'>
                                            <h3 className='text-lg font-semibold text-gray-900 truncate'>
                                                {item.title}
                                            </h3>
                                            {getStatusIcon(item.status)}
                                        </div>

                                        <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                                            {item.description || item.excerpt}
                                        </p>

                                        <div className='flex items-center space-x-4 text-sm text-gray-500'>
                                            <span className='flex items-center'>
                                                <Calendar className='h-4 w-4 mr-1' />
                                                {formatDate(item.updatedAt)}
                                            </span>
                                            <span className='flex items-center'>
                                                <Eye className='h-4 w-4 mr-1' />
                                                {item.viewCount} views
                                            </span>
                                            {item.showName && (
                                                <span>{item.showName}</span>
                                            )}
                                            {item.readTime && (
                                                <span>
                                                    {item.readTime} min read
                                                </span>
                                            )}
                                        </div>

                                        {item.tags.length > 0 && (
                                            <div className='flex items-center space-x-1 mt-2'>
                                                {item.tags
                                                    .slice(0, 3)
                                                    .map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant='outline'
                                                            className='text-xs'
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                {item.tags.length > 3 && (
                                                    <Badge
                                                        variant='outline'
                                                        className='text-xs'
                                                    >
                                                        +{item.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className='flex items-center space-x-2 ml-4'>
                                    <Badge
                                        variant='outline'
                                        className={getStatusColor(item.status)}
                                    >
                                        {item.status}
                                    </Badge>

                                    <div className='flex space-x-1'>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                                onEdit(item, itemType)
                                            }
                                        >
                                            <Edit className='h-4 w-4' />
                                        </Button>
                                        <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        `Delete "${item.title}"? This cannot be undone.`
                                                    )
                                                ) {
                                                    onDelete(item, itemType);
                                                }
                                            }}
                                            className='text-red-600 hover:text-red-700'
                                        >
                                            <Trash2 className='h-4 w-4' />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
