import React, { useState } from 'react';
import { FiDownload, FiExternalLink, FiShare2, FiAlertCircle, FiCheck } from 'react-icons/fi';

export const ResourceCard = ({ resource, onReport }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const link = resource.downloadUrl || resource.fileUrl;
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const getTypeBadgeClass = (type) => {
    switch (type) {
      case 'Notes': return 'badge-type-notes';
      case 'Syllabus': return 'badge-type-syllabus';
      case 'PYQ': return 'badge-type-pyq';
      default: return 'bg-light text-dark';
    }
  };

  const downloadHref = resource.downloadUrl || resource.fileUrl;
  const previewHref = resource.previewUrl || resource.fileUrl;

  return (
    <article className='resource-card p-3 position-relative' aria-label={resource.title}>
      {/* Top Badges */}
      <div className='d-flex flex-wrap align-items-center gap-1 mb-2'>
        <span className={`badge px-2 py-1 rounded ${getTypeBadgeClass(resource.resourceType)}`}>
          {resource.resourceType}
        </span>
        <span className='badge badge-branch px-2 py-1 rounded'>
          {resource.branch}
        </span>
        <span className='badge badge-sem px-2 py-1 rounded'>
          Sem {resource.semester}
        </span>
        {resource.academicYear && (
          <span className='badge bg-light text-secondary border px-2 py-1 rounded small'>
            {resource.academicYear}
          </span>
        )}
      </div>

      {/* Subject Info */}
      <div className='small text-muted mb-1 fw-semibold'>
        <span className='text-uppercase text-dark'>{resource.subjectCode}</span> &bull; {resource.subjectName}
      </div>

      {/* Title */}
      <h2 className='h6 fw-bold mb-2 text-dark' style={{ lineHeight: '1.4' }}>
        {resource.title}
      </h2>

      {/* Description */}
      {resource.description && (
        <p className='small text-secondary mb-3' style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {resource.description}
        </p>
      )}

      {/* Regulation tag if present */}
      {resource.regulation && (
        <div className='small text-muted mb-3'>
          Regulation: <span className='fw-medium text-dark'>{resource.regulation}</span>
        </div>
      )}

      {/* Actions */}
      <div className='mt-auto pt-3 border-top d-flex flex-wrap align-items-center justify-content-between gap-2'>
        <div className='d-flex gap-2 flex-grow-1'>
          <a
            href={downloadHref}
            target='_blank'
            rel='noopener noreferrer'
            className='btn btn-primary-aktu btn-sm d-inline-flex align-items-center justify-content-center gap-1 flex-grow-1 py-2'
            aria-label={`Download PDF for ${resource.title}`}
          >
            <FiDownload size={14} />
            <span>Download PDF</span>
          </a>

          {previewHref !== downloadHref && (
            <a
              href={previewHref}
              target='_blank'
              rel='noopener noreferrer'
              className='btn btn-outline-secondary btn-sm d-inline-flex align-items-center justify-content-center px-2'
              title='Preview Document'
              aria-label='Preview PDF in new tab'
            >
              <FiExternalLink size={14} />
            </a>
          )}
        </div>

        <div className='d-flex gap-1'>
          <button
            type='button'
            onClick={handleCopyLink}
            className='btn btn-light btn-sm text-secondary'
            title={copied ? 'Link copied!' : 'Copy resource link'}
            aria-label='Copy resource link'
          >
            {copied ? <FiCheck size={14} className='text-success' /> : <FiShare2 size={14} />}
          </button>

          <button
            type='button'
            onClick={() => onReport(resource)}
            className='btn btn-light btn-sm text-secondary'
            title='Report broken link or issue'
            aria-label='Report broken link'
          >
            <FiAlertCircle size={14} />
          </button>
        </div>
      </div>
    </article>
  );
};
