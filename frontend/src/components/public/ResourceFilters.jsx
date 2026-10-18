import React, { useEffect, useState } from 'react';
import { FiFilter, FiRotateCcw } from 'react-icons/fi';
import { getSubjects } from '../../services/api';

const YEAR_SEMESTER_MAP = {
  '1': [1, 2],
  '2': [3, 4],
  '3': [5, 6],
  '4': [7, 8]
};

export const ResourceFilters = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableFilters
}) => {
  const [subjectsList, setSubjectsList] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Available semesters based on chosen year
  const allowedSemesters = filters.year && YEAR_SEMESTER_MAP[filters.year]
    ? YEAR_SEMESTER_MAP[filters.year]
    : [1, 2, 3, 4, 5, 6, 7, 8];

  // Fetch subjects dynamically when branch or semester changes
  useEffect(() => {
    let isMounted = true;
    const fetchSubjects = async () => {
      if (!filters.branch && !filters.semester) {
        setSubjectsList([]);
        return;
      }
      setLoadingSubjects(true);
      try {
        const params = {};
        if (filters.branch) params.branch = filters.branch;
        if (filters.semester) params.semester = filters.semester;
        const res = await getSubjects(params);
        if (isMounted && res.data && res.data.success) {
          setSubjectsList(res.data.data);
        }
      } catch {
        if (isMounted) setSubjectsList([]);
      } finally {
        if (isMounted) setLoadingSubjects(false);
      }
    };

    fetchSubjects();
    return () => { isMounted = false; };
  }, [filters.branch, filters.semester]);

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    const updates = { year: newYear };

    // Reset semester if incompatible with new year
    if (newYear && filters.semester) {
      const validSems = YEAR_SEMESTER_MAP[newYear] || [];
      if (!validSems.includes(Number(filters.semester))) {
        updates.semester = '';
        updates.subjectCode = '';
      }
    }
    onFilterChange(updates);
  };

  const handleBranchChange = (e) => {
    const newBranch = e.target.value;
    onFilterChange({ branch: newBranch, subjectCode: '' });
  };

  const handleSemesterChange = (e) => {
    const newSem = e.target.value;
    const updates = { semester: newSem, subjectCode: '' };

    // Automatically set year if year was empty
    if (newSem && !filters.year) {
      for (const [y, sems] of Object.entries(YEAR_SEMESTER_MAP)) {
        if (sems.includes(Number(newSem))) {
          updates.year = y;
          break;
        }
      }
    }
    onFilterChange(updates);
  };

  const branches = availableFilters?.branches || ['CSE', 'IT', 'ECE', 'EE', 'ME', 'Civil'];
  const resourceTypes = availableFilters?.resourceTypes || ['Syllabus', 'Notes', 'PYQ'];

  const hasActiveFilters = Boolean(
    filters.resourceType || filters.branch || filters.year || filters.semester || filters.subjectCode || filters.search
  );

  return (
    <div className='filter-card mb-4' aria-label='Filter study resources'>
      <div className='d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom'>
        <div className='d-flex align-items-center gap-2 text-dark fw-bold'>
          <FiFilter size={18} style={{ color: 'var(--navy)' }} />
          <span>Filter Resources</span>
        </div>
        {hasActiveFilters && (
          <button
            type='button'
            onClick={onResetFilters}
            className='btn btn-link text-decoration-none p-0 d-inline-flex align-items-center gap-1 text-danger small fw-semibold'
            aria-label='Clear all filters'
          >
            <FiRotateCcw size={13} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className='row g-3'>
        {/* 1. Resource Type */}
        <div className='col-lg-3 col-md-6 col-12'>
          <label htmlFor='filter-type' className='form-label small fw-semibold text-secondary mb-1'>
            Resource Type
          </label>
          <select
            id='filter-type'
            className='form-select form-select-sm'
            value={filters.resourceType || ''}
            onChange={(e) => onFilterChange({ resourceType: e.target.value })}
          >
            <option value=''>All Types (Syllabus, Notes, PYQ)</option>
            {resourceTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* 2. Branch */}
        <div className='col-lg-3 col-md-6 col-12'>
          <label htmlFor='filter-branch' className='form-label small fw-semibold text-secondary mb-1'>
            Branch
          </label>
          <select
            id='filter-branch'
            className='form-select form-select-sm'
            value={filters.branch || ''}
            onChange={handleBranchChange}
          >
            <option value=''>All Branches</option>
            {branches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* 3. Academic Year */}
        <div className='col-lg-2 col-md-4 col-6'>
          <label htmlFor='filter-year' className='form-label small fw-semibold text-secondary mb-1'>
            Year
          </label>
          <select
            id='filter-year'
            className='form-select form-select-sm'
            value={filters.year || ''}
            onChange={handleYearChange}
          >
            <option value=''>All Years</option>
            <option value='1'>1st Year</option>
            <option value='2'>2nd Year</option>
            <option value='3'>3rd Year</option>
            <option value='4'>4th Year</option>
          </select>
        </div>

        {/* 4. Semester (Cascading based on Year) */}
        <div className='col-lg-2 col-md-4 col-6'>
          <label htmlFor='filter-semester' className='form-label small fw-semibold text-secondary mb-1'>
            Semester
          </label>
          <select
            id='filter-semester'
            className='form-select form-select-sm'
            value={filters.semester || ''}
            onChange={handleSemesterChange}
          >
            <option value=''>All Semesters</option>
            {allowedSemesters.map(s => (
              <option key={s} value={s}>Semester {s}</option>
            ))}
          </select>
        </div>

        {/* 5. Subject (Cascading based on Branch/Semester) */}
        <div className='col-lg-2 col-md-4 col-12'>
          <label htmlFor='filter-subject' className='form-label small fw-semibold text-secondary mb-1'>
            Subject {loadingSubjects && <span className='spinner-border spinner-border-sm text-secondary' role='status' />}
          </label>
          <select
            id='filter-subject'
            className='form-select form-select-sm'
            value={filters.subjectCode || ''}
            onChange={(e) => onFilterChange({ subjectCode: e.target.value })}
            disabled={!filters.branch && !filters.semester && subjectsList.length === 0}
          >
            <option value=''>All Subjects</option>
            {subjectsList.map(s => (
              <option key={s.subjectCode} value={s.subjectCode}>
                {s.subjectCode} - {s.subjectName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
