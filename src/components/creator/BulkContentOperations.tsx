'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CheckSquare,
    Square,
    Video,
    FileText,
    MoreHorizontal,

    Tag,
    Trash2,
    Archive,
    Eye,
    EyeOff,
    Copy,
    Download,
    Search,
    RefreshCw,
    Zap,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
} from 'lucide-react';

interface ContentItem {
    id: string;
    title: string;
    type: 'video' | 'blog';
    status: 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
    publishedAt?: string;
    createdAt: string;
    views: number;
    likes: number;
    tags: string[];
    thumbnailUrl?: string;
    featuredImage?: string;
    description?: string;
    excerpt?: string;
    youtubeUrl?: string;
    readTime?: number;
    duration?: number;
    engagement: number;
}

interface BulkAction {
    id: string;
    label: string;
    icon: React.ReactNode;
    color: string;
    requiresConfirmation?: boolean;
    confirmTitle?: string;
    confirmDescription?: string;
}

export function BulkContentOperations() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');

    const [showBulkEdit, setShowBulkEdit] = useState(false);
    const [bulkEditData, setBulkEditData] = useState({
        tags: '',
        status: '',
        addTags: true,
    });

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/creator/content/bulk', {
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setContent(data.content || getMockContent());
            } else {
                console.error('Failed to fetch content');
                setContent(getMockContent());
            }
        } catch (error) {
            console.error('Content fetch error:', error);
            setContent(getMockContent());
        } finally {
            setLoading(false);
        }
    };

    const filteredContent = content.filter((item) => {
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        
        return matchesSearch && matchesStatus && matchesType;
    });

    const handleSelectAll = () => {
        if (selectedItems.size === filteredContent.length) {
            setSelectedItems(new Set());
        } else {
            setSelectedItems(new Set(filteredContent.map(item => item.id)));
        }
    };

    const handleSelectItem = (itemId: string) => {
        const newSelected = new Set(selectedItems);
        if (newSelected.has(itemId)) {
            newSelected.delete(itemId);
        } else {
            newSelected.add(itemId);
        }
        setSelectedItems(newSelected);
    };

    const bulkActions: BulkAction[] = [
        {
            id: 'publish',
            label: 'Publish Selected',
            icon: <Eye className="h-4 w-4" />,
            color: 'bg-green-500 hover:bg-green-600',
            requiresConfirmation: true,
            confirmTitle: 'Publish Content',
            confirmDescription: 'Are you sure you want to publish the selected content items?',
        },
        {
            id: 'unpublish',
            label: 'Unpublish Selected',
            icon: <EyeOff className="h-4 w-4" />,
            color: 'bg-yellow-500 hover:bg-yellow-600',
            requiresConfirmation: true,
            confirmTitle: 'Unpublish Content',
            confirmDescription: 'Are you sure you want to unpublish the selected content items?',
        },
        {
            id: 'archive',
            label: 'Archive Selected',
            icon: <Archive className="h-4 w-4" />,
            color: 'bg-gray-500 hover:bg-gray-600',
            requiresConfirmation: true,
            confirmTitle: 'Archive Content',
            confirmDescription: 'Archived content will be hidden from public view but preserved in your dashboard.',
        },
        {
            id: 'delete',
            label: 'Delete Selected',
            icon: <Trash2 className="h-4 w-4" />,
            color: 'bg-red-500 hover:bg-red-600',
            requiresConfirmation: true,
            confirmTitle: 'Delete Content',
            confirmDescription: 'This action cannot be undone. Are you sure you want to permanently delete the selected items?',
        },
    ];

    const executeBulkAction = async (actionId: string) => {
        if (selectedItems.size === 0) return;

        setProcessing(true);
        try {
            const response = await fetch('/api/creator/content/bulk-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: actionId,
                    contentIds: Array.from(selectedItems),
                }),
            });

            if (response.ok) {
                await fetchContent();
                setSelectedItems(new Set());
            } else {
                console.error('Bulk action failed');
            }
        } catch (error) {
            console.error('Bulk action error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const handleBulkEdit = async () => {
        if (selectedItems.size === 0) return;

        setProcessing(true);
        try {
            const response = await fetch('/api/creator/content/bulk-edit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contentIds: Array.from(selectedItems),
                    updates: bulkEditData,
                }),
            });

            if (response.ok) {
                await fetchContent();
                setSelectedItems(new Set());
                setShowBulkEdit(false);
                setBulkEditData({ tags: '', status: '', addTags: true });
            } else {
                console.error('Bulk edit failed');
            }
        } catch (error) {
            console.error('Bulk edit error:', error);
        } finally {
            setProcessing(false);
        }
    };

    const exportSelected = () => {
        const selectedContent = content.filter(item => selectedItems.has(item.id));
        const exportData = {
            exportedAt: new Date().toISOString(),
            contentCount: selectedContent.length,
            content: selectedContent,
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `content-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'PENDING':
                return <Clock className="h-4 w-4 text-yellow-500" />;
            case 'DRAFT':
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
            case 'REJECTED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'ARCHIVED':
                return <Archive className="h-4 w-4 text-gray-400" />;
            default:
                return <AlertCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return 'bg-green-100 text-green-800';
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'DRAFT':
                return 'bg-gray-100 text-gray-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'ARCHIVED':
                return 'bg-gray-100 text-gray-600';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Bulk Content Operations</h2>
                    <p className="text-gray-600">Manage multiple content items efficiently</p>
                </div>
                
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={fetchContent}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search content by title or tags..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="PUBLISHED">Published</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="DRAFT">Draft</SelectItem>
                                <SelectItem value="REJECTED">Rejected</SelectItem>
                                <SelectItem value="ARCHIVED">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="video">Videos</SelectItem>
                                <SelectItem value="blog">Blogs</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Bulk Actions Bar */}
            {selectedItems.size > 0 && (
                <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Zap className="h-5 w-5 text-blue-600" />
                                <span className="font-medium text-blue-900">
                                    {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                                </span>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                                {bulkActions.map((action) => (
                                    <BulkActionButton
                                        key={action.id}
                                        action={action}
                                        onExecute={executeBulkAction}
                                        disabled={processing}
                                    />
                                ))}
                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowBulkEdit(true)}
                                    disabled={processing}
                                >
                                    <Tag className="h-4 w-4 mr-2" />
                                    Edit Tags
                                </Button>
                                

                                
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportSelected}
                                    disabled={processing}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Content List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Content Items ({filteredContent.length})</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                            >
                                {selectedItems.size === filteredContent.length ? (
                                    <CheckSquare className="h-4 w-4 mr-2" />
                                ) : (
                                    <Square className="h-4 w-4 mr-2" />
                                )}
                                Select All
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredContent.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No content found
                            </h3>
                            <p className="text-gray-600">
                                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                                    ? 'Try adjusting your filters or search query.'
                                    : 'Create your first piece of content to get started.'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredContent.map((item) => (
                                <ContentItemRow
                                    key={item.id}
                                    item={item}
                                    isSelected={selectedItems.has(item.id)}
                                    onSelect={() => handleSelectItem(item.id)}
                                    statusIcon={getStatusIcon(item.status)}
                                    statusColor={getStatusColor(item.status)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Bulk Edit Modal */}
            <Dialog open={showBulkEdit} onOpenChange={setShowBulkEdit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bulk Edit Content</DialogTitle>
                        <DialogDescription>
                            Edit tags and status for {selectedItems.size} selected items
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="tags">Tags</Label>
                            <Input
                                id="tags"
                                placeholder="Enter tags separated by commas"
                                value={bulkEditData.tags}
                                onChange={(e) => setBulkEditData({ ...bulkEditData, tags: e.target.value })}
                            />
                            <div className="flex items-center space-x-2 mt-2">
                                <Checkbox
                                    id="addTags"
                                    checked={bulkEditData.addTags}
                                    onCheckedChange={(checked) => 
                                        setBulkEditData({ ...bulkEditData, addTags: !!checked })
                                    }
                                />
                                <Label htmlFor="addTags" className="text-sm">
                                    Add to existing tags (unchecked = replace existing tags)
                                </Label>
                            </div>
                        </div>
                        
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <Select 
                                value={bulkEditData.status} 
                                onValueChange={(value) => setBulkEditData({ ...bulkEditData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">No change</SelectItem>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="PENDING">Pending Review</SelectItem>
                                    <SelectItem value="PUBLISHED">Published</SelectItem>
                                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowBulkEdit(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkEdit} disabled={processing}>
                            {processing ? 'Updating...' : 'Update Selected'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

interface ContentItemRowProps {
    item: ContentItem;
    isSelected: boolean;
    onSelect: () => void;
    statusIcon: React.ReactNode;
    statusColor: string;
}

function ContentItemRow({ item, isSelected, onSelect, statusIcon, statusColor }: ContentItemRowProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className={`flex items-center gap-4 p-4 border rounded-lg transition-colors ${
            isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
        }`}>
            {/* Checkbox */}
            <Checkbox checked={isSelected} onCheckedChange={onSelect} />
            
            {/* Thumbnail/Icon */}
            <div className="flex-shrink-0">
                {item.type === 'video' ? (
                    <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                        {item.thumbnailUrl ? (
                            <Image 
                                src={item.thumbnailUrl} 
                                alt={item.title}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <Video className="h-6 w-6 text-gray-400" />
                        )}
                    </div>
                ) : (
                    <div className="w-16 h-12 bg-green-100 rounded flex items-center justify-center">
                        <FileText className="h-6 w-6 text-green-600" />
                    </div>
                )}
            </div>
            
            {/* Content Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">
                        {item.title}
                    </h4>
                    <Badge className={statusColor}>
                        {statusIcon}
                        <span className="ml-1">{item.status}</span>
                    </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                        {item.type === 'video' ? <Video className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                        {item.type}
                    </span>
                    <span>{formatNumber(item.views)} views</span>
                    <span>{formatNumber(item.likes)} likes</span>
                    <span>{item.engagement.toFixed(1)}% engagement</span>
                    <span>Created {formatDate(item.createdAt)}</span>
                </div>
                
                {item.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                        {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                        {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                                +{item.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </div>
            
            {/* Actions */}
            <div className="flex-shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

interface BulkActionButtonProps {
    action: BulkAction;
    onExecute: (actionId: string) => void;
    disabled: boolean;
}

function BulkActionButton({ action, onExecute, disabled }: BulkActionButtonProps) {
    if (action.requiresConfirmation) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <Button
                        size="sm"
                        className={action.color}
                        disabled={disabled}
                    >
                        {action.icon}
                        <span className="ml-2 hidden sm:inline">{action.label}</span>
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{action.confirmTitle}</DialogTitle>
                        <DialogDescription>
                            {action.confirmDescription}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button
                            className={action.color}
                            onClick={() => onExecute(action.id)}
                            disabled={disabled}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Button
            size="sm"
            className={action.color}
            onClick={() => onExecute(action.id)}
            disabled={disabled}
        >
            {action.icon}
            <span className="ml-2 hidden sm:inline">{action.label}</span>
        </Button>
    );
}

// Mock data for development
function getMockContent(): ContentItem[] {
    return [
        {
            id: '1',
            title: 'Finding Hope After Prison: My Journey to Recovery',
            type: 'video',
            status: 'PUBLISHED',
            publishedAt: '2024-01-15T10:00:00Z',
            createdAt: '2024-01-10T10:00:00Z',
            views: 15420,
            likes: 890,
            tags: ['recovery', 'hope', 'prison', 'transformation'],
            thumbnailUrl: '/api/placeholder/320/180',
            youtubeUrl: 'https://youtube.com/watch?v=abc123',
            engagement: 8.5,
        },
        {
            id: '2',
            title: 'The Power of Community in Recovery',
            type: 'blog',
            status: 'PENDING',
            createdAt: '2024-01-12T09:00:00Z',
            views: 4320,
            likes: 234,
            tags: ['community', 'recovery', 'support'],
            featuredImage: '/api/placeholder/400/200',
            readTime: 5,
            engagement: 7.1,
        },
        {
            id: '3',
            title: 'Reentry Resources: What I Wish I Knew',
            type: 'video',
            status: 'DRAFT',
            createdAt: '2024-01-08T14:00:00Z',
            views: 0,
            likes: 0,
            tags: ['reentry', 'resources', 'tips'],
            engagement: 0,
        },
        {
            id: '4',
            title: 'Building Better Relationships After Incarceration',
            type: 'blog',
            status: 'PUBLISHED',
            publishedAt: '2024-01-05T16:00:00Z',
            createdAt: '2024-01-02T16:00:00Z',
            views: 7890,
            likes: 456,
            tags: ['relationships', 'family', 'communication', 'healing'],
            featuredImage: '/api/placeholder/400/200',
            readTime: 8,
            engagement: 6.8,
        },
        {
            id: '5',
            title: 'Mental Health and Justice Reform',
            type: 'video',
            status: 'REJECTED',
            createdAt: '2024-01-01T11:00:00Z',
            views: 120,
            likes: 8,
            tags: ['mental health', 'justice reform', 'advocacy'],
            engagement: 2.1,
        },
    ];
}