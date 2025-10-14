// H3 Network Platform Types

export interface VideoData {
    id: string;
    title: string;
    description?: string;
    youtubeId: string;
    youtubeUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    viewCount: number;
    tags: string[];
    topic?: ContentTopic;
    status: ContentStatus;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    creator: CreatorData;
    show?: ShowData;
}

export interface BlogData {
    id: string;
    title: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    viewCount: number;
    tags: string[];
    topic?: ContentTopic;
    status: ContentStatus;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    creator: CreatorData;
}

export interface CreatorData {
    id: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    showName?: string;
    isActive: boolean;
}

export interface ShowData {
    id: string;
    name: string;
    description?: string;
    thumbnailUrl?: string;
    isActive: boolean;
}

export interface UserProgressData {
    id: string;
    contentId: string;
    contentType: ContentType;
    progressSeconds: number;
    completed: boolean;
    lastWatched: Date;
}

export enum UserRole {
    VIEWER = 'VIEWER',
    CREATOR = 'CREATOR',
    ADMIN = 'ADMIN',
    SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum ContentStatus {
    DRAFT = 'DRAFT',
    SCHEDULED = 'SCHEDULED',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}

export enum ContentType {
    VIDEO = 'VIDEO',
    BLOG = 'BLOG',
}

export enum ContentTopic {
    REENTRY = 'REENTRY',
    INCARCERATION = 'INCARCERATION',
    CRIMINAL_JUSTICE = 'CRIMINAL_JUSTICE',
    CRIMINAL_JUSTICE_REFORM = 'CRIMINAL_JUSTICE_REFORM',
    ADDICTION = 'ADDICTION',
    RECOVERY = 'RECOVERY',
    FAMILY = 'FAMILY',
    RELATIONSHIPS = 'RELATIONSHIPS',
    LAW = 'LAW',
    GAME = 'GAME',
    REHABILITATION = 'REHABILITATION',
    NON_PROFIT = 'NON_PROFIT',
    READING = 'READING',
    POLITICS = 'POLITICS',
    GENERAL = 'GENERAL',
}

// Search and filtering types
export interface SearchFilters {
    query?: string;
    contentType?: ContentType | 'all';
    show?: string | 'all';
    topic?: ContentTopic | 'all';
    dateRange?: string | 'all';
    duration?: string | 'all';
    sortBy?: 'relevance' | 'newest' | 'oldest' | 'most_viewed' | 'duration';
}

export interface SearchResults {
    results: (VideoData | BlogData)[];
    total: number;
    page: number;
    totalPages: number;
    hasMore: boolean;
}

// Bulk upload types
export interface BulkUploadItem {
    id: string;
    title: string;
    description?: string;
    youtubeUrl: string;
    tags: string[];
    topic?: ContentTopic;
    scheduledDate?: Date;
    status: 'pending' | 'processing' | 'completed' | 'error';
    error?: string;
}
