import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminGetResources, adminTogglePublish, adminDeleteResource } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { Pagination } from '../../components/public/Pagination';
import { FiPlusCircle, FiSearch, FiEdit2, FiTrash2, FiExternalLink, FiAlertTriangle } from 'react-icons/fi';

export const AdminResourcesPage = () => {
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchResources();
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await adminTogglePublish(id, !currentStatus);
      fetchResources();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminDeleteResource(deleteTarget._id);
      setDeleteTarget(null);
      fetchResources();
    } catch (err) {
      alert(err.message || 'Failed to delete resource');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-4'>
        <div>
          <h1 className='h3 fw-bold mb-1 text-dark'>Manage Resources</h1>
          <p className='text-muted small mb-0'>Create, publish, edit, or remove AKTU study materials</p>
        </div>
        <Link to='/admin/resources/new' className='btn btn-primary-aktu btn-sm d-inline-flex align-items-center gap-2 px-3 py-2'>
          <FiPlusCircle size={15} />
          <span>Add New Resource</span>
        </Link>
      </div>

      <div className='card border-0 shadow-sm p-3 bg-white rounded-3 mb-4'>
        <form onSubmit={handleSearchSubmit} className='row g-2 align-items-center'>
          <div className='col-lg-3 col-md-6 col-12'>
            <div className='input-group input-group-sm'>
              <input
                type='search'
                className='form-control'
                placeholder='Search title, code...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type='submit' className='btn btn-primary-aktu'><FiSearch /></button>
            </div>
          </div>

          <div className='col-lg-2 col-md-3 col-6'>
            <select className='form-select form-select-sm' value={branch} onChange={(e) => { setBranch(e.target.value); setPage(1); }}>
              <option value=''>All Branches</option>
              {['CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil'].map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div className='col-lg-2 col-md-3 col-6'>
            <select className='form-select form-select-sm' value={semester} onChange={(e) => { setSemester(e.target.value); setPage(1); }}>
              <option value=''>All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <div className='col-lg-2 col-md-3 col-6'>
            <select className='form-select form-select-sm' value={resourceType} onChange={(e) => { setResourceType(e.target.value); setPage(1); }}>
              <option value=''>All Types</option>
              <option value='Syllabus'>Syllabus</option>
              <option value='Notes'>Notes</option>
              <option value='PYQ'>PYQ</option>
            </select>
          </div>

          <div className='col-lg-2 col-md-3 col-6'>
            <select className='form-select form-select-sm' value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value=''>All Statuses</option>
              <option value='published'>Published Only</option>
              <option value='unpublished'>Drafts Only</option>
            </select>
          </div>

          <div className='col-lg-1 col-md-12'>
            <button
              type='button'
              onClick={() => { setSearch(''); setBranch(''); setSemester(''); setResourceType(''); setStatus(''); setPage(1); }}
              className='btn btn-light btn-sm w-100 text-secondary'
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner message='Loading resources table...' />
      ) : error ? (
        <ErrorMessage title='Error' message={error} onRetry={fetchResources} />
      ) : (
        <div className='card border-0 shadow-sm bg-white rounded-3'>
          <div className='table-responsive'>
            <table className='table table-hover align-middle mb-0 small'>
              <thead className='table-light'>
                <tr>
                  <th>Title &amp; Subject</th>
                  <th>Type</th>
                  <th>Branch</th>
                  <th>Sem</th>
                  <th>Status</th>
                  <th className='text-end'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {resources.length === 0 ? (
                  <tr>
                    <td colSpan='6' className='text-center py-4 text-muted'>
                      No resources found matching the criteria.
                    </td>
                  </tr>
                ) : (
                  resources.map(r => (
                    <tr key={r._id}>
                      <td style={{ maxWidth: '300px' }}>
                        <div className='fw-bold text-dark text-truncate'>{r.title}</div>
                        <div className='text-muted small'>
                          <span className='badge bg-light text-dark border me-1'>{r.subjectCode}</span>
                          {r.subjectName}
                        </div>
                      </td>
                      <td>
                        <span className='badge bg-secondary bg-opacity-10 text-dark'>{r.resourceType}</span>
                      </td>
                      <td><span className='badge badge-branch'>{r.branch}</span></td>
                      <td>Sem {r.semester}</td>
                      <td>
                        <button
                          type='button'
                          onClick={() => handleTogglePublish(r._id, r.isPublished)}
                          className={`btn btn-sm py-0 px-2 fw-semibold ${r.isPublished ? 'btn-success' : 'btn-outline-warning'}`}
                        >
                          {r.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className='text-end'>
                        <div className='d-inline-flex gap-1'>
                          <a
                            href={r.downloadUrl || r.fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='btn btn-light btn-sm text-secondary'
                            title='Test link'
                          >
                            <FiExternalLink size={13} />
                          </a>
                          <Link
                            to={`/admin/resources/${r._id}/edit`}
                            className='btn btn-light btn-sm text-primary'
                            title='Edit Resource'
                          >
                            <FiEdit2 size={13} />
                          </Link>
                          <button
                            type='button'
                            onClick={() => setDeleteTarget(r)}
                            className='btn btn-light btn-sm text-danger'
                            title='Delete Resource'
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

          <div className='p-3 border-top'>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalCount={pagination.total}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className='modal show d-block' tabIndex='-1' style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} role='dialog'>
          <div className='modal-dialog modal-dialog-centered'>
            <div className='modal-content border-0 shadow-lg rounded-3'>
              <div className='modal-header border-bottom-0 pb-0'>
                <div className='d-flex align-items-center gap-2 text-danger'>
                  <FiAlertTriangle size={20} />
                  <h5 className='modal-title fw-bold text-dark fs-6'>Confirm Delete Resource</h5>
                </div>
                <button type='button' className='btn-close' onClick={() => setDeleteTarget(null)} aria-label='Close'></button>
              </div>
              <div className='modal-body py-3'>
                <p className='small mb-2'>Are you sure you want to permanently delete this resource?</p>
                <div className='p-2 bg-light rounded border small mb-2'>
                  <strong className='text-dark'>{deleteTarget.title}</strong>
                  <div className='text-muted'>{deleteTarget.subjectCode} - {deleteTarget.subjectName}</div>
                </div>
                <p className='small text-danger mb-0'>This action cannot be undone.</p>
              </div>
              <div className='modal-footer border-top-0 pt-0'>
                <button type='button' className='btn btn-sm btn-light' onClick={() => setDeleteTarget(null)} disabled={deleting}>
                  Cancel
                </button>
                <button type='button' className='btn btn-sm btn-danger px-3' onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
