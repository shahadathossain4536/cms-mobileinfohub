import React from 'react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  hasNextPage, 
  hasPrevPage, 
  onPageChange,
  className = ""
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center space-x-2 ${className}`}>
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          hasPrevPage
            ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-600'
        }`}
      >
        Previous
      </button>

      {/* First page if not visible */}
      {pageNumbers[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="px-3 py-2 rounded-md text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            1
          </button>
          {pageNumbers[0] > 2 && (
            <span className="px-2 text-slate-500 dark:text-slate-400">...</span>
          )}
        </>
      )}

      {/* Page Numbers */}
      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => onPageChange(pageNum)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            pageNum === currentPage
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
          }`}
        >
          {pageNum}
        </button>
      ))}

      {/* Last page if not visible */}
      {pageNumbers[pageNumbers.length - 1] < totalPages && (
        <>
          {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
            <span className="px-2 text-slate-500 dark:text-slate-400">...</span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="px-3 py-2 rounded-md text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          hasNextPage
            ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-600'
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
