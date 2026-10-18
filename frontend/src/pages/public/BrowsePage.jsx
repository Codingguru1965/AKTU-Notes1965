import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ResourceFilters } from '../../components/public/ResourceFilters';
import { ResourceList } from '../../components/public/ResourceList';
import { Pagination } from '../../components/public/Pagination';
import { ReportModal } from '../../components/common/ReportModal';
import { getResources, getFilters } from '../../services/api';
import { FiBookOpen } from 'react-icons/fi';

export const BrowsePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [availableFilters, setAvailableFilters] = useState(null);

  const [reportTarget, setReportTarget] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const filters = {
    branch: searchParams.get('branch') || '',
    semester: searchParams.get('semester') || '',
    year: searchParams.get('year') || '',
    resourceType: searchParams.get('resourceType') || '',
    subjectCode: searchParams.get('subjectCode') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1', 10)
  };

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await getFilters();
        if (res.data && res.data.success) {
          setAvailableFilters(res.data.data);
        }
      } catch {
        // silent fallback
      }
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    let active = true;
    const fetchResources = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {
          page: filters.page,
          limit: 12
        };
        if (filters.branch) params.branch = filters.branch;
        if (filters.semester) params.semester = filters.semester;
        if (filters.year) params.year = filters.year;
        if (filters.resourceType) params.resourceType = filters.resourceType;
        if (filters.subjectCode) params.subjectCode = filters.subjectCode;
        if (filters.search) params.search = filters.search;

        const res = await getResources(params);
        if (active && res.data && res.data.success) {
          setResources(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load resources');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchResources();
    return () => { active = false; };
  }, [
    filters.branch,
    filters.semester,
    filters.year,
    filters.resourceType,
    filters.subjectCode,
    filters.search,
    filters.page
  ]);

  const updateFilters = (newFilters) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) {
        updated.set(k, v);
      } else {
        updated.delete(k);
      }
    });
    if (!('page' in newFilters)) {
      updated.set('page', '1');
    }
    setSearchParams(updated);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  return (
    <main className='container my-5' id='browse-content'>
      <div className='d-flex align-items-center gap-2 mb-2'>
        <FiBookOpen size={24} style={{ color: 'var(--navy)' }} />
        <h1 className='h3 fw-bold mb-0 text-dark'>Browse All Academic Resources</h1>
      </div>
      <p className='text-muted small mb-4'>
        Comprehensive collection of AKTU syllabus PDFs, semester study notes, and end-term question papers.
      </p>

      <ResourceFilters
        filters={filters}
        onFilterChange={updateFilters}
        onResetFilters={handleResetFilters}
        availableFilters={availableFilters}
      />

      <ResourceList
        resources={resources}
        loading={loading}
        error={error}
        onRetry={() => updateFilters({})}
        onResetFilters={handleResetFilters}
        onReport={(res) => {
          setReportTarget(res);
          setIsReportOpen(true);
        }}
      />

      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalCount={pagination.total}
        onPageChange={(p) => updateFilters({ page: p.toString() })}
      />

      <ReportModal
        resource={reportTarget}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </main>
  );
};
