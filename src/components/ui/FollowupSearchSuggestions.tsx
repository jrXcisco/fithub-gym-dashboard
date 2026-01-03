import { useState, useEffect, useRef } from 'react';
import { Search, User, X, ChevronRight, Calendar, Flag } from 'lucide-react';
import { useLazyQuery } from '@apollo/client';
import { cn } from '../../lib/utils';
import { SEARCH_FOLLOWUP_SUGGESTIONS } from '../../graphql/followups';

interface FollowupSuggestion {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  scheduledDate: string;
  member?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface FollowupSearchSuggestionsProps {
  placeholder?: string;
  onSelect: (item: FollowupSuggestion) => void;
  onSearch: (term: string) => void;
  className?: string;
}

export function FollowupSearchSuggestions({
  placeholder = 'Search by member name...',
  onSelect,
  onSearch,
  className,
}: FollowupSearchSuggestionsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [fetchSuggestions, { data }] = useLazyQuery(SEARCH_FOLLOWUP_SUGGESTIONS, {
    fetchPolicy: 'network-only',
    onCompleted: () => setHasSearched(true),
  });

  const suggestions: FollowupSuggestion[] = data?.followupSearchSuggestions || [];

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        setHasSearched(false);
        fetchSuggestions({ variables: { search: searchTerm, limit: 8 } });
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
        setHasSearched(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        onSearch(searchTerm);
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        } else {
          onSearch(searchTerm);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelect = (item: FollowupSuggestion) => {
    onSelect(item);
    setSearchTerm('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    onSearch('');
    inputRef.current?.focus();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary-100 text-primary-700 rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Clean search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
          className="w-full pl-11 pr-10 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown - show when we have searched */}
      {showSuggestions && hasSearched && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {suggestions.length > 0 ? (
            <ul className="max-h-72 overflow-y-auto">
              {suggestions.map((item, index) => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    'px-3 py-2.5 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0',
                    selectedIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                  )}
                >
                  <div className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                    selectedIndex === index ? 'bg-blue-100' : 'bg-gray-100'
                  )}>
                    <User className={cn(
                      'w-4 h-4',
                      selectedIndex === index ? 'text-blue-600' : 'text-gray-500'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.member 
                        ? highlightMatch(`${item.member.firstName} ${item.member.lastName}`, searchTerm)
                        : 'No Member'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="truncate">{item.title}</span>
                      <span className="text-gray-300">•</span>
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.scheduledDate)}
                    </div>
                  </div>
                  <Flag className={cn('w-4 h-4', getPriorityStyle(item.priority))} />
                  <span
                    className={cn(
                      'px-2 py-0.5 text-xs font-medium rounded border capitalize',
                      getStatusStyle(item.status)
                    )}
                  >
                    {item.status}
                  </span>
                  <ChevronRight className={cn(
                    'w-4 h-4',
                    selectedIndex === index ? 'text-blue-400' : 'text-gray-300'
                  )} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No follow-ups found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
