import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

export const NotFoundPage = () => {
  return (
    <main className='container text-center py-5 my-5' id='not-found-content'>
      <h1 className='display-1 fw-bold text-primary mb-2' style={{ color: 'var(--navy)' }}>404</h1>
      <h2 className='h4 fw-bold text-dark mb-3'>Page Not Found</h2>
      <p className='text-muted small mx-auto mb-4' style={{ maxWidth: '450px' }}>
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <Link to='/' className='btn btn-primary-aktu px-4 py-2 d-inline-flex align-items-center gap-2'>
        <FiHome size={16} />
        <span>Return to Homepage</span>
      </Link>
    </main>
  );
};
