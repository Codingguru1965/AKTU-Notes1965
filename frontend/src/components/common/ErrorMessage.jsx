import React from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

export const ErrorMessage = ({
  title = 'Failed to load resources',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry
}) => {
  return (
    <div className='alert alert-danger border-0 p-4 rounded-3 text-center my-4 shadow-sm' role='alert'>
      <div className='d-inline-flex p-2 rounded-circle bg-danger bg-opacity-10 text-danger mb-2'>
        <FiAlertTriangle size={28} />
      </div>
      <h5 className='fw-bold text-danger mb-1'>{title}</h5>
      <p className='small mb-3 text-danger-emphasis'>{message}</p>
      {onRetry && (
        <button
          type='button'
          onClick={onRetry}
          className='btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2 px-3 py-2'
        >
          <FiRefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};
