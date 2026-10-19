import React, { useState, useEffect } from 'react';
import { adminGetReports, adminUpdateReport } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import {
  FiCheck,
  FiExternalLink,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';

const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await adminGetReports(params);
      if (res.data && res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await adminUpdateReport(id, newStatus);
      showNotification('success', `Report status marked as "${newStatus}".`);
      fetchReports();
    } catch (err) {
      showNotification('danger', err.message || 'Failed to update report status');
    } finally {
      setUpdatingId(null);
    }
  };

  const resolveLink = (url) => {
    if (!url) return '#';
    if (url.startsWith('/uploads/')) {
      return `${API_HOST}${url}`;
    }
    return url;
  };

  return (
    <div
      className='d-flex flex-column flex-grow-1 w-100 pb-5'
      style={{ minWidth: 0, maxWidth: 'none' }}
    >
      {/* Page Header & Filter Controls */}
      <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4'>
        <div>
          <h1 className='h3 fw-bold mb-1 text-dark'>Resource Issue Reports</h1>
          <p className='text-muted small mb-0'>
            Review and resolve broken links, incorrect content, or questions reported by students
          </p>
        </div>

        <div className='d-flex align-items-center gap-2 flex-wrap'>
          <button
            type='button'
            onClick={fetchReports}
            className='btn btn-light btn-sm d-inline-flex align-items-center gap-1 border'
            title='Refresh Reports List'
            aria-label='Refresh reports list'
          >
            <FiRefreshCw size={14} />
            <span className='d-none d-sm-inline'>Sync</span>
          </button>

          <select
            className='form-select form-select-sm'
            style={{ minWidth: '150px' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label='Filter Reports by Status'
          >
            <option value=''>All Reports</option>
            <option value='pending'>Pending Only</option>
            <option value='reviewed'>Reviewed Only</option>
            <option value='resolved'>Resolved Only</option>
          </select>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center gap-2 py-2 small shadow-sm mb-4`}
          role='alert'
        >
          {notification.type === 'success' ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
          <div className='flex-grow-1'>{notification.message}</div>
          <button
            type='button'
            className='btn-close small p-2'
            onClick={() => setNotification(null)}
            aria-label='Close alert'
          />
        </div>
      )}

      {/* Reports Table / Empty State */}
      {loading ? (
        <LoadingSpinner message='Loading reports queue...' />
      ) : error ? (
        <ErrorMessage title='Error Loading Reports' message={error} onRetry={fetchReports} />
      ) : reports.length === 0 ? (
        <div className='card border-0 shadow-sm p-5 text-center bg-white rounded-3'>
          <FiCheck size={40} className='text-success mx-auto mb-2' />
          <h2 className='h5 fw-bold text-dark mb-1'>No reports pending!</h2>
          <p className='text-muted small mb-0'>
            {statusFilter
              ? `There are currently no reports with "${statusFilter}" status.`
              : 'All student issues and broken links have been resolved.'}
          </p>
        </div>
      ) : (
        <div className='card border-0 shadow-sm bg-white rounded-3'>
          <div className='table-responsive'>
            <table className='table table-hover align-middle mb-0 small'>
              <thead className='table-light'>
                <tr>
                  <th style={{ minWidth: '200px' }}>Resource</th>
                  <th>Issue Type</th>
                  <th style={{ minWidth: '240px' }}>Issue Description</th>
                  <th>Reported Date</th>
                  <th>Status</th>
                  <th className='text-end' style={{ minWidth: '130px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td style={{ minWidth: '200px', maxWidth: '300px' }}>
                      <div className='fw-bold text-dark text-wrap'>{r.resourceTitle}</div>
                      {r.resourceId && (
                        <a
                          href={resolveLink(r.resourceId.fileUrl)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='small text-decoration-none d-inline-flex align-items-center gap-1 text-primary mt-1'
                        >
                          <span>Inspect Linked File</span>
                          <FiExternalLink size={11} />
                        </a>
                      )}
                    </td>

                    <td>
                      <span className='badge bg-warning bg-opacity-10 text-dark border border-warning border-opacity-25'>
                        {r.issueType ? r.issueType.replace(/_/g, ' ') : 'General'}
                      </span>
                    </td>

                    {/* Preserved Issue Description Column */}
                    <td style={{ minWidth: '240px', maxWidth: '360px' }}>
                      <div className='text-secondary small text-break'>
                        {r.description || 'No additional details provided by student.'}
                      </div>
                    </td>

                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>

                    <td>
                      <span
                        className={`badge ${
                          r.status === 'resolved'
                            ? 'bg-success'
                            : r.status === 'reviewed'
                            ? 'bg-info text-dark'
                            : 'bg-danger'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className='text-end'>
                      <div className='d-inline-flex gap-1 flex-wrap justify-content-end'>
                        {r.status !== 'resolved' && (
                          <button
                            type='button'
                            onClick={() => handleStatusChange(r._id, 'resolved')}
                            disabled={updatingId === r._id}
                            className='btn btn-success btn-sm py-1 px-2 fw-semibold'
                            title='Mark report as Resolved'
                          >
                            Resolve
                          </button>
                        )}
                        {r.status === 'pending' && (
                          <button
                            type='button'
                            onClick={() => handleStatusChange(r._id, 'reviewed')}
                            disabled={updatingId === r._id}
                            className='btn btn-light btn-sm py-1 px-2 border'
                            title='Mark report as Reviewed'
                          >
                            Review
                          </button>
                        )}
                        {r.status === 'resolved' && (
                          <button
                            type='button'
                            onClick={() => handleStatusChange(r._id, 'pending')}
                            disabled={updatingId === r._id}
                            className='btn btn-light btn-sm py-1 px-2 border text-muted'
                            title='Re-open as pending'
                          >
                            Re-open
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
