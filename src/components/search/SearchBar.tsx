"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Filter } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
  showFilters?: boolean;
}

export default function SearchBar({ 
  placeholder = "Search by title, area...", 
  onSearch,
  className = "",
  showFilters = true 
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize with existing search query
  useEffect(() => {
    const existingQuery = searchParams?.get("search");
    if (existingQuery) {
      setQuery(existingQuery);
    }
  }, [searchParams]);

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      // Default behavior: update URL
      const params = new URLSearchParams(searchParams?.toString());
      
      if (trimmedQuery) {
        params.set("search", trimmedQuery);
      } else {
        params.delete("search");
      }
      
      // Preserve other filters
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    handleSearch("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setQuery("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className={`
              w-full rounded-2xl border border-gray-200 bg-white pl-10 pr-10
              py-3 text-sm placeholder-gray-500 shadow-sm
              transition-all duration-200
              focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20
              hover:border-gray-300
              ${isFocused ? "shadow-md" : "shadow-sm"}
            `}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-gray-100 p-0.5 text-gray-500 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        
        {showFilters && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Press Enter to search</span>
              <span>•</span>
              <span>ESC to clear</span>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <Filter className="h-3 w-3" />
              Filters
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
