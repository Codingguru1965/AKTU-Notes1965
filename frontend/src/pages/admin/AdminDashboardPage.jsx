import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetStats, adminTogglePublish } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { FiLayers, FiCheckCircle, FiEyeOff, FiAlertCircle, FiPlusCircle, FiEdit2, FiExternalLink } from 'react-icons/fi';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const handleToggle = async (id, currentStatus) => {
    try {
      await adminTogglePublish(id, !currentStatus);
      fetchStats();
    } catch {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner message='Loading dashboard overview...' />;
  if (error) return <ErrorMessage title='Dashboard Error' message={error} onRetry={fetchStats} />;

  return (
    <div>
      <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4'>
        <div>
          <h1 className='h3 fw-bold mb-1 text-dark'>Admin Dashboard</h1>
          <p className='text-muted small mb-0'>Overview of published resources and portal activity</p>
        </div>
        <Link to='/admin/resources/new' className='btn btn-primary-aktu btn-sm d-inline-flex align-items-center gap-2 px-3 py-2'>
          <FiPlusCircle size={15} />
          <span>Add New Resource</span>
        </Link>
      </div>

      {/* Metrics Row */}
      <div className='row g-3 mb-4'>
        <div className='col-lg-3 col-6'>
          <div className='stats-card card-blue'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div className='text-muted small fw-semibold'>Total Resources</div>
                <div className='h3 fw-bold mb-0 text-dark'>{stats?.total || 0}</div>
              </div>
              <FiLayers size={28} className='text-primary opacity-50' />
            </div>
          </div>
        </div>

        <div className='col-lg-3 col-6'>
          <div className='stats-card card-green'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div className='text-muted small fw-semibold'>Published (Live)</div>
                <div className='h3 fw-bold mb-0 text-success'>{stats?.published || 0}</div>
              </div>
              <FiCheckCircle size={28} className='text-success opacity-50' />
            </div>
          </div>
        </div>

        <div className='col-lg-3 col-6'>
          <div className='stats-card card-amber'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div className='text-muted small fw-semibold'>Drafts / Unpublished</div>
                <div className='h3 fw-bold mb-0 text-warning'>{stats?.unpublished || 0}</div>
              </div>
              <FiEyeOff size={28} className='text-warning opacity-50' />
            </div>
          </div>
        </div>

        <div className='col-lg-3 col-6'>
          <div className='stats-card card-navy'>
            <div className='d-flex justify-content-between align-items-center'>
              <div>
                <div className='text-muted small fw-semibold'>Pending Reports</div>
                <div className='h3 fw-bold mb-0 text-danger'>{stats?.pendingReports || 0}</div>
              </div>
              <FiAlertCircle size={28} className='text-danger opacity-50' />
            </div>
          </div>
        </div>
      </div>

      {/* Breakdowns Row */}
      <div className='row g-4 mb-4'>
        <div className='col-md-6'>
          <div className='card border-0 shadow-sm p-4 bg-white rounded-3 h-100'>
            <h2 className='h6 fw-bold mb-3 text-dark'>Distribution by Material Type</h2>
            <div className='d-flex flex-column gap-2'>
              {['Syllabus', 'Notes', 'PYQ'].map(type => {
                const count = stats?.byType?.[type] || 0;
                const percent = stats?.total ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={type}>
                    <div className='d-flex justify-content-between small fw-semibold mb-1'>
                      <span>{type}</span>
                      <span className='text-muted'>{count} ({percent}%)</span>
                    </div>
                    <div className='progress' style={{ height: '6px' }}>
                      <div className='progress-bar bg-primary' role='progressbar' style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className='col-md-6'>
          <div className='card border-0 shadow-sm p-4 bg-white rounded-3 h-100'>
            <h2 className='h6 fw-bold mb-3 text-dark'>Resources by Engineering Branch</h2>
            <div className='d-flex flex-wrap gap-2'>
              {Object.entries(stats?.byBranch || {}).map(([branch, count]) => (
                <div key={branch} className='p-2 px-3 rounded border bg-light small d-flex align-items-center gap-2'>
                  <strong className='text-dark'>{branch}</strong>
                  <span className='badge bg-secondary rounded-pill'>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Resources Table */}
      <div className='card border-0 shadow-sm bg-white rounded-3'>
        <div className='card-header bg-white border-bottom p-3 d-flex justify-content-between align-items-center'>
          <h2 className='h6 fw-bold mb-0 text-dark'>Recently Added Resources</h2>
          <Link to='/admin/resources' className='small text-decoration-none'>View All &rarr;</Link>
        </div>
        <div className='table-responsive'>
          <table className='table table-hover align-middle mb-0 small'>
            <thead className='table-light'>
              <tr>
                <th>Title</th>
                <th>Code</th>
                <th>Type</th>
                <th>Branch &amp; Sem</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentResources || []).map(r => (
                <tr key={r._id}>
                  <td className='fw-semibold text-dark'>{r.title}</td>
                  <td><span className='badge bg-light text-dark border'>{r.subjectCode}</span></td>
                  <td><span className='badge bg-secondary bg-opacity-10 text-dark'>{r.resourceType}</span></td>
                  <td>{r.branch} &bull; Sem {r.semester}</td>
                  <td>
                    <button
                      type='button'
                      onClick={() => handleToggle(r._id, r.isPublished)}
                      className={`btn btn-sm py-0 px-2 fw-semibold ${r.isPublished ? 'btn-success' : 'btn-outline-warning'}`}
                    >
                      {r.isPublished ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td>
                    <Link to={`/admin/resources/${r._id}/edit`} className='btn btn-light btn-sm text-primary py-0 px-2'>
                      <FiEdit2 size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
