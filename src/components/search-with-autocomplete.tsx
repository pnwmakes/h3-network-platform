'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter, X, Play, User, Hash, ArrowRight } from 'lucide-react';
import Image from 'next/image';

interface SearchWithAutocompleteProps {
    onSearch?: (query: string, filters: SearchFilters) => void;
    placeholder?: string;
    showFilters?: boolean;
    compact?: boolean;
}

interface SearchFilters {
    type: 'all' | 'videos' | 'creators' | 'blogs';
    topic?: string;
    creator?: string;
    tags?: string;
    sortBy: 'relevance' | 'date' | 'views' | 'duration';
}

interface Suggestion {
    id: string;
    title: string;
    type: 'video' | 'creator' | 'tag' | 'search';
    subtitle?: string;
    thumbnailUrl?: string;
    avatarUrl?: string;
    url: string;
}

interface SuggestionsResponse {
    query: string;
    videos: Suggestion[];
    creators: Suggestion[];
    tags: Suggestion[];
    quickSearches: Suggestion[];
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

export function SearchWithAutocomplete({
    onSearch,
    placeholder = 'Search videos, creators, and content...',
    showFilters = true,
    compact = false,
}: SearchWithAutocompleteProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<SuggestionsResponse | null>(
        null
    );
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

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
    const suggestionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    // Fetch suggestions
    const fetchSuggestions = async (searchQuery: string) => {
        if (searchQuery.trim().length < 2) {
            setSuggestions(null);
            return;
        }

        setIsLoadingSuggestions(true);

        try {
            const response = await fetch(
                `/api/search/suggestions?q=${encodeURIComponent(
                    searchQuery
                )}&limit=8`
            );
            if (response.ok) {
                const data = await response.json();
                setSuggestions(data);
            }
        } catch (error) {
            console.error('Failed to fetch suggestions:', error);
        } finally {
            setIsLoadingSuggestions(false);
        }
    };

    // Handle search submission
    const handleSearch = (
        searchQuery?: string,
        searchFilters?: SearchFilters
    ) => {
        const finalQuery = searchQuery ?? query;
        const finalFilters = searchFilters ?? filters;

        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);

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
        setSelectedSuggestionIndex(-1);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }
        if (suggestionTimeoutRef.current) {
            clearTimeout(suggestionTimeoutRef.current);
        }

        if (value.trim().length >= 2) {
            setShowSuggestions(true);
            suggestionTimeoutRef.current = setTimeout(() => {
                fetchSuggestions(value);
            }, 300);
        } else {
            setShowSuggestions(false);
            setSuggestions(null);
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || !suggestions) return;

