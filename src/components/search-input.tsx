'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
    className?: string;
    placeholder?: string;
    autoFocus?: boolean;
}

export function SearchInput({ 
    className = '', 
    placeholder = 'Search videos, creators, and content...',
    autoFocus = false
}: SearchInputProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Fetch search suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }

            setIsLoading(true);
            try {
                // For now, let's use simpler string-based suggestions
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
                if (response.ok) {
                    const data = await response.json();
                    // Extract simple text suggestions from results
                    const suggestions = [
                        ...data.results.videos.items.map((video: { title: string }) => video.title),
                        ...data.results.creators.items.map((creator: { displayName: string }) => creator.displayName),
                    ].slice(0, 5);
                    setSuggestions(suggestions);
                    setShowSuggestions(true);
                }
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSearch = (searchQuery: string = query) => {
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setShowSuggestions(false);
            setQuery('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        handleSearch(suggestion);
    };

    const clearSearch = () => {
        setQuery('');
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    return (
        <div className={`relative ${className}`}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white font-medium"
                />
                
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                )}
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full px-4 py-2 text-left text-sm text-black font-medium hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-lg last:rounded-b-lg"
                        >
                            <div className="flex items-center">
                                <Search className="h-3 w-3 text-gray-400 mr-2" />
                                <span className="truncate">{suggestion}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Loading indicator */}
            {isLoading && showSuggestions && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="ml-2 text-sm text-gray-500">Searching...</span>
                    </div>
                </div>
            )}
        </div>
    );
}