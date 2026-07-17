import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { theme } from '../theme';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
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
      );
    }

    return pages;
  };

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

      {renderPageNumbers()}

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
};

export default Pagination;
