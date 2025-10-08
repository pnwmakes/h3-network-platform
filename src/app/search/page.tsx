'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchWithAutocomplete } from '@/components/search-with-autocomplete';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { User, Play, Eye, Calendar, Tag } from 'lucide-react';

interface SearchResult {
    query: string;
    type: string;
    filters: {
        topic?: string;
        creator?: string;
        tags?: string[];
        sortBy: string;
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    results: {
        videos: {
            items: Video[];
            count: number;
        };
        creators: {
            items: Creator[];
            count: number;
        };
    };
    suggestions: {
        tags: string[];
    };
}

interface Video {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: number;
    viewCount: number;
    publishedAt?: string;
    topic?: string;
    tags: string[];
    creator: {
        id: string;
        displayName: string;
        avatarUrl?: string;
        bio?: string;
    };
    show?: {
        id: string;
        name: string;
        description?: string;
    };
}

interface Creator {
    id: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    _count: {
        videos: number;
    };
}

export default function SearchPage() {
    const searchParams = useSearchParams();
    const [searchResults, setSearchResults] = useState<SearchResult | null>(
        null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';
    const topic = searchParams.get('topic') || '';
    const creator = searchParams.get('creator') || '';
    const tags = searchParams.get('tags') || '';
    const sortBy = searchParams.get('sortBy') || 'relevance';
    const page = parseInt(searchParams.get('page') || '1');

    // Fetch search results
    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setSearchResults(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                const params = new URLSearchParams({
                    q: query,
                    type,
                    sortBy,
                    page: page.toString(),
                    limit: '20',
                });

                if (topic) params.set('topic', topic);
                if (creator) params.set('creator', creator);
                if (tags) params.set('tags', tags);

                const response = await fetch(
                    `/api/search?${params.toString()}`
                );

                if (!response.ok) {
                    throw new Error('Search failed');
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Search failed');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, type, topic, creator, tags, sortBy, page]);

    const formatDuration = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const formatTopic = (topic: string): string => {
        return topic
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (l) => l.toUpperCase());
    };

    if (!query.trim()) {
        return (
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                <div className='text-center py-12'>
                    <div className='mb-8'>
                        <SearchWithAutocomplete placeholder='Search for videos, creators, and content...' />
                    </div>
                    <h1 className='text-2xl font-bold text-gray-900 mb-4'>
                        Search H3 Network Content
                    </h1>
                    <p className='text-gray-600 max-w-2xl mx-auto'>
                        Find educational content about criminal justice reform,
                        addiction recovery, and reentry support. Search by
                        keywords, creator names, or topics.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            {/* Search Interface */}
            <div className='mb-8'>
                <SearchWithAutocomplete />
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className='text-center py-12'>
                    <div className='w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4'></div>
                    <p className='text-gray-600'>Searching...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-8'>
                    <p className='text-red-800'>Error: {error}</p>
                </div>
            )}

            {/* Search Results */}
            {searchResults && !isLoading && (
                <>
                    {/* Results Summary */}
                    <div className='mb-6'>
                        <h1 className='text-2xl font-bold text-gray-900 mb-2'>
                            Search Results for &quot;{searchResults.query}&quot;
                        </h1>
                        <p className='text-gray-600'>
                            {searchResults.pagination.total} results found
                            {searchResults.filters.topic && (
                                <span>
                                    {' '}
                                    in{' '}
                                    {formatTopic(searchResults.filters.topic)}
                                </span>
                            )}
                            {searchResults.filters.creator && (
                                <span> by {searchResults.filters.creator}</span>
                            )}
                        </p>
                    </div>

                    {/* Tag Suggestions */}
                    {searchResults.suggestions.tags.length > 0 && (
                        <div className='mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200'>
                            <h3 className='text-sm font-medium text-blue-900 mb-2'>
                                Related Tags
                            </h3>
                            <div className='flex flex-wrap gap-2'>
                                {searchResults.suggestions.tags.map(
                                    (tag, index) => (
                                        <Link
                                            key={index}
                                            href={`/search?q=${encodeURIComponent(
                                                query
                                            )}&tags=${encodeURIComponent(tag)}`}
                                            className='inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors'
                                        >
                                            <Tag className='h-3 w-3' />
                                            {tag}
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* No Results */}
                    {searchResults.pagination.total === 0 && (
                        <div className='text-center py-12'>
                            <div className='text-gray-500 text-lg mb-4'>
                                No results found for &quot;{searchResults.query}
                                &quot;
                            </div>
                            <p className='text-gray-600'>
                                Try adjusting your search terms or filters.
                            </p>
                        </div>
                    )}

                    {/* Creators Results */}
                    {searchResults.results.creators.count > 0 && (
                        <div className='mb-8'>
                            <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                                <User className='h-5 w-5' />
                                Creators ({searchResults.results.creators.count}
                                )
                            </h2>
                            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
                                {searchResults.results.creators.items.map(
                                    (creator) => (
                                        <div
                                            key={creator.id}
                                            className='bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-4'
                                        >
                                            <div className='flex items-start space-x-3'>
                                                <div className='flex-shrink-0'>
                                                    {creator.avatarUrl ? (
                                                        <Image
                                                            src={
                                                                creator.avatarUrl
                                                            }
                                                            alt={
                                                                creator.displayName
                                                            }
                                                            width={48}
                                                            height={48}
                                                            className='rounded-full'
                                                        />
                                                    ) : (
                                                        <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                                                            <User className='h-6 w-6 text-gray-400' />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className='flex-1 min-w-0'>
                                                    <h3 className='font-medium text-gray-900 truncate'>
                                                        {creator.displayName}
                                                    </h3>
                                                    {creator.bio && (
                                                        <p className='text-sm text-gray-600 line-clamp-2 mt-1'>
                                                            {creator.bio}
                                                        </p>
                                                    )}
                                                    <p className='text-xs text-gray-500 mt-2'>
                                                        {creator._count.videos}{' '}
                                                        video
                                                        {creator._count
                                                            .videos !== 1
                                                            ? 's'
                                                            : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Videos Results */}
                    {searchResults.results.videos.count > 0 && (
                        <div className='mb-8'>
                            <h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                                <Play className='h-5 w-5' />
                                Videos ({searchResults.results.videos.count})
                            </h2>
                            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                                {searchResults.results.videos.items.map(
                                    (video) => (
                                        <Link
                                            key={video.id}
                                            href={`/videos/${video.id}`}
                                            className='group block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300'
                                        >
                                            <div className='relative aspect-video rounded-t-lg overflow-hidden'>
                                                <Image
                                                    src={
                                                        video.thumbnailUrl ||
                                                        '/placeholder-video.svg'
                                                    }
                                                    alt={video.title}
                                                    fill
                                                    className='object-cover group-hover:scale-105 transition-transform duration-300'
                                                    sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                                                />
                                                {video.duration && (
                                                    <div className='absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded'>
                                                        {formatDuration(
                                                            video.duration
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className='p-4'>
                                                <h3 className='font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors'>
                                                    {video.title}
                                                </h3>

                                                <div className='mt-2 flex items-center text-sm text-gray-600'>
                                                    <span className='font-medium'>
                                                        {
                                                            video.creator
                                                                .displayName
                                                        }
                                                    </span>
                                                    {video.show && (
                                                        <>
                                                            <span className='mx-2'>
                                                                •
                                                            </span>
                                                            <span>
                                                                {
                                                                    video.show
                                                                        .name
                                                                }
                                                            </span>
                                                        </>
                                                    )}
                                                </div>

                                                {video.description && (
                                                    <p className='mt-2 text-sm text-gray-600 line-clamp-3'>
                                                        {video.description}
                                                    </p>
                                                )}

                                                <div className='mt-3 flex items-center justify-between text-xs text-gray-500'>
                                                    <div className='flex items-center space-x-3'>
                                                        <div className='flex items-center gap-1'>
                                                            <Eye className='h-3 w-3' />
                                                            <span>
                                                                {
                                                                    video.viewCount
                                                                }{' '}
                                                                views
                                                            </span>
                                                        </div>
                                                        {video.publishedAt && (
                                                            <div className='flex items-center gap-1'>
                                                                <Calendar className='h-3 w-3' />
                                                                <span>
                                                                    {formatDistanceToNow(
                                                                        new Date(
                                                                            video.publishedAt
                                                                        ),
                                                                        {
                                                                            addSuffix:
                                                                                true,
                                                                        }
                                                                    )}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {video.topic && (
                                                        <span className='bg-gray-100 text-gray-700 px-2 py-1 rounded-full'>
                                                            {formatTopic(
                                                                video.topic
                                                            )}
                                                        </span>
                                                    )}
                                                </div>

                                                {video.tags.length > 0 && (
                                                    <div className='mt-2 flex flex-wrap gap-1'>
                                                        {video.tags
                                                            .slice(0, 3)
                                                            .map(
                                                                (
                                                                    tag,
                                                                    index
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            index
                                                                        }
                                                                        className='inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded'
                                                                    >
                                                                        #{tag}
                                                                    </span>
                                                                )
                                                            )}
                                                        {video.tags.length >
                                                            3 && (
                                                            <span className='text-xs text-gray-500'>
                                                                +
                                                                {video.tags
                                                                    .length -
                                                                    3}{' '}
                                                                more
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {searchResults.pagination.totalPages > 1 && (
                        <div className='flex items-center justify-center space-x-2 mt-8'>
                            {page > 1 && (
                                <Link
                                    href={`/search?${new URLSearchParams({
                                        ...Object.fromEntries(
                                            searchParams.entries()
                                        ),
                                        page: (page - 1).toString(),
                                    }).toString()}`}
                                    className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                                >
                                    Previous
                                </Link>
                            )}

                            <span className='px-3 py-2 text-sm text-gray-700'>
                                Page {page} of{' '}
                                {searchResults.pagination.totalPages}
                            </span>

                            {page < searchResults.pagination.totalPages && (
                                <Link
                                    href={`/search?${new URLSearchParams({
                                        ...Object.fromEntries(
                                            searchParams.entries()
                                        ),
                                        page: (page + 1).toString(),
                                    }).toString()}`}
                                    className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                                >
                                    Next
                                </Link>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
