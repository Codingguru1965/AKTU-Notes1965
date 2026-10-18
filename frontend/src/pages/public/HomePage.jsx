import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Hero } from '../../components/public/Hero';
import { ResourceFilters } from '../../components/public/ResourceFilters';
import { ResourceList } from '../../components/public/ResourceList';
import { Pagination } from '../../components/public/Pagination';
import { ReportModal } from '../../components/common/ReportModal';
import { getResources, getFilters } from '../../services/api';
import { FiBook, FiDownload, FiSearch, FiCheckCircle } from 'react-icons/fi';

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [availableFilters, setAvailableFilters] = useState(null);

  const [reportTarget, setReportTarget] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Search input state with debounce
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Extract filter parameters from URL
  const filters = {
    branch: searchParams.get('branch') || '',
    semester: searchParams.get('semester') || '',
    year: searchParams.get('year') || '',
    resourceType: searchParams.get('resourceType') || '',
    subjectCode: searchParams.get('subjectCode') || '',
    search: searchParams.get('search') || '',
    page: parseInt(searchParams.get('page') || '1', 10)
  };

  // Load available filters on mount
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

  // Fetch resources with cancellation of stale requests
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
          setError(err.message || 'Failed to fetch academic resources');
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

  // Update URL search parameters
  const updateFilters = (newFilters) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) {
        updated.set(k, v);
      } else {
        updated.delete(k);
      }
    });
    // Reset to page 1 on filter changes unless changing page directly
    if (!('page' in newFilters)) {
      updated.set('page', '1');
    }
    setSearchParams(updated);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateFilters({ search: searchQuery.trim(), page: '1' });
  };

  // Debounce search typing
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== (searchParams.get('search') || '')) {
        updateFilters({ search: searchQuery.trim(), page: '1' });
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleOpenReport = (resource) => {
    setReportTarget(resource);
    setIsReportOpen(true);
  };

  return (
    <>
      <Hero
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
      />

      <main className='container my-5' id='main-content'>
        <div className='d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-4'>
          <div>
            <h2 className='h4 fw-bold mb-1' style={{ color: 'var(--navy)' }}>
              Explore Academic Resources
            </h2>
            <p className='text-muted small mb-0'>
              Filter by syllabus, notes, or PYQs across all university branches.
            </p>
          </div>

          <div className='small text-muted'>
            {pagination.total > 0 && (
              <span>Showing <strong>{pagination.total}</strong> published resources</span>
            )}
          </div>
        </div>

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
          onReport={handleOpenReport}
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalCount={pagination.total}
          onPageChange={(p) => updateFilters({ page: p.toString() })}
        />

        {/* How to use section */}
        <section className='my-5 pt-4 border-top' aria-labelledby='how-to-use-heading'>
          <div className='text-center mb-4'>
            <span className='badge bg-light text-primary border px-3 py-1 mb-2'>Simple & Direct</span>
            <h2 id='how-to-use-heading' className='h4 fw-bold text-dark'>
              How to Use AKTU Notes1965
            </h2>
            <p className='text-muted small mx-auto' style={{ maxWidth: '520px' }}>
              We believe academic notes should be freely accessible to every engineering student without paywalls or login walls.
            </p>
          </div>

          <div className='row g-4'>
            <div className='col-md-4'>
              <div className='p-4 bg-white rounded-3 border h-100 text-center'>
                <div className='d-inline-flex p-3 rounded-circle bg-light text-primary mb-3' style={{ color: 'var(--navy)' }}>
                  <FiSearch size={24} />
                </div>
                <h3 className='h6 fw-bold mb-2'>1. Search or Filter</h3>
                <p className='small text-muted mb-0'>
                  Select your branch (CSE, IT, ECE, EE, ME, Civil) and semester to narrow down to exact subjects.
                </p>
              </div>
            </div>

            <div className='col-md-4'>
              <div className='p-4 bg-white rounded-3 border h-100 text-center'>
                <div className='d-inline-flex p-3 rounded-circle bg-light text-primary mb-3' style={{ color: 'var(--navy)' }}>
                  <FiBook size={24} />
                </div>
                <h3 className='h6 fw-bold mb-2'>2. Choose Material Type</h3>
                <p className='small text-muted mb-0'>
                  Pick between unit-wise official Syllabus breakdowns, teacher lecture notes, or past university question papers.
                </p>
              </div>
            </div>

            <div className='col-md-4'>
              <div className='p-4 bg-white rounded-3 border h-100 text-center'>
                <div className='d-inline-flex p-3 rounded-circle bg-light text-primary mb-3' style={{ color: 'var(--navy)' }}>
                  <FiDownload size={24} />
                </div>
                <h3 className='h6 fw-bold mb-2'>3. Open and Download</h3>
                <p className='small text-muted mb-0'>
                  Click Download PDF to instantly access the verified document. No account creation or registration needed.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ReportModal
        resource={reportTarget}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </>
  );
};
