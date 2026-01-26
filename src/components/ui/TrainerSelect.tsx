import { useState, useEffect, useRef } from 'react';
import { Search, User, X, ChevronDown } from 'lucide-react';
import { useLazyQuery, useQuery } from '@apollo/client';
import { cn } from '../../lib/utils';
import { SEARCH_TEAM_SUGGESTIONS } from '../../graphql/team';
import { GET_TRAINER } from '../../graphql/trainers';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
}

interface TrainerSelectProps {
  label?: string;
  value?: string;
  onChange: (trainerId: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
}

export function TrainerSelect({
  label,
  value,
  onChange,
  placeholder = 'Search trainer by name...',
  className,
  error,
}: TrainerSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch trainer details if value is provided (for edit mode)
  const { data: trainerData } = useQuery(GET_TRAINER, {
    variables: { id: value },
    skip: !value || !!selectedTrainer,
  });

  // Search trainers as user types
  const [fetchSuggestions, { data: suggestionsData, loading }] = useLazyQuery(SEARCH_TEAM_SUGGESTIONS, {
    fetchPolicy: 'network-only',
  });

  const suggestions: Trainer[] = suggestionsData?.teamSearchSuggestions?.filter(
    (t: Trainer) => t.role === 'trainer' || t.role === 'senior-trainer'
  ) || suggestionsData?.teamSearchSuggestions || [];

  // Set selected trainer from initial value
  useEffect(() => {
    if (trainerData?.trainer && !selectedTrainer) {
      setSelectedTrainer(trainerData.trainer);
    }
  }, [trainerData, selectedTrainer]);

  // Clear selected trainer if value is cleared
  useEffect(() => {
    if (!value) {
      setSelectedTrainer(null);
    }
  }, [value]);

  // Debounced search
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        fetchSuggestions({ variables: { search: searchTerm, limit: 10 } });
        setShowDropdown(true);
      } else if (searchTerm.length === 0 && showDropdown) {
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, fetchSuggestions, showDropdown]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (trainer: Trainer) => {
    setSelectedTrainer(trainer);
    onChange(trainer.id);
    setShowDropdown(false);
    setSearchTerm('');
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setSelectedTrainer(null);
    onChange('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;

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
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSearchTerm('');
        break;
    }
  };

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {selectedTrainer ? (
        <div className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedTrainer.firstName} {selectedTrainer.lastName}
              </p>
              <p className="text-xs text-gray-500">{selectedTrainer.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'w-full pl-10 pr-10 py-2 border rounded-lg text-sm',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
              error ? 'border-red-300' : 'border-gray-300'
            )}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Dropdown */}
      {showDropdown && !selectedTrainer && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((trainer, index) => (
              <button
                key={trainer.id}
                type="button"
                onClick={() => handleSelect(trainer)}
                className={cn(
                  'w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left',
                  index === selectedIndex && 'bg-primary-50'
                )}
              >
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {trainer.firstName} {trainer.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {trainer.email} {trainer.phone && `• ${trainer.phone}`}
                  </p>
                </div>
                <span className={cn(
                  'px-2 py-0.5 text-xs rounded-full capitalize',
                  trainer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                )}>
                  {trainer.role}
                </span>
              </button>
            ))
          ) : searchTerm.length >= 2 ? (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No trainers found for "{searchTerm}"
            </div>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      )}
    </div>
  );
}
