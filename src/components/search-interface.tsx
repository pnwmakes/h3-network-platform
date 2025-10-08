'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';

interface SearchProps {
    onSearch?: (query: string, filters: SearchFilters) => void;
    placeholder?: string;
    showFilters?: boolean;
}

interface SearchFilters {
    type: 'all' | 'videos' | 'creators' | 'blogs';
    topic?: string;
    creator?: string;
    tags?: string;
    sortBy: 'relevance' | 'date' | 'views' | 'duration';
}

const TOPIC_OPTIONS = [
    { value: 'REENTRY', label: 'Reentry Support' },
    { value: 'ADDICTION', label: 'Addiction Recovery' },
    { value: 'INCARCERATION', label: 'Incarceration' },
    { value: 'CRIMINAL_JUSTICE_REFORM', label: 'Criminal Justice Reform' },
    { value: 'GENERAL', label: 'General' },
];

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'date', label: 'Newest First' },
    { value: 'views', label: 'Most Viewed' },
    { value: 'duration', label: 'Shortest First' },
];

export function SearchInterface({
    onSearch,
    placeholder = 'Search videos, creators, and content...',
    showFilters = true,
}: SearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [filters, setFilters] = useState<SearchFilters>({
        type: (searchParams.get('type') as SearchFilters['type']) || 'all',
        topic: searchParams.get('topic') || '',
        creator: searchParams.get('creator') || '',
        tags: searchParams.get('tags') || '',
        sortBy:
            (searchParams.get('sortBy') as SearchFilters['sortBy']) ||
            'relevance',
    });

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Handle search submission
    const handleSearch = (
        searchQuery?: string,
        searchFilters?: SearchFilters
    ) => {
        const finalQuery = searchQuery ?? query;
        const finalFilters = searchFilters ?? filters;

        if (finalQuery.trim().length < 1) {
            return;
        }

        // Clear any pending searches
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // If onSearch callback is provided, use it
        if (onSearch) {
            onSearch(finalQuery, finalFilters);
            return;
        }

        // Otherwise, navigate to search results page
        const params = new URLSearchParams();
        params.set('q', finalQuery);

        if (finalFilters.type !== 'all') params.set('type', finalFilters.type);
        if (finalFilters.topic) params.set('topic', finalFilters.topic);
        if (finalFilters.creator) params.set('creator', finalFilters.creator);
        if (finalFilters.tags) params.set('tags', finalFilters.tags);
        if (finalFilters.sortBy !== 'relevance')
            params.set('sortBy', finalFilters.sortBy);

        router.push(`/search?${params.toString()}`);
    };

    // Handle input change with debouncing
    const handleInputChange = (value: string) => {
        setQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (value.trim().length >= 2) {
            searchTimeoutRef.current = setTimeout(() => {
                handleSearch(value, filters);
            }, 500);
        }
    };

    // Handle filter changes
    const updateFilter = (key: keyof SearchFilters, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);

        if (query.trim().length >= 1) {
            handleSearch(query, newFilters);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        const defaultFilters: SearchFilters = {
            type: 'all',
            topic: '',
            creator: '',
            tags: '',
            sortBy: 'relevance',
        };
        setFilters(defaultFilters);

        if (query.trim().length >= 1) {
            handleSearch(query, defaultFilters);
        }
    };

    // Check if any filters are active
    const hasActiveFilters =
        filters.type !== 'all' ||
        filters.topic ||
        filters.creator ||
        filters.tags ||
        filters.sortBy !== 'relevance';

    return (
        <div className='w-full max-w-4xl'>
            {/* Main Search Bar */}
            <div className='relative'>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                    <input
                        type='text'
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch();
                            }
                        }}
                        placeholder={placeholder}
                        className='w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg'
                    />
                    {showFilters && (
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                                showAdvanced || hasActiveFilters
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <Filter className='h-5 w-5' />
                        </button>
                    )}
                </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && showAdvanced && (
                <div className='mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-sm font-medium text-gray-900'>
                            Advanced Filters
                        </h3>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className='text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1'
                            >
                                <X className='h-4 w-4' />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                        {/* Content Type */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Content Type
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) =>
                                    updateFilter('type', e.target.value)
                                }
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            >
                                <option value='all'>All Content</option>
                                <option value='videos'>Videos Only</option>
                                <option value='creators'>Creators Only</option>
                                <option value='blogs'>Blogs Only</option>
                            </select>
                        </div>

                        {/* Topic */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Topic
                            </label>
                            <select
                                value={filters.topic}
                                onChange={(e) =>
                                    updateFilter('topic', e.target.value)
                                }
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            >
                                <option value=''>All Topics</option>
                                {TOPIC_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Creator */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Creator
                            </label>
                            <input
                                type='text'
                                value={filters.creator}
                                onChange={(e) =>
                                    updateFilter('creator', e.target.value)
                                }
                                placeholder='Search by creator...'
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            />
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) =>
                                    updateFilter('sortBy', e.target.value)
                                }
                                className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tags Input */}
                    <div className='mt-4'>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                            Tags (comma-separated)
                        </label>
                        <input
                            type='text'
                            value={filters.tags}
                            onChange={(e) =>
                                updateFilter('tags', e.target.value)
                            }
                            placeholder='e.g. recovery, education, support'
                            className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && !showAdvanced && (
                <div className='mt-2 flex flex-wrap gap-2'>
                    {filters.type !== 'all' && (
                        <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                            Type: {filters.type}
                            <button
                                onClick={() => updateFilter('type', 'all')}
                                className='text-blue-600 hover:text-blue-800'
                            >
                                <X className='h-3 w-3' />
                            </button>
                        </span>
                    )}
                    {filters.topic && (
                        <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                            Topic:{' '}
                            {
                                TOPIC_OPTIONS.find(
                                    (t) => t.value === filters.topic
                                )?.label
                            }
                            <button
                                onClick={() => updateFilter('topic', '')}
                                className='text-blue-600 hover:text-blue-800'
                            >
                                <X className='h-3 w-3' />
                            </button>
                        </span>
                    )}
                    {filters.creator && (
                        <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                            Creator: {filters.creator}
                            <button
                                onClick={() => updateFilter('creator', '')}
                                className='text-blue-600 hover:text-blue-800'
                            >
                                <X className='h-3 w-3' />
                            </button>
                        </span>
                    )}
                    {filters.sortBy !== 'relevance' && (
                        <span className='inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
                            Sort:{' '}
                            {
                                SORT_OPTIONS.find(
                                    (s) => s.value === filters.sortBy
                                )?.label
                            }
                            <button
                                onClick={() =>
                                    updateFilter('sortBy', 'relevance')
                                }
                                className='text-blue-600 hover:text-blue-800'
                            >
                                <X className='h-3 w-3' />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
