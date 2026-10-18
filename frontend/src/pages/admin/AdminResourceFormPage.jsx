import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminCreateResource, adminGetResourceById, adminUpdateResource } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { FiArrowLeft, FiSave, FiExternalLink, FiAlertCircle } from 'react-icons/fi';

const YEAR_SEMESTER_MAP = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8]
};

export const AdminResourceFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 2,
    semester: 3,
    subjectCode: '',
    subjectName: '',
    fileUrl: '',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: '',
    isPublished: true
  });

  useEffect(() => {
    if (isEdit) {
      const fetchResource = async () => {
        try {
          const res = await adminGetResourceById(id);
          if (res.data && res.data.success) {
            const data = res.data.data;
            setFormData({
              title: data.title || '',
              resourceType: data.resourceType || 'Notes',
              branch: data.branch || 'CSE',
              year: data.year || 1,
              semester: data.semester || 1,
              subjectCode: data.subjectCode || '',
              subjectName: data.subjectName || '',
              fileUrl: data.fileUrl || '',
              academicYear: data.academicYear || '',
              regulation: data.regulation || '',
              description: data.description || '',
              isPublished: Boolean(data.isPublished)
            });
          }
        } catch (err) {
          setError(err.message || 'Failed to load resource data');
        } finally {
          setLoading(false);
        }
      };
      fetchResource();
    }
  }, [id, isEdit]);

  const handleYearChange = (e) => {
    const yr = Number(e.target.value);
    const validSems = YEAR_SEMESTER_MAP[yr] || [1, 2];
    setFormData(prev => ({
      ...prev,
      year: yr,
      semester: validSems.includes(prev.semester) ? prev.semester : validSems[0]
    }));
  };

  const allowedSemesters = YEAR_SEMESTER_MAP[formData.year] || [1, 2, 3, 4, 5, 6, 7, 8];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = {};
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    }
    if (!formData.subjectCode.trim()) {
      errors.subjectCode = 'Subject code is required.';
    }
    if (!formData.subjectName.trim()) {
      errors.subjectName = 'Subject name is required.';
    }
    if (!formData.fileUrl.trim().startsWith('https://')) {
      errors.fileUrl = 'File URL must be a valid secure HTTPS link.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        await adminUpdateResource(id, formData);
      } else {
        await adminCreateResource(formData);
      }
      navigate('/admin/resources');
    } catch (err) {
      setError(err.message || 'Failed to save resource. Please verify fields.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message='Loading resource editor...' />;

  return (
    <div style={{ maxWidth: '850px' }}>
      <div className='mb-3'>
        <Link to='/admin/resources' className='small text-secondary text-decoration-none d-inline-flex align-items-center gap-1'>
          <FiArrowLeft size={13} />
          <span>Back to Resources List</span>
        </Link>
      </div>

      <div className='card border-0 shadow-sm p-4 bg-white rounded-3'>
        <h1 className='h4 fw-bold mb-1 text-dark'>
          {isEdit ? 'Edit Resource' : 'Add New Academic Resource'}
        </h1>
        <p className='text-muted small mb-4'>
          All fields are validated on the backend. PDF URLs must point to approved secure storage providers.
        </p>

        {error && (
          <div className='alert alert-danger py-2 d-flex align-items-center gap-2 small mb-4' role='alert'>
            <FiAlertCircle className='flex-shrink-0' size={16} />
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className='mb-3'>
            <label htmlFor='res-title' className='form-label small fw-semibold text-secondary'>
              Resource Title <span className='text-danger'>*</span>
            </label>
            <input
              type='text'
              id='res-title'
              className={`form-control form-control-sm ${fieldErrors.title ? 'is-invalid' : ''}`}
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder='e.g. Data Structures and Algorithms Complete Revision Notes'
            />
            {fieldErrors.title && <div className='invalid-feedback small'>{fieldErrors.title}</div>}
          </div>

          <div className='row g-3 mb-3'>
            <div className='col-md-4'>
              <label htmlFor='res-type' className='form-label small fw-semibold text-secondary'>
                Resource Type <span className='text-danger'>*</span>
              </label>
              <select
                id='res-type'
                className='form-select form-select-sm'
                value={formData.resourceType}
                onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                required
              >
                <option value='Notes'>Notes</option>
                <option value='Syllabus'>Syllabus</option>
                <option value='PYQ'>PYQ (Question Paper)</option>
              </select>
            </div>

            <div className='col-md-4'>
              <label htmlFor='res-branch' className='form-label small fw-semibold text-secondary'>
                Branch <span className='text-danger'>*</span>
              </label>
              <select
                id='res-branch'
                className='form-select form-select-sm'
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                required
              >
                {['CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil'].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className='col-md-2 col-6'>
              <label htmlFor='res-year' className='form-label small fw-semibold text-secondary'>
                Year <span className='text-danger'>*</span>
              </label>
              <select
                id='res-year'
                className='form-select form-select-sm'
                value={formData.year}
                onChange={handleYearChange}
                required
              >
                <option value='1'>1st Year</option>
                <option value='2'>2nd Year</option>
                <option value='3'>3rd Year</option>
                <option value='4'>4th Year</option>
              </select>
            </div>

            <div className='col-md-2 col-6'>
              <label htmlFor='res-semester' className='form-label small fw-semibold text-secondary'>
                Semester <span className='text-danger'>*</span>
              </label>
              <select
                id='res-semester'
                className='form-select form-select-sm'
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                required
              >
                {allowedSemesters.map(s => (
                  <option key={s} value={s}>Sem {s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className='row g-3 mb-3'>
            <div className='col-md-4'>
              <label htmlFor='res-code' className='form-label small fw-semibold text-secondary'>
                Subject Code <span className='text-danger'>*</span>
              </label>
              <input
                type='text'
                id='res-code'
                className={`form-control form-control-sm text-uppercase ${fieldErrors.subjectCode ? 'is-invalid' : ''}`}
                required
                value={formData.subjectCode}
                onChange={(e) => setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })}
                placeholder='e.g. KCS301'
              />
              {fieldErrors.subjectCode && <div className='invalid-feedback small'>{fieldErrors.subjectCode}</div>}
            </div>

            <div className='col-md-8'>
              <label htmlFor='res-name' className='form-label small fw-semibold text-secondary'>
                Subject Name <span className='text-danger'>*</span>
              </label>
              <input
                type='text'
                id='res-name'
                className={`form-control form-control-sm ${fieldErrors.subjectName ? 'is-invalid' : ''}`}
                required
                value={formData.subjectName}
                onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                placeholder='e.g. Data Structures and Algorithms'
              />
              {fieldErrors.subjectName && <div className='invalid-feedback small'>{fieldErrors.subjectName}</div>}
            </div>
          </div>

          <div className='mb-3'>
            <div className='d-flex justify-content-between align-items-center mb-1'>
              <label htmlFor='res-url' className='form-label small fw-semibold text-secondary mb-0'>
                Secure PDF File URL (HTTPS) <span className='text-danger'>*</span>
              </label>
              {formData.fileUrl && (
                <a
                  href={formData.fileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='small text-decoration-none d-inline-flex align-items-center gap-1'
                >
                  <span>Test Link</span>
                  <FiExternalLink size={12} />
                </a>
              )}
            </div>
            <input
              type='url'
              id='res-url'
              className={`form-control form-control-sm ${fieldErrors.fileUrl ? 'is-invalid' : ''}`}
              required
              value={formData.fileUrl}
              onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
              placeholder='https://drive.google.com/file/d/.../view or raw GitHub, AWS S3 URL'
            />
            {fieldErrors.fileUrl ? (
              <div className='invalid-feedback small'>{fieldErrors.fileUrl}</div>
            ) : (
              <div className='form-text small text-muted'>
                Approved storage hosts: Google Drive, OneDrive, GitHub raw, AWS S3, Cloudinary, Firebase.
              </div>
            )}
          </div>

          <div className='row g-3 mb-3'>
            <div className='col-md-6'>
              <label htmlFor='res-acad-year' className='form-label small fw-semibold text-secondary'>
                Academic Year (Optional)
              </label>
              <input
                type='text'
                id='res-acad-year'
                className='form-control form-control-sm'
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                placeholder='e.g. 2024-25'
              />
            </div>

            <div className='col-md-6'>
              <label htmlFor='res-regulation' className='form-label small fw-semibold text-secondary'>
                Regulation (Optional)
              </label>
              <input
                type='text'
                id='res-regulation'
                className='form-control form-control-sm'
                value={formData.regulation}
                onChange={(e) => setFormData({ ...formData, regulation: e.target.value })}
                placeholder='e.g. CBCS, K-Series'
              />
            </div>
          </div>

          <div className='mb-3'>
            <label htmlFor='res-desc' className='form-label small fw-semibold text-secondary'>
              Description / Notes Summary
            </label>
            <textarea
              id='res-desc'
              className='form-control form-control-sm'
              rows='3'
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder='Brief summary of topics covered in this document...'
            ></textarea>
          </div>

          <div className='form-check form-switch mb-4'>
            <input
              type='checkbox'
              id='res-published'
              className='form-check-input'
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
            />
            <label htmlFor='res-published' className='form-check-label small fw-semibold text-dark'>
              Publish to public directory immediately
            </label>
          </div>

          <div className='d-flex gap-2 justify-content-end pt-3 border-top'>
            <Link to='/admin/resources' className='btn btn-light btn-sm px-3'>
              Cancel
            </Link>
            <button
              type='submit'
              className='btn btn-primary-aktu btn-sm px-4 d-inline-flex align-items-center gap-2'
              disabled={submitting}
            >
              <FiSave size={14} />
              <span>{submitting ? 'Saving...' : isEdit ? 'Update Resource' : 'Save & Publish'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
