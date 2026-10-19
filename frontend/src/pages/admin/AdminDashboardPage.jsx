import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetStats, adminTogglePublish } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import {
  FiLayers,
  FiCheckCircle,
  FiEyeOff,
  FiAlertCircle,
  FiPlusCircle,
  FiEdit2,
  FiRefreshCw,
  FiCheck
} from 'react-icons/fi';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminGetStats();
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleToggle = async (id, currentStatus) => {
    setTogglingId(id);
    try {
      await adminTogglePublish(id, !currentStatus);
      showNotification(
        'success',
        `Resource status updated to ${!currentStatus ? 'Published' : 'Draft'}.`
      );
      // Re-fetch to guarantee metrics and table stay 100% in sync
      const res = await adminGetStats();
      if (res.data && res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      showNotification('danger', err.message || 'Failed to toggle publication status');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <LoadingSpinner message='Loading dashboard overview...' />;
  if (error) return <ErrorMessage title='Dashboard Error' message={error} onRetry={fetchStats} />;

  const total = stats?.total || 0;
  const published = stats?.published || 0;
  const unpublished = stats?.unpublished || 0;
  const pendingReports = stats?.pendingReports || 0;
  const byType = stats?.byType || {};
  const byBranch = stats?.byBranch || {};
  const recentResources = stats?.recentResources || [];

  return (
    <div className='w-100'>
      {/* Top Header & Quick Actions */}
      <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4'>
        <div>
          <h1 className='h3 fw-bold mb-1 text-dark'>Admin Dashboard</h1>
          <p className='text-muted small mb-0'>
            Real-time overview of AKTU academic resources, publication status, and student reports
          </p>
        </div>

        <div className='d-flex align-items-center gap-2'>
          <button
            type='button'
            onClick={fetchStats}
            className='btn btn-light btn-sm d-inline-flex align-items-center gap-1 border'
            title='Refresh Dashboard Statistics'
            aria-label='Refresh dashboard statistics'
          >
            <FiRefreshCw size={14} />
            <span className='d-none d-sm-inline'>Sync</span>
          </button>
          <Link
            to='/admin/resources/new'
            className='btn btn-primary-aktu btn-sm d-inline-flex align-items-center gap-2 px-3 py-2'
          >
            <FiPlusCircle size={15} />
            <span>Add New Resource</span>
          </Link>
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

      {/* Statistics Cards Grid: 4 cols Desktop (>=1200), 2 cols Laptop/Tablet (481-1199), 1 col Mobile (<=480) */}
      <div className='row g-3 mb-4'>
        {/* Total Resources */}
        <div className='col-xl-3 col-md-6 col-12'>
          <div className='stats-card card-blue'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div className='text-muted small fw-semibold text-uppercase' style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Total Resources
                </div>
                <div className='h3 fw-bold mb-0 text-dark mt-1'>{total}</div>
                <div className='text-secondary' style={{ fontSize: '0.78rem' }}>All materials in portal</div>
              </div>
              <FiLayers size={32} className='text-primary opacity-50' />
            </div>
          </div>
        </div>

        {/* Published (Live) */}
        <div className='col-xl-3 col-md-6 col-12'>
          <div className='stats-card card-green'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div className='text-muted small fw-semibold text-uppercase' style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Published (Live)
                </div>
                <div className='h3 fw-bold mb-0 text-success mt-1'>{published}</div>
                <div className='text-success' style={{ fontSize: '0.78rem' }}>
                  {total > 0 ? `${Math.round((published / total) * 100)}% of total` : '0%'}
                </div>
              </div>
              <FiCheckCircle size={32} className='text-success opacity-50' />
            </div>
          </div>
        </div>

        {/* Drafts / Unpublished */}
        <div className='col-xl-3 col-md-6 col-12'>
          <div className='stats-card card-amber'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div className='text-muted small fw-semibold text-uppercase' style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Drafts / Offline
                </div>
                <div className='h3 fw-bold mb-0 text-warning mt-1'>{unpublished}</div>
                <div className='text-muted' style={{ fontSize: '0.78rem' }}>Not visible to students</div>
              </div>
              <FiEyeOff size={32} className='text-warning opacity-50' />
            </div>
          </div>
        </div>

        {/* Pending Reports */}
        <div className='col-xl-3 col-md-6 col-12'>
          <div className='stats-card card-navy'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div className='text-muted small fw-semibold text-uppercase' style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  Pending Reports
                </div>
                <div className={`h3 fw-bold mb-0 mt-1 ${pendingReports > 0 ? 'text-danger' : 'text-dark'}`}>
                  {pendingReports}
                </div>
                <div className='text-muted' style={{ fontSize: '0.78rem' }}>Student feedback queue</div>
              </div>
              <FiAlertCircle size={32} className={pendingReports > 0 ? 'text-danger opacity-75' : 'text-secondary opacity-50'} />
            </div>
          </div>
        </div>
      </div>

      {/* Breakdowns Row */}
      <div className='row g-4 mb-4'>
        {/* Distribution by Material Type */}
        <div className='col-lg-6 col-12'>
          <div className='card border-0 shadow-sm p-4 bg-white rounded-3 h-100'>
            <h2 className='h6 fw-bold mb-3 text-dark d-flex justify-content-between align-items-center'>
              <span>Distribution by Material Type</span>
              <span className='badge bg-light text-secondary border small fw-normal'>Live Totals</span>
            </h2>

            {total === 0 ? (
              <div className='py-4 text-center text-muted small'>
                No resources recorded in the system yet.
              </div>
            ) : (
              <div className='d-flex flex-column gap-3'>
                {['Notes', 'Syllabus', 'PYQ'].map((type) => {
                  const count = byType[type] || 0;
                  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                  return (
                    <div key={type}>
                      <div className='d-flex justify-content-between small fw-semibold mb-1'>
                        <span className='text-dark'>{type}</span>
                        <span className='text-muted'>
                          {count} {count === 1 ? 'file' : 'files'} ({percent}%)
                        </span>
                      </div>
                      <div className='progress' style={{ height: '7px' }}>
                        <div
                          className={`progress-bar ${
                            type === 'Notes' ? 'bg-success' : type === 'Syllabus' ? 'bg-primary' : 'bg-warning'
                          }`}
                          role='progressbar'
                          style={{ width: `${percent}%` }}
                          aria-valuenow={percent}
                          aria-valuemin='0'
                          aria-valuemax='100'
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Resources by Engineering Branch */}
        <div className='col-lg-6 col-12'>
          <div className='card border-0 shadow-sm p-4 bg-white rounded-3 h-100'>
            <h2 className='h6 fw-bold mb-3 text-dark d-flex justify-content-between align-items-center'>
              <span>Resources by Engineering Branch</span>
              <span className='badge bg-light text-secondary border small fw-normal'>Coverage</span>
            </h2>

            {Object.keys(byBranch).length === 0 ? (
              <div className='py-4 text-center text-muted small'>
                No branch materials cataloged yet.
              </div>
            ) : (
              <div className='d-flex flex-wrap gap-2'>
                {Object.entries(byBranch).map(([branch, count]) => (
                  <div
                    key={branch}
                    className='p-2 px-3 rounded border bg-light small d-flex align-items-center justify-content-between gap-3'
                    style={{ minWidth: '110px' }}
                  >
                    <strong className='text-dark'>{branch}</strong>
                    <span className='badge bg-secondary rounded-pill'>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Resources Table */}
      <div className='card border-0 shadow-sm bg-white rounded-3'>
        <div className='card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center'>
          <h2 className='h6 fw-bold mb-0 text-dark'>Recently Added Resources</h2>
          <Link to='/admin/resources' className='small text-decoration-none fw-semibold'>
            View All Resources &rarr;
          </Link>
        </div>

        <div className='table-responsive'>
          <table className='table table-hover align-middle mb-0 small'>
            <thead className='table-light'>
              <tr>
                <th style={{ minWidth: '200px' }}>Title</th>
                <th>Subject Code</th>
                <th>Type</th>
                <th>Branch &amp; Sem</th>
                <th>Status</th>
                <th className='text-end'>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentResources.length === 0 ? (
                <tr>
                  <td colSpan='6' className='text-center py-4 text-muted'>
                    No resources added yet. Click &quot;Add New Resource&quot; to publish your first academic material.
                  </td>
                </tr>
              ) : (
                recentResources.map((r) => (
                  <tr key={r._id}>
                    <td style={{ maxWidth: '300px' }}>
                      <div className='fw-semibold text-dark text-wrap'>{r.title}</div>
                    </td>
                    <td>
                      <span className='badge bg-light text-dark border'>{r.subjectCode}</span>
                    </td>
                    <td>
                      <span className='badge bg-secondary bg-opacity-10 text-dark'>{r.resourceType}</span>
                    </td>
                    <td>
                      <span className='badge badge-branch me-1'>{r.branch}</span>
                      <span className='badge badge-sem'>Sem {r.semester}</span>
                    </td>
                    <td>
                      <button
                        type='button'
                        onClick={() => handleToggle(r._id, r.isPublished)}
                        disabled={togglingId === r._id}
                        className={`btn btn-sm py-0 px-2 fw-semibold ${
                          r.isPublished ? 'btn-success' : 'btn-outline-warning'
                        }`}
                        title='Click to toggle status'
                      >
                        {togglingId === r._id ? 'Updating...' : r.isPublished ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className='text-end'>
                      <Link
                        to={`/admin/resources/${r._id}/edit`}
                        className='btn btn-light btn-sm text-primary py-1 px-2 border'
                        title='Edit Resource'
                      >
                        <FiEdit2 size={13} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
