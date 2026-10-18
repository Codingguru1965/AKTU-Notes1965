import React from 'react';
import { FiInbox, FiRotateCcw } from 'react-icons/fi';

export const EmptyState = ({
  title = 'No resources found',
  message = 'We could not find any study materials matching your current filters or search query.',
  onReset
}) => {
  return (
    <div className='text-center py-5 px-3 bg-white rounded-3 border my-4' role='region' aria-label='No results'>
      <div className='d-inline-flex p-3 rounded-circle bg-light text-muted mb-3'>
        <FiInbox size={36} />
      </div>
      <h5 className='fw-bold mb-2' style={{ color: 'var(--navy)' }}>{title}</h5>
      <p className='text-muted small mx-auto mb-4' style={{ maxWidth: '480px' }}>
        {message}
      </p>
      {onReset && (
        <button
          type='button'
          onClick={onReset}
          className='btn btn-primary-aktu btn-sm d-inline-flex align-items-center gap-2 px-3 py-2'
        >
          <FiRotateCcw size={14} />
          <span>Reset All Filters</span>
        </button>
      )}
    </div>
  );
};
