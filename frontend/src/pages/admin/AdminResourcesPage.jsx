import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { adminGetResources, adminTogglePublish, adminDeleteResource } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Pagination } from '../../components/public/Pagination';
import {
  FiPlusCircle,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiExternalLink,
  FiAlertTriangle,
  FiCheck,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';

const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

export const AdminResourcesPage = () => {
  const location = useLocation();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('');
  const [semester, setSemester] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(location.state?.notification || null);

  const fetchResources = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (branch) params.branch = branch;
      if (semester) params.semester = semester;
      if (resourceType) params.resourceType = resourceType;
      if (status) params.status = status;

      const res = await adminGetResources(params);
      if (res.data && res.data.success) {
        setResources(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [page, branch, semester, resourceType, status]);

  // Handle flash message from navigation
  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      // Clean up window history state
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setNotification(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Escape key listener for delete modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && deleteTarget) {
        setDeleteTarget(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleResetFilters = () => {
    setSearch('');
    setBranch('');
    setSemester('');
    setResourceType('');
    setStatus('');
    setPage(1);
  };

  const handleTogglePublish = async (id, currentStatus, title) => {
    try {
      await adminTogglePublish(id, !currentStatus);
      showNotification(
        'success',
        `"${title || 'Resource'}" is now ${!currentStatus ? 'Published (Live)' : 'Draft (Offline)'}.`
      );
      fetchResources();
    } catch (err) {
      showNotification('danger', err.message || 'Failed to update publication status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteResource(deleteTarget._id);
      showNotification('success', `Resource "${deleteTarget.title}" permanently removed.`);
      setDeleteTarget(null);
      fetchResources();
    } catch (err) {
      showNotification('danger', err.message || 'Failed to delete resource');
    } finally {
      setDeleting(false);
    }
  };

  const resolveFileUrl = (url) => {
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
      {/* Header and Add Resource Action */}
      <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4 flex-shrink-0'>
        <div>
          <h1 className='h3 fw-bold mb-1 text-dark'>All Resources</h1>
          <p className='text-muted small mb-0'>
            Search, filter, update, publish, or remove AKTU study materials
          </p>
        </div>

        <div className='d-flex align-items-center gap-2 flex-wrap'>
          <button
            type='button'
            onClick={fetchResources}
            className='btn btn-light btn-sm d-inline-flex align-items-center gap-1 border'
            title='Refresh Resources List'
            aria-label='Refresh resources list'
          >
            <FiRefreshCw size={14} />
            <span className='d-none d-sm-inline'>Sync</span>
          </button>
          <Link
            to='/admin/resources/new'
            className='btn btn-primary-aktu btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 text-nowrap'
          >
            <FiPlusCircle size={15} />
            <span>Add Resource</span>
          </Link>
        </div>
      </div>

      {/* Notifications Toast */}
      {notification && (
        <div
          className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center gap-2 py-2 small shadow-sm mb-4 flex-shrink-0`}
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

      {/* Combined Filter Card */}
      <div className='card border-0 shadow-sm p-3 bg-white rounded-3 mb-4 flex-shrink-0 w-100'>
        <form onSubmit={handleSearchSubmit} className='row g-2 align-items-center'>
          {/* Search Box */}
          <div className='col-xl-3 col-lg-4 col-md-6 col-12'>
            <div className='input-group input-group-sm'>
              <input
                type='search'
                className='form-control'
                placeholder='Search title, subject code...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label='Search resources'
              />
              <button type='submit' className='btn btn-primary-aktu' title='Search'>
                <FiSearch />
              </button>
            </div>
          </div>

          {/* Branch Filter */}
          <div className='col-xl-2 col-lg-2 col-md-3 col-6'>
            <select
              className='form-select form-select-sm'
              value={branch}
              onChange={(e) => {
                setBranch(e.target.value);
                setPage(1);
              }}
              aria-label='Filter by Branch'
            >
              <option value=''>All Branches</option>
              {['CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil'].map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Filter */}
          <div className='col-xl-2 col-lg-2 col-md-3 col-6'>
            <select
              className='form-select form-select-sm'
              value={semester}
              onChange={(e) => {
                setSemester(e.target.value);
                setPage(1);
              }}
              aria-label='Filter by Semester'
            >
              <option value=''>All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>
                  Semester {s}
                </option>
              ))}
            </select>
          </div>

          {/* Resource Type Filter */}
          <div className='col-xl-2 col-lg-2 col-md-4 col-6'>
            <select
              className='form-select form-select-sm'
              value={resourceType}
              onChange={(e) => {
                setResourceType(e.target.value);
                setPage(1);
              }}
              aria-label='Filter by Resource Type'
            >
              <option value=''>All Types</option>
              <option value='Notes'>Notes</option>
              <option value='Syllabus'>Syllabus</option>
              <option value='PYQ'>PYQ (Question Papers)</option>
            </select>
          </div>

          {/* Publication Status Filter */}
          <div className='col-xl-2 col-lg-2 col-md-4 col-6'>
            <select
              className='form-select form-select-sm'
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label='Filter by Publication Status'
            >
              <option value=''>All Statuses</option>
              <option value='published'>Published Only</option>
              <option value='unpublished'>Drafts Only</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          <div className='col-xl-1 col-lg-12 col-md-4 col-12'>
            <button
              type='button'
              onClick={handleResetFilters}
              className='btn btn-light btn-sm w-100 text-secondary border'
              title='Reset all search and filter criteria'
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div className='card border-0 shadow-sm bg-white rounded-3 p-5 text-center flex-grow-1 d-flex align-items-center justify-content-center w-100'>
          <LoadingSpinner message='Loading resources table...' />
        </div>
      ) : error ? (
        <div className='flex-grow-1 w-100'>
          <ErrorMessage title='Error Loading Resources' message={error} onRetry={fetchResources} />
        </div>
      ) : (
        <div className='card border-0 shadow-sm bg-white rounded-3 flex-grow-1 d-flex flex-column w-100'>
          <div className='table-responsive'>
            <table className='table table-hover align-middle mb-0 small w-100'>
              <thead className='table-light'>
                <tr>
                  <th style={{ minWidth: '240px' }}>Title &amp; Subject</th>
                  <th style={{ minWidth: '100px' }}>Type</th>
                  <th style={{ minWidth: '90px' }}>Branch</th>
                  <th style={{ minWidth: '80px' }}>Sem</th>
                  <th style={{ minWidth: '110px' }}>Status</th>
                  <th className='text-end' style={{ minWidth: '130px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan='6' className='text-center py-5 text-muted'>
                      <div className='mb-1 fw-semibold'>No resources match the selected criteria.</div>
                      <div className='small'>Try clearing filters or search term to see more results.</div>
                    </td>
                  </tr>
                ) : (
                  resources.map((r) => (
                    <tr key={r._id}>
                      <td style={{ minWidth: '240px' }}>
                        <div className='fw-bold text-dark text-break'>{r.title}</div>
                        <div className='text-muted small mt-1 d-flex align-items-center flex-wrap gap-1'>
                          <span className='badge bg-light text-dark border'>{r.subjectCode}</span>
                          <span className='text-truncate'>{r.subjectName}</span>
                        </div>
                      </td>
                      <td>
                        <span className='badge bg-secondary bg-opacity-10 text-dark'>{r.resourceType}</span>
                      </td>
                      <td>
                        <span className='badge badge-branch'>{r.branch}</span>
                      </td>
                      <td>
                        <span className='badge badge-sem'>Sem {r.semester}</span>
                      </td>
                      <td>
                        <button
                          type='button'
                          onClick={() => handleTogglePublish(r._id, r.isPublished, r.title)}
                          className={`btn btn-sm py-0 px-2 fw-semibold ${
                            r.isPublished ? 'btn-success' : 'btn-outline-warning'
                          }`}
                          title='Click to toggle status'
                        >
                          {r.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className='text-end'>
                        <div className='d-inline-flex gap-1'>
                          <a
                            href={resolveFileUrl(r.downloadUrl || r.fileUrl)}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='btn btn-light btn-sm text-secondary border'
                            title='Test PDF Link'
                            aria-label={`Test PDF Link for ${r.title}`}
                          >
                            <FiExternalLink size={13} />
                          </a>
                          <Link
                            to={`/admin/resources/${r._id}/edit`}
                            className='btn btn-light btn-sm text-primary border'
                            title='Edit Resource'
                            aria-label={`Edit ${r.title}`}
                          >
                            <FiEdit2 size={13} />
                          </Link>
                          <button
                            type='button'
                            onClick={() => setDeleteTarget(r)}
                            className='btn btn-light btn-sm text-danger border'
                            title='Delete Resource'
                            aria-label={`Delete ${r.title}`}
                          >
                            <FiTrash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Container */}
          {pagination.totalPages > 1 && (
            <div className='p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2 mt-auto'>
              <div className='small text-muted'>
                Showing {resources.length} of {pagination.total} items
              </div>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalCount={pagination.total}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal Before Destructive Action */}
      {deleteTarget && (
        <div
          className='modal show d-block'
          tabIndex='-1'
          style={{ backgroundColor: 'rgba(10,30,59,0.65)', backdropFilter: 'blur(2px)', zIndex: 1060 }}
          role='dialog'
          aria-modal='true'
          aria-labelledby='delete-modal-title'
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null);
          }}
        >
          <div className='modal-dialog modal-dialog-centered'>
            <div className='modal-content border-0 shadow-lg rounded-3'>
              <div className='modal-header border-bottom-0 pb-0'>
                <div className='d-flex align-items-center gap-2 text-danger'>
                  <FiAlertTriangle size={22} />
                  <h2 className='modal-title fw-bold text-dark fs-6' id='delete-modal-title'>
                    Confirm Delete Resource
                  </h2>
                </div>
                <button
                  type='button'
                  className='btn-close'
                  onClick={() => setDeleteTarget(null)}
                  aria-label='Close dialog'
                />
              </div>

              <div className='modal-body py-3'>
                <p className='small mb-2'>
                  Are you sure you want to permanently remove this academic resource?
                </p>
                <div className='p-3 bg-light rounded border small mb-2'>
                  <strong className='text-dark d-block text-wrap mb-1'>{deleteTarget.title}</strong>
                  <div className='text-muted'>
                    {deleteTarget.subjectCode} &bull; {deleteTarget.subjectName} ({deleteTarget.branch}, Sem{' '}
                    {deleteTarget.semester})
                  </div>
                </div>
                <p className='small text-danger mb-0'>
                  This action is permanent and cannot be undone. Associated student reports will also be cleared.
                </p>
              </div>

              <div className='modal-footer border-top-0 pt-0 gap-2'>
                <button
                  type='button'
                  className='btn btn-sm btn-light border px-3'
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  autoFocus
                >
                  Cancel
                </button>
                <button
                  type='button'
                  className='btn btn-sm btn-danger px-3 d-inline-flex align-items-center gap-1'
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <FiTrash2 size={13} />
                  <span>{deleting ? 'Deleting...' : 'Delete Permanently'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
