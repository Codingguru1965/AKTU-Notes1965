import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  adminCreateResource,
  adminGetResourceById,
  adminUpdateResource,
  adminUploadPdf
} from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  FiArrowLeft,
  FiArrowRight,
  FiSave,
  FiExternalLink,
  FiAlertCircle,
  FiFileText,
  FiUploadCloud,
  FiTrash2,
  FiRefreshCw,
  FiCheck
} from 'react-icons/fi';

const YEAR_SEMESTER_MAP = {
  1: [1, 2],
  2: [3, 4],
  3: [5, 6],
  4: [7, 8]
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const AdminResourceFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Workflow Step: 1 = Details & PDF Document, 2 = Review & Confirm
  const [step, setStep] = useState(1);

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Mode: 'upload' for local PDF upload, 'url' for external HTTPS links
  const [pdfMode, setPdfMode] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    university: 'AKTU',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 2,
    semester: 3,
    subjectCode: '',
    subjectName: '',
    fileUrl: '',
    academicYear: '2024-25',
    regulation: '',
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
              university: data.university || 'AKTU',
              resourceType: data.resourceType || 'Notes',
              branch: data.branch || 'CSE',
              year: data.year || 1,
              semester: data.semester || 1,
              subjectCode: data.subjectCode || '',
              subjectName: data.subjectName || '',
              fileUrl: data.fileUrl || '',
              academicYear: data.academicYear || '',
              regulation: data.regulation || '',
              isPublished: Boolean(data.isPublished)
            });

            // If existing resource has an external URL, set mode to 'url'
            if (data.fileUrl && !data.fileUrl.startsWith('/uploads/')) {
              setPdfMode('url');
            } else {
              setPdfMode('upload');
            }
          }
        } catch (err) {
          setSubmitError(err.message || 'Failed to load existing resource details');
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
    setFormData((prev) => ({
      ...prev,
      year: yr,
      semester: validSems.includes(prev.semester) ? prev.semester : validSems[0]
    }));
  };

  const allowedSemesters = YEAR_SEMESTER_MAP[formData.year] || [1, 2, 3, 4, 5, 6, 7, 8];

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setFieldErrors((prev) => ({
        ...prev,
        file: 'Please select a valid PDF file (.pdf extension).'
      }));
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setFieldErrors((prev) => ({
        ...prev,
        file: 'PDF file size exceeds 30 MB limit.'
      }));
      return;
    }

    setSelectedFile(file);
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy.file;
      return copy;
    });
  };

  // Step 1 Validation -> Move to Review (Save & Next)
  const handleSaveAndNext = (e) => {
    e.preventDefault();
    setSubmitError('');
    const errors = {};

    if (!formData.title.trim() || formData.title.trim().length < 3) {
      errors.title = 'Resource title must be at least 3 characters.';
    }
    if (!formData.subjectCode.trim()) {
      errors.subjectCode = 'Subject code is required.';
    }
    if (!formData.subjectName.trim()) {
      errors.subjectName = 'Subject name is required.';
    }

    // PDF validation
    if (pdfMode === 'upload') {
      if (!selectedFile && !formData.fileUrl) {
        errors.file = 'Please upload a local PDF file.';
      }
    } else {
      if (!formData.fileUrl.trim()) {
        errors.fileUrl = 'Secure PDF file URL is required.';
      } else if (!formData.fileUrl.trim().startsWith('https://')) {
        errors.fileUrl = 'External PDF URL must be a valid secure HTTPS link.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStep(2); // Proceed to Review step
  };

  // Step 2 Submission -> Upload local PDF if needed, then Publish / Save
  const handlePublish = async () => {
    setSubmitting(true);
    setSubmitError('');

    try {
      let finalFileUrl = formData.fileUrl;

      // If a local file was selected, upload it now
      if (pdfMode === 'upload' && selectedFile) {
        const uploadRes = await adminUploadPdf(selectedFile);
        if (uploadRes.data && uploadRes.data.success) {
          finalFileUrl = uploadRes.data.data.fileUrl;
        } else {
          throw new Error('Failed to upload PDF file to server');
        }
      }

      const payload = {
        title: formData.title.trim(),
        university: formData.university.trim() || 'AKTU',
        resourceType: formData.resourceType,
        branch: formData.branch,
        year: formData.year,
        semester: formData.semester,
        subjectCode: formData.subjectCode.trim().toUpperCase(),
        subjectName: formData.subjectName.trim(),
        fileUrl: finalFileUrl,
        academicYear: formData.academicYear.trim(),
        regulation: formData.regulation.trim(),
        isPublished: formData.isPublished
      };

      if (isEdit) {
        await adminUpdateResource(id, payload);
        navigate('/admin/resources', {
          state: {
            notification: {
              type: 'success',
              message: `Resource "${payload.title}" updated successfully.`
            }
          }
        });
      } else {
        await adminCreateResource(payload);
        navigate('/admin/resources', {
          state: {
            notification: {
              type: 'success',
              message: `Resource "${payload.title}" published successfully.`
            }
          }
        });
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to save resource. Please verify all details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message='Loading resource editor...' />;

  return (
    <div
      className='d-flex flex-column flex-grow-1 w-100 pb-5'
      style={{ minWidth: 0, maxWidth: 'none' }}
    >
      {/* Navigation Breadcrumb */}
      <div className='mb-3'>
        <Link
          to='/admin/resources'
          className='small text-secondary text-decoration-none d-inline-flex align-items-center gap-1'
        >
          <FiArrowLeft size={13} />
          <span>Back to Resources List</span>
        </Link>
      </div>

      {/* Main Workflow Card */}
      <div className='card border-0 shadow-sm p-4 bg-white rounded-3 w-100'>
        {/* Step Indicator Header */}
        <div className='d-flex align-items-center justify-content-between border-bottom pb-3 mb-4'>
          <div>
            <h1 className='h4 fw-bold mb-1 text-dark'>
              {isEdit ? 'Edit Academic Resource' : 'Add New Academic Resource'}
            </h1>
            <p className='text-muted small mb-0'>
              {step === 1
                ? 'Step 1 of 2: Enter academic details and attach PDF document'
                : 'Step 2 of 2: Review details before publishing'}
            </p>
          </div>

          <div className='d-flex align-items-center gap-2'>
            <div className={`form-step-badge ${step === 1 ? 'active' : 'done'}`}>
              {step > 1 ? <FiCheck size={14} /> : '1'}
            </div>
            <span className='small fw-semibold d-none d-sm-inline text-muted me-2'>Details</span>
            <span className='text-muted small d-none d-sm-inline'>&rarr;</span>
            <div className={`form-step-badge ${step === 2 ? 'active' : 'inactive'}`}>2</div>
            <span className='small fw-semibold d-none d-sm-inline text-muted'>Review</span>
          </div>
        </div>

        {/* Error Notification Alert */}
        {submitError && (
          <div className='alert alert-danger py-2 d-flex align-items-center gap-2 small mb-4' role='alert'>
            <FiAlertCircle className='flex-shrink-0' size={18} />
            <div className='flex-grow-1'>{submitError}</div>
          </div>
        )}

        {/* =========================================================================
            STEP 1: DETAILS & PDF DOCUMENT FORM
           ========================================================================= */}
        {step === 1 && (
          <form onSubmit={handleSaveAndNext}>
            {/* Title */}
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

            {/* University & Resource Type */}
            <div className='row g-3 mb-3'>
              <div className='col-md-6 col-12'>
                <label htmlFor='res-university' className='form-label small fw-semibold text-secondary'>
                  Board / University <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  id='res-university'
                  className='form-control form-control-sm'
                  required
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder='e.g. AKTU / Dr. A.P.J. Abdul Kalam Technical University'
                />
                <div className='form-text small text-muted'>
                  Affiliated board or examining university
                </div>
              </div>

              <div className='col-md-6 col-12'>
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
            </div>

            {/* Branch, Year, Semester */}
            <div className='row g-3 mb-3'>
              <div className='col-md-4 col-12'>
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
                  {['CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil'].map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className='col-md-4 col-6'>
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

              <div className='col-md-4 col-6'>
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
                  {allowedSemesters.map((s) => (
                    <option key={s} value={s}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject Code & Subject Name */}
            <div className='row g-3 mb-3'>
              <div className='col-md-4 col-12'>
                <label htmlFor='res-code' className='form-label small fw-semibold text-secondary'>
                  Subject Code <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  id='res-code'
                  className={`form-control form-control-sm text-uppercase ${
                    fieldErrors.subjectCode ? 'is-invalid' : ''
                  }`}
                  required
                  value={formData.subjectCode}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectCode: e.target.value.toUpperCase() })
                  }
                  placeholder='e.g. KCS301'
                />
                {fieldErrors.subjectCode && (
                  <div className='invalid-feedback small'>{fieldErrors.subjectCode}</div>
                )}
              </div>

              <div className='col-md-8 col-12'>
                <label htmlFor='res-name' className='form-label small fw-semibold text-secondary'>
                  Subject Name <span className='text-danger'>*</span>
                </label>
                <input
                  type='text'
                  id='res-name'
                  className={`form-control form-control-sm ${
                    fieldErrors.subjectName ? 'is-invalid' : ''
                  }`}
                  required
                  value={formData.subjectName}
                  onChange={(e) => setFormData({ ...formData, subjectName: e.target.value })}
                  placeholder='e.g. Data Structures and Algorithms'
                />
                {fieldErrors.subjectName && (
                  <div className='invalid-feedback small'>{fieldErrors.subjectName}</div>
                )}
              </div>
            </div>

            {/* Academic Year */}
            <div className='row g-3 mb-4'>
              <div className='col-md-6 col-12'>
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
            </div>

            {/* PDF Attachment Section: Local Upload vs External URL */}
            <div className='card border bg-light p-3 rounded-3 mb-4'>
              <div className='d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 mb-3'>
                <label className='form-label small fw-bold text-dark mb-0'>
                  PDF Document Source <span className='text-danger'>*</span>
                </label>

                {/* Switch between Local Upload and External URL */}
                <div className='btn-group btn-group-sm' role='group' aria-label='PDF Source Toggle'>
                  <button
                    type='button'
                    className={`btn ${pdfMode === 'upload' ? 'btn-primary-aktu' : 'btn-outline-secondary'}`}
                    onClick={() => setPdfMode('upload')}
                  >
                    Local PDF Upload
                  </button>
                  <button
                    type='button'
                    className={`btn ${pdfMode === 'url' ? 'btn-primary-aktu' : 'btn-outline-secondary'}`}
                    onClick={() => setPdfMode('url')}
                  >
                    External PDF Link
                  </button>
                </div>
              </div>

              {/* Mode 1: Local PDF Upload */}
              {pdfMode === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.pdf,application/pdf'
                    className='d-none'
                    onChange={handleFileInputChange}
                    id='local-pdf-input'
                  />

                  {selectedFile ? (
                    <div className='p-3 bg-white rounded border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3'>
                      <div className='d-flex align-items-center gap-3 min-w-0'>
                        <div className='p-2 bg-danger bg-opacity-10 text-danger rounded flex-shrink-0'>
                          <FiFileText size={24} />
                        </div>
                        <div className='min-w-0'>
                          <div className='fw-bold text-dark text-break small'>
                            {selectedFile.name}
                          </div>
                          <div className='text-muted small'>
                            {formatFileSize(selectedFile.size)} &bull; Ready for upload on Publish
                          </div>
                        </div>
                      </div>

                      <div className='d-flex gap-2 flex-shrink-0'>
                        <button
                          type='button'
                          onClick={() => fileInputRef.current?.click()}
                          className='btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1'
                          title='Replace with another PDF'
                        >
                          <FiRefreshCw size={13} />
                          <span>Replace</span>
                        </button>
                        <button
                          type='button'
                          onClick={() => {
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className='btn btn-outline-danger btn-sm'
                          title='Remove selected PDF'
                        >
                          <FiTrash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ) : formData.fileUrl && formData.fileUrl.startsWith('/uploads/') ? (
                    <div className='p-3 bg-white rounded border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3'>
                      <div className='d-flex align-items-center gap-3 min-w-0'>
                        <div className='p-2 bg-success bg-opacity-10 text-success rounded flex-shrink-0'>
                          <FiFileText size={24} />
                        </div>
                        <div className='min-w-0'>
                          <div className='fw-bold text-dark text-break small'>
                            Existing Attached PDF ({formData.fileUrl.split('/').pop()})
                          </div>
                          <div className='text-muted small'>
                            Stored locally on server. Choose a replacement below to overwrite.
                          </div>
                        </div>
                      </div>

                      <button
                        type='button'
                        onClick={() => fileInputRef.current?.click()}
                        className='btn btn-outline-primary btn-sm flex-shrink-0'
                      >
                        Upload Replacement
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`pdf-upload-dropzone ${dragActive ? 'dragging' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleFileDrop}
                      onClick={() => fileInputRef.current?.click()}
                      role='button'
                      tabIndex='0'
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                      }}
                      aria-label='Click or drag and drop to select a PDF file'
                    >
                      <FiUploadCloud size={36} className='text-primary opacity-75 mb-2' />
                      <div className='fw-bold text-dark small mb-1'>
                        Click to choose a PDF or drag and drop here
                      </div>
                      <div className='text-muted' style={{ fontSize: '0.8rem' }}>
                        Supports genuine .pdf documents up to 30 MB
                      </div>
                    </div>
                  )}

                  {fieldErrors.file && (
                    <div className='text-danger small mt-2 d-flex align-items-center gap-1'>
                      <FiAlertCircle size={14} />
                      <span>{fieldErrors.file}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Mode 2: External PDF Link */}
              {pdfMode === 'url' && (
                <div>
                  <div className='d-flex justify-content-between align-items-center mb-1'>
                    <label htmlFor='res-url' className='form-label small text-secondary mb-0'>
                      External Secure HTTPS URL
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
                    value={formData.fileUrl}
                    onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                    placeholder='https://drive.google.com/file/d/.../view or raw GitHub, AWS S3 URL'
                  />
                  {fieldErrors.fileUrl ? (
                    <div className='invalid-feedback small'>{fieldErrors.fileUrl}</div>
                  ) : (
                    <div className='form-text small text-muted'>
                      Approved providers: Google Drive, OneDrive, GitHub, AWS S3, Cloudinary, Firebase, Archive.org
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className='d-flex gap-2 justify-content-end pt-3 border-top flex-wrap'>
              <Link to='/admin/resources' className='btn btn-light btn-sm px-3 border'>
                Cancel
              </Link>
              <button
                type='submit'
                className='btn btn-primary-aktu btn-sm px-4 d-inline-flex align-items-center gap-2'
              >
                <span>Save &amp; Next</span>
                <FiArrowRight size={14} />
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            STEP 2: REVIEW & PUBLISH CONFIRMATION
           ========================================================================= */}
        {step === 2 && (
          <div>
            <div className='alert alert-info py-2 small mb-4'>
              <strong>Review Details:</strong> Please verify all resource information and PDF document attachment before publishing.
            </div>

            {/* Summary Review Card */}
            <div className='bg-light rounded-3 p-3 p-sm-4 border mb-4'>
              <div className='row g-3'>
                <div className='col-12'>
                  <div className='text-muted small fw-semibold'>Resource Title</div>
                  <div className='fw-bold text-dark fs-6 text-break'>{formData.title}</div>
                </div>

                <div className='col-md-6 col-12'>
                  <div className='text-muted small fw-semibold'>Board / University</div>
                  <div className='text-dark fw-semibold'>{formData.university}</div>
                </div>

                <div className='col-md-6 col-12'>
                  <div className='text-muted small fw-semibold'>Resource Type</div>
                  <div>
                    <span className='badge bg-secondary bg-opacity-10 text-dark'>
                      {formData.resourceType}
                    </span>
                  </div>
                </div>

                <div className='col-md-6 col-12'>
                  <div className='text-muted small fw-semibold'>Subject</div>
                  <div className='text-dark'>
                    <span className='badge bg-light text-dark border me-1'>{formData.subjectCode}</span>
                    <span className='fw-semibold'>{formData.subjectName}</span>
                  </div>
                </div>

                <div className='col-md-6 col-12'>
                  <div className='text-muted small fw-semibold'>Academic Branch &amp; Semester</div>
                  <div className='text-dark'>
                    <span className='badge badge-branch me-1'>{formData.branch}</span>
                    <span className='badge badge-sem me-1'>Sem {formData.semester}</span>
                    <span className='text-muted small'>({formData.year} Year)</span>
                  </div>
                </div>

                <div className='col-md-6 col-12'>
                  <div className='text-muted small fw-semibold'>Academic Year</div>
                  <div className='text-dark'>{formData.academicYear || 'None specified'}</div>
                </div>

                {/* PDF Document Summary */}
                <div className='col-12 border-top pt-3'>
                  <div className='text-muted small fw-semibold mb-1'>Attached PDF Document</div>
                  {pdfMode === 'upload' && selectedFile ? (
                    <div className='d-flex align-items-center gap-2 p-2 bg-white rounded border'>
                      <FiFileText className='text-danger flex-shrink-0' size={20} />
                      <div className='min-w-0 flex-grow-1'>
                        <div className='fw-bold text-dark small text-break'>{selectedFile.name}</div>
                        <div className='text-muted' style={{ fontSize: '0.78rem' }}>
                          Local File ({formatFileSize(selectedFile.size)}) &bull; Will be securely stored on server
                        </div>
                      </div>
                      <span className='badge bg-success bg-opacity-10 text-success small flex-shrink-0'>
                        Local PDF
                      </span>
                    </div>
                  ) : formData.fileUrl ? (
                    <div className='d-flex align-items-center gap-2 p-2 bg-white rounded border'>
                      <FiExternalLink className='text-primary flex-shrink-0' size={18} />
                      <div className='min-w-0 flex-grow-1'>
                        <div className='fw-semibold text-dark small text-break'>{formData.fileUrl}</div>
                        <div className='text-muted' style={{ fontSize: '0.78rem' }}>
                          External Storage Link
                        </div>
                      </div>
                      <a
                        href={formData.fileUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='btn btn-outline-secondary btn-sm py-0 px-2'
                      >
                        Preview
                      </a>
                    </div>
                  ) : (
                    <div className='text-danger small'>No PDF file attached!</div>
                  )}
                </div>
              </div>
            </div>

            {/* Publication Status Switch */}
            <div className='form-check form-switch p-3 bg-light rounded border mb-4'>
              <input
                type='checkbox'
                id='review-publish-toggle'
                className='form-check-input ms-0 me-2'
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <label htmlFor='review-publish-toggle' className='form-check-label small fw-bold text-dark'>
                Publish immediately (Visible to students on public portal)
              </label>
              <div className='text-muted' style={{ fontSize: '0.8rem', marginLeft: '2.5rem' }}>
                If unchecked, this resource will be saved as an offline draft.
              </div>
            </div>

            {/* Action Buttons: Back vs Publish */}
            <div className='d-flex justify-content-between align-items-center pt-3 border-top flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => setStep(1)}
                disabled={submitting}
                className='btn btn-light btn-sm px-3 border d-inline-flex align-items-center gap-1'
              >
                <FiArrowLeft size={14} />
                <span>Back to Edit Details</span>
              </button>

              <div className='d-flex gap-2 flex-wrap'>
                <Link to='/admin/resources' className='btn btn-light btn-sm px-3 border'>
                  Cancel
                </Link>
                <button
                  type='button'
                  onClick={handlePublish}
                  disabled={submitting}
                  className='btn btn-primary-aktu btn-sm px-4 d-inline-flex align-items-center gap-2'
                >
                  <FiSave size={14} />
                  <span>
                    {submitting
                      ? 'Publishing...'
                      : isEdit
                      ? 'Update Resource'
                      : formData.isPublished
                      ? 'Publish Resource'
                      : 'Save as Draft'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
