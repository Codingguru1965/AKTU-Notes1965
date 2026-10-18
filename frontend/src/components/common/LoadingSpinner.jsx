import React from 'react';

export const LoadingSpinner = ({ message = 'Loading academic resources...' }) => {
  return (
    <div className='text-center py-5' role='status' aria-live='polite'>
      <div className='spinner-border text-primary' style={{ width: '3rem', height: '3rem' }} role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
      <p className='mt-3 text-muted fw-medium small mb-0'>{message}</p>
    </div>
  );
};
