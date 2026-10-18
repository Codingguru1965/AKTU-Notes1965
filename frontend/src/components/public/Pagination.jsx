import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const Pagination = ({ currentPage, totalPages, totalCount, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className='d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3 mt-4 pt-3 border-top' aria-label='Resources pagination'>
      <div className='small text-muted'>
        Showing page <span className='fw-bold text-dark'>{currentPage}</span> of <span className='fw-bold text-dark'>{totalPages}</span> ({totalCount} resources)
      </div>

      <ul className='pagination pagination-sm mb-0'>
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className='page-link'
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label='Previous Page'
          >
            <FiChevronLeft size={14} />
          </button>
        </li>

        {pages.map((p) => (
          <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
            <button
              className='page-link'
              onClick={() => onPageChange(p)}
              aria-label={`Page ${p}`}
              aria-current={p === currentPage ? 'page' : undefined}
            >
              {p}
            </button>
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className='page-link'
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label='Next Page'
          >
            <FiChevronRight size={14} />
          </button>
        </li>
      </ul>
    </nav>
  );
};