        const allSuggestions = [
            ...suggestions.quickSearches,
            ...suggestions.videos,
            ...suggestions.creators,
            ...suggestions.tags,
        ];

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedSuggestionIndex((prev) =>
                    prev < allSuggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedSuggestionIndex((prev) =>
                    prev > -1 ? prev - 1 : -1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                    const selectedSuggestion =
                        allSuggestions[selectedSuggestionIndex];
                    router.push(selectedSuggestion.url);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion: Suggestion) => {
        if (suggestion.type === 'search') {
            handleSearch(
                suggestion.title.replace('Search for "', '').replace('"', '')
            );
        } else {
            router.push(suggestion.url);
        }
        setShowSuggestions(false);
    };

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                suggestionsRef.current &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
                setSelectedSuggestionIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

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

    // Get icon for suggestion type
    const getSuggestionIcon = (type: string) => {
        switch (type) {
            case 'video':
                return <Play className='h-4 w-4 text-red-500' />;
            case 'creator':
                return <User className='h-4 w-4 text-blue-500' />;
            case 'tag':
                return <Hash className='h-4 w-4 text-green-500' />;
            case 'search':
                return <Search className='h-4 w-4 text-gray-500' />;
            default:
                return <Search className='h-4 w-4 text-gray-500' />;
        }
    };

    // Render suggestion item
    const renderSuggestion = (suggestion: Suggestion, index: number) => {
        const isSelected = index === selectedSuggestionIndex;

        return (
            <button
                key={`${suggestion.type}-${suggestion.id}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                }`}
            >
                {/* Icon or Thumbnail */}
                <div className='flex-shrink-0'>
                    {suggestion.thumbnailUrl ? (
                        <Image
                            src={suggestion.thumbnailUrl}
                            alt={suggestion.title}
                            width={40}
                            height={30}
                            className='rounded object-cover'
                        />
                    ) : suggestion.avatarUrl ? (
                        <Image
                            src={suggestion.avatarUrl}
                            alt={suggestion.title}
                            width={32}
                            height={32}
                            className='rounded-full object-cover'
                        />
                    ) : (
                        getSuggestionIcon(suggestion.type)
                    )}
                </div>

                {/* Content */}
                <div className='flex-1 min-w-0'>
                    <div className='font-medium text-gray-900 truncate'>
                        {suggestion.title}
                    </div>
                    {suggestion.subtitle && (
                        <div className='text-sm text-gray-500 truncate'>
                            {suggestion.subtitle}
                        </div>
                    )}
                </div>

                {/* Arrow */}
                <ArrowRight className='h-4 w-4 text-gray-400' />
            </button>
        );
    };

    return (
        <div
            className={`w-full ${compact ? 'max-w-md' : 'max-w-4xl'} relative`}
            ref={suggestionsRef}
        >
            {/* Main Search Bar */}
            <div className='relative'>
                <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5' />
                    <input
                        ref={inputRef}
                        type='text'
                        value={query}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            if (query.trim().length >= 2 && suggestions) {
                                setShowSuggestions(true);
                            }
                        }}
                        placeholder={placeholder}
                        className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            compact ? 'text-sm' : 'text-lg'
                        }`}
                        autoComplete='off'
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

            {/* Suggestions Dropdown */}
            {showSuggestions && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
                    {isLoadingSuggestions ? (
                        <div className='flex items-center justify-center py-8'>
                            <div className='w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin'></div>
                        </div>
                    ) : suggestions ? (
                        <div>
                            {/* Quick Search */}
                            {suggestions.quickSearches.map(
                                (suggestion, index) =>
                                    renderSuggestion(suggestion, index)
                            )}

                            {/* Videos */}
                            {suggestions.videos.length > 0 && (
                                <div>
                                    <div className='px-4 py-2 bg-gray-50 text-xs font-medium text-gray-700 uppercase tracking-wide'>
                                        Videos
                                    </div>
                                    {suggestions.videos.map(
                                        (suggestion, index) =>
                                            renderSuggestion(
                                                suggestion,
                                                suggestions.quickSearches
                                                    .length + index
                                            )
                                    )}
                                </div>
                            )}

                            {/* Creators */}
                            {suggestions.creators.length > 0 && (
                                <div>
                                    <div className='px-4 py-2 bg-gray-50 text-xs font-medium text-gray-700 uppercase tracking-wide'>
                                        Creators
                                    </div>
                                    {suggestions.creators.map(
                                        (suggestion, index) =>
                                            renderSuggestion(
                                                suggestion,
                                                suggestions.quickSearches
                                                    .length +
                                                    suggestions.videos.length +
                                                    index
                                            )
                                    )}
                                </div>
                            )}

                            {/* Tags */}
                            {suggestions.tags.length > 0 && (
                                <div>
                                    <div className='px-4 py-2 bg-gray-50 text-xs font-medium text-gray-700 uppercase tracking-wide'>
                                        Tags
                                    </div>
                                    {suggestions.tags.map((suggestion, index) =>
                                        renderSuggestion(
                                            suggestion,
                                            suggestions.quickSearches.length +
                                                suggestions.videos.length +
                                                suggestions.creators.length +
                                                index
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='px-4 py-8 text-center text-gray-500'>
                            No suggestions found
                        </div>
                    )}
                </div>
            )}

            {/* Advanced Filters - only show if not compact */}
            {!compact && showFilters && showAdvanced && (
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

            {/* Active Filters Display - only show if not compact */}
            {!compact && hasActiveFilters && !showAdvanced && (
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
