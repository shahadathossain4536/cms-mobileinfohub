import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pagination state
 * @param {number} initialPage - Initial page number (default: 1)
 * @param {number} initialLimit - Initial items per page (default: 10)
 * @param {string} initialSearch - Initial search term (default: '')
 * @param {string} initialSortBy - Initial sort field (default: 'createdAt')
 * @param {string} initialSortOrder - Initial sort order (default: 'desc')
 * @returns {Object} Pagination state and handlers
 */
export const usePagination = (
  initialPage = 1,
  initialLimit = 10,
  initialSearch = '',
  initialSortBy = 'createdAt',
  initialSortOrder = 'desc'
) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState(initialSortOrder);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handleSearch = useCallback((searchTerm) => {
    setSearch(searchTerm);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleSort = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1); // Reset to first page when sorting
  }, []);

  const handleLimitChange = useCallback((newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when changing limit
  }, []);

  const resetPagination = useCallback(() => {
    setCurrentPage(initialPage);
    setSearch(initialSearch);
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialPage, initialSearch, initialSortBy, initialSortOrder]);

  return {
    // State
    currentPage,
    limit,
    search,
    sortBy,
    sortOrder,
    
    // Handlers
    handlePageChange,
    handleSearch,
    handleSort,
    handleLimitChange,
    resetPagination,
    
    // Setters (for direct state updates if needed)
    setCurrentPage,
    setLimit,
    setSearch,
    setSortBy,
    setSortOrder,
  };
};

export default usePagination;
