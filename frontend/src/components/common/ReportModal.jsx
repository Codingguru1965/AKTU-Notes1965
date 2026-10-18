import React, { useState } from 'react';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import { submitReport } from '../../services/api';

export const ReportModal = ({ resource, isOpen, onClose }) => {
  const [issueType, setIssueType] = useState('broken_link');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await submitReport({
        resourceId: resource._id,
        resourceTitle: resource.title,
        issueType,
        description: description.trim()
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDescription('');
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='modal show d-block' tabIndex='-1' style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} role='dialog' aria-modal='true'>
      <div className='modal-dialog modal-dialog-centered'>
        <div className='modal-content border-0 shadow-lg rounded-3'>
          <div className='modal-header border-bottom-0 pb-0'>
            <div className='d-flex align-items-center gap-2 text-danger'>
              <FiAlertCircle size={20} />
              <h5 className='modal-title fw-bold text-dark fs-6'>Report Resource Issue</h5>
            </div>
            <button type='button' className='btn-close' onClick={onClose} aria-label='Close'></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className='modal-body py-3'>
              {success ? (
                <div className='alert alert-success d-flex align-items-center gap-2 py-3 mb-0' role='alert'>
                  <FiCheck size={20} className='text-success flex-shrink-0' />
                  <div>
                    <strong>Report Submitted!</strong> Thank you for helping keep AKTU Notes1965 accurate.
                  </div>
                </div>
              ) : (
                <>
                  <div className='p-2 mb-3 bg-light rounded border small'>
                    <span className='text-muted d-block'>Resource:</span>
                    <strong className='text-dark'>{resource.title}</strong>
                    <div className='text-muted'>{resource.subjectCode} - {resource.subjectName}</div>
                  </div>

                  {error && <div className='alert alert-danger py-2 small' role='alert'>{error}</div>}

                  <div className='mb-3'>
                    <label htmlFor='issueType' className='form-label small fw-semibold'>What is the issue?</label>
                    <select
                      id='issueType'
                      className='form-select form-select-sm'
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      required
                    >
                      <option value='broken_link'>Broken or Inaccessible PDF Link</option>
                      <option value='incorrect_content'>Incorrect or Mislabeled Subject Content</option>
                      <option value='outdated_syllabus'>Outdated Syllabus or PYQ</option>
                      <option value='other'>Other Feedback</option>
                    </select>
                  </div>

                  <div className='mb-3'>
                    <label htmlFor='description' className='form-label small fw-semibold'>Details (Optional)</label>
                    <textarea
                      id='description'
                      className='form-control form-control-sm'
                      rows='3'
                      placeholder='Please describe what was wrong, such as link gives 404, page missing, etc.'
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      maxLength='1000'
                    ></textarea>
                    <div className='form-text small text-muted'>No personal information is collected with this report.</div>
                  </div>
                </>
              )}
            </div>

            {!success && (
              <div className='modal-footer border-top-0 pt-0'>
                <button type='button' className='btn btn-sm btn-light' onClick={onClose} disabled={submitting}>
                  Cancel
                </button>
                <button type='submit' className='btn btn-sm btn-danger px-3' disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
