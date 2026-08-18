import React, { memo, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { theme } from '../theme';

const Pagination = memo(function Pagination({ currentPage, totalPages, onPageChange }) {
  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePageClick = useCallback((page) => {
    onPageChange(page);
  }, [onPageChange]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) return [];
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center mt-6">
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="px-3 py-2 mx-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        style={{
          backgroundColor: 'transparent',
          color: theme.colors.textPrimary,
        }}
      >
        <ChevronLeft className="w-4 h-4" />
        Previous
      </button>

      {pageNumbers.map((i) => (
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-3 py-2 mx-1 rounded-md text-sm font-medium transition-colors ${
            currentPage === i
              ? 'text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
          style={{
            backgroundColor: currentPage === i ? theme.colors.primary : 'transparent',
            color: currentPage === i ? 'white' : theme.colors.textPrimary,
          }}
        >
          {i}
        </button>
      ))}

      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="px-3 py-2 mx-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        style={{
          backgroundColor: 'transparent',
          color: theme.colors.textPrimary,
        }}
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});

export default Pagination;

