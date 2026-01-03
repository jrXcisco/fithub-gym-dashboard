import { useState, useRef, useEffect } from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface AppliedFilter {
  key: string;
  label: string;
  value: string;
  valueLabel: string;
}

interface FilterMenuProps {
  fields: FilterField[];
  appliedFilters: Record<string, string>;
  onFilterChange: (filters: Record<string, string>) => void;
  className?: string;
}

export function FilterMenu({
  fields,
  appliedFilters,
  onFilterChange,
  className,
}: FilterMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<Record<string, string>>(appliedFilters);
  const menuRef = useRef<HTMLDivElement>(null);

  const appliedCount = Object.values(appliedFilters).filter(v => v && v !== 'all').length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setTempFilters(appliedFilters);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [appliedFilters]);

  useEffect(() => {
    setTempFilters(appliedFilters);
  }, [appliedFilters]);

  const handleTempFilterChange = (key: string, value: string) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFilterChange(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: Record<string, string> = {};
    fields.forEach(field => {
      resetFilters[field.key] = 'all';
    });
    setTempFilters(resetFilters);
    onFilterChange(resetFilters);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempFilters(appliedFilters);
    setIsOpen(false);
  };

  const getAppliedFiltersList = (): AppliedFilter[] => {
    const list: AppliedFilter[] = [];
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        const field = fields.find(f => f.key === key);
        if (field) {
          const option = field.options.find(o => o.value === value);
          if (option) {
            list.push({
              key,
              label: field.label,
              value,
              valueLabel: option.label,
            });
          }
        }
      }
    });
    return list;
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...appliedFilters, [key]: 'all' };
    onFilterChange(newFilters);
  };

  const appliedFiltersList = getAppliedFiltersList();

  return (
    <div className={cn('relative', className)} ref={menuRef}>
      {/* Filter Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
          isOpen || appliedCount > 0
            ? 'bg-primary-50 border-primary-200 text-primary-700'
            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
        )}
      >
        <Filter className="w-4 h-4" />
        Filters
        {appliedCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-semibold bg-primary-500 text-white rounded-full">
            {appliedCount}
          </span>
        )}
      </button>

      {/* Filter Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Applied Filters Chips - Inside dropdown */}
          {appliedFiltersList.length > 0 && (
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <p className="text-xs font-medium text-gray-500 mb-2">Applied Filters</p>
              <div className="flex flex-wrap gap-1.5">
                {appliedFiltersList.map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white text-gray-700 rounded-md border border-gray-200"
                  >
                    {filter.valueLabel}
                    <button
                      onClick={() => removeFilter(filter.key)}
                      className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
            {fields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {field.label}
                </label>
                <select
                  value={tempFilters[field.key] || 'all'}
                  onChange={(e) => handleTempFilterChange(field.key, e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                >
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
