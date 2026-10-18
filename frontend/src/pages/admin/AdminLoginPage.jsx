import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiMail, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-vh-100 d-flex flex-column justify-content-center align-items-center py-5 px-3' style={{ backgroundColor: 'var(--navy-dark)' }}>
      <div className='mb-4 text-center'>
        <img src='/icon.svg' alt='AKTU Notes1965 Logo' width='54' height='54' className='mb-2' />
        <h1 className='h4 fw-bold text-white mb-1'>AKTU Notes1965 Admin Portal</h1>
        <p className='small text-secondary mb-0'>Sign in with verified administrator credentials</p>
      </div>

      <div className='card border-0 shadow-lg p-4 p-md-5 bg-white rounded-3' style={{ width: '100%', maxWidth: '420px' }}>
        {error && (
          <div className='alert alert-danger py-2 d-flex align-items-center gap-2 small mb-3' role='alert'>
            <FiAlertTriangle className='flex-shrink-0' size={16} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor='admin-email' className='form-label small fw-semibold text-secondary'>
              Admin Email
            </label>
            <div className='input-group input-group-sm'>
              <span className='input-group-text bg-light text-muted'><FiMail /></span>
              <input
                type='email'
                id='admin-email'
                className='form-control'
                required
                autoComplete='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='admin@example.com'
              />
            </div>
          </div>

          <div className='mb-4'>
            <label htmlFor='admin-password' className='form-label small fw-semibold text-secondary'>
              Password
            </label>
            <div className='input-group input-group-sm'>
              <span className='input-group-text bg-light text-muted'><FiLock /></span>
              <input
                type='password'
                id='admin-password'
                className='form-control'
                required
                autoComplete='current-password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••••••'
              />
            </div>
          </div>

          <button
            type='submit'
            className='btn btn-primary-aktu w-100 py-2 d-inline-flex align-items-center justify-content-center gap-2 mb-3'
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className='text-center pt-2 border-top'>
          <Link to='/' className='small text-secondary text-decoration-none d-inline-flex align-items-center gap-1'>
            <FiArrowLeft size={13} />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
