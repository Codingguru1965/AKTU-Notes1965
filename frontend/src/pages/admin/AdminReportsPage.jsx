import React, { useState, useEffect } from 'react';
import { adminGetReports, adminUpdateReport } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { FiCheck, FiExternalLink } from 'react-icons/fi';

export const AdminReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await adminUpdateReport(id, newStatus);
      fetchReports();
    } catch (err) {
      alert(err.message || 'Failed to update report status');
    }
  };

  return (
    <div>
      <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4'>
        <div>
          <h1 className='h3 fw-bold mb-1 text-dark'>Resource Issue Reports</h1>
          <p className='text-muted small mb-0'>Review reports submitted by students regarding broken links or issues</p>
        </div>

        <div className='d-flex gap-2'>
          <select
            className='form-select form-select-sm'
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value=''>All Reports</option>
            <option value='pending'>Pending Only</option>
            <option value='reviewed'>Reviewed Only</option>
            <option value='resolved'>Resolved Only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message='Loading reports...' />
      ) : error ? (
        <ErrorMessage title='Error' message={error} onRetry={fetchReports} />
      ) : reports.length === 0 ? (
        <div className='card border-0 shadow-sm p-5 text-center bg-white rounded-3'>
          <FiCheck size={36} className='text-success mx-auto mb-2' />
          <h2 className='h5 fw-bold text-dark'>No reports pending!</h2>
          <p className='text-muted small mb-0'>All reported issues have been addressed.</p>
        </div>
      ) : (
        <div className='card border-0 shadow-sm bg-white rounded-3'>
          <div className='table-responsive'>
            <table className='table table-hover align-middle mb-0 small'>
              <thead className='table-light'>
                <tr>
                  <th>Resource</th>
                  <th>Issue Type</th>
                  <th>Description</th>
                  <th>Reported Date</th>
                  <th>Status</th>
                  <th className='text-end'>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id}>
                    <td style={{ maxWidth: '240px' }}>
                      <div className='fw-bold text-dark text-truncate'>{r.resourceTitle}</div>
                      {r.resourceId && (
                        <a
                          href={r.resourceId.fileUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='small text-decoration-none d-inline-flex align-items-center gap-1 text-secondary'
                        >
                          <span>Check Link</span>
                          <FiExternalLink size={11} />
                        </a>
                      )}
                    </td>
                    <td>
                      <span className='badge bg-warning bg-opacity-10 text-dark'>
                        {r.issueType.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <div className='text-secondary small'>{r.description || 'No additional details provided.'}</div>
                    </td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${r.status === 'resolved' ? 'bg-success' : r.status === 'reviewed' ? 'bg-info text-dark' : 'bg-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className='text-end'>
                      <div className='d-inline-flex gap-1'>
                        {r.status !== 'resolved' && (
                          <button
                            type='button'
                            onClick={() => handleStatusChange(r._id, 'resolved')}
                            className='btn btn-success btn-sm py-0 px-2'
                            title='Mark Resolved'
                          >
                            Resolve
                          </button>
                        )}
                        {r.status === 'pending' && (
                          <button
                            type='button'
                            onClick={() => handleStatusChange(r._id, 'reviewed')}
                            className='btn btn-light btn-sm py-0 px-2'
                            title='Mark Reviewed'
                          >
                            Review
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
