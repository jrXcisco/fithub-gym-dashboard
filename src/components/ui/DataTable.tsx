import { useState, useMemo } from 'react';
import {
  Search,
  Download,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  searchPlaceholder?: string;
  onDownload?: () => void;
  _onFilter?: () => void;
  filterComponent?: React.ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  // Server-side pagination props
  serverSidePagination?: boolean;
  totalItems?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (search: string) => void;
  pageSizeOptions?: number[];
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  searchPlaceholder = 'Search...',
  onDownload,
  filterComponent,
  pageSize: initialPageSize = 10,
  emptyMessage = 'No data found',
  serverSidePagination = false,
  totalItems,
  currentPage: serverCurrentPage,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  pageSizeOptions = [10, 25, 50, 100],
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [localCurrentPage, setLocalCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [showFilters, setShowFilters] = useState(false);

  // Use server-side page if provided, otherwise use local state
  const currentPage = serverSidePagination && serverCurrentPage ? serverCurrentPage : localCurrentPage;
  const setCurrentPage = serverSidePagination && onPageChange ? onPageChange : setLocalCurrentPage;

  const filteredData = useMemo(() => {
    // For server-side pagination, don't filter client-side
    if (serverSidePagination) {
      return data;
    }

    let result = [...data];

    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(searchLower)
        )
      );
    }

    if (sortKey) {
      result.sort((a, b) => {
        const aValue = (a as Record<string, unknown>)[sortKey] as string | number;
        const bValue = (b as Record<string, unknown>)[sortKey] as string | number;
        if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, search, sortKey, sortOrder, serverSidePagination]);

  const paginatedData = useMemo(() => {
    // For server-side pagination, data is already paginated
    if (serverSidePagination) {
      return data;
    }
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize, serverSidePagination, data]);

  // Calculate total pages based on server-side total or client-side filtered data
  const totalPages = serverSidePagination && totalItems 
    ? Math.ceil(totalItems / pageSize) 
    : Math.ceil(filteredData.length / pageSize);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
    if (serverSidePagination && onPageSizeChange) {
      onPageSizeChange(newSize);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
    if (serverSidePagination && onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-4 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {filterComponent && (
              <Button
                variant="secondary"
                leftIcon={<Filter className="w-4 h-4" />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            )}
            {onDownload && (
              <Button
                variant="secondary"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={onDownload}
              >
                Export
              </Button>
            )}
          </div>
        </div>
        {showFilters && filterComponent && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            {filterComponent}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer hover:bg-gray-100'
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      sortOrder === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'hover:bg-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render
                        ? column.render(item)
                        : String((item as Record<string, unknown>)[column.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer - always show for server-side or when totalPages > 1 */}
      {(serverSidePagination || totalPages > 1) && (
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Page Size Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            {/* Smart Pagination: 1 ... 4 5 6 ... 100 */}
            {totalPages > 0 && (() => {
              const pages: (number | string)[] = [];
              
              if (totalPages <= 7) {
                // Show all pages if 7 or fewer
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                // Always show first page
                pages.push(1);
                
                if (currentPage > 3) {
                  pages.push('...');
                }
                
                // Show pages around current
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);
                
                for (let i = start; i <= end; i++) {
                  if (!pages.includes(i)) pages.push(i);
                }
                
                if (currentPage < totalPages - 2) {
                  pages.push('...');
                }
                
                // Always show last page
                if (!pages.includes(totalPages)) pages.push(totalPages);
              }
              
              return pages.map((page, idx) => 
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-400">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setCurrentPage(page as number)}
                  >
                    {page}
                  </Button>
                )
              );
            })()}
            
            {/* Next Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
