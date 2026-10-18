import React from 'react';
import { ResourceCard } from './ResourceCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { ErrorMessage } from '../common/ErrorMessage';

export const ResourceList = ({
  resources,
  loading,
  error,
  onRetry,
  onResetFilters,
  onReport
}) => {
  if (loading) {
    return <LoadingSpinner message='Loading verified AKTU study materials...' />;
  }

  if (error) {
    return (
      <ErrorMessage
        title='Could not load resources'
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <EmptyState
        title='No study materials found'
        message='Try clearing some filters or searching with a different subject name or code.'
        onReset={onResetFilters}
      />
    );
  }

  return (
    <div className='row g-4' role='feed' aria-label='AKTU Study Materials'>
      {resources.map((resource) => (
        <div key={resource._id} className='col-lg-4 col-md-6 col-12'>
          <ResourceCard resource={resource} onReport={onReport} />
        </div>
      ))}
    </div>
  );
};
