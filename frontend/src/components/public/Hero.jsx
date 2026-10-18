import React from 'react';
import { FiSearch, FiBook, FiFileText, FiAward, FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export const Hero = ({ searchQuery, onSearchChange, onSearchSubmit }) => {
  return (
    <section className='hero-section' aria-labelledby='hero-heading'>
      <div className='container text-center position-relative' style={{ zIndex: 1 }}>
        <div className='d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-white bg-opacity-10 border border-white border-opacity-20 text-white small mb-3'>
          <span className='badge bg-info text-dark rounded-pill fw-bold'>Free</span>
          <span>Open Academic Directory for AKTU Students</span>
        </div>

        <h1 id='hero-heading' className='hero-title mb-3'>
          AKTU Study Materials,<br className='d-none d-md-block' /> All in One Place
        </h1>

        <p className='hero-subtitle mb-4'>
          Find syllabus PDFs, semester notes, and previous-year question papers in one simple place.
        </p>

        <form onSubmit={onSearchSubmit} className='hero-search-wrapper mb-3' role='search'>
          <FiSearch className='hero-search-icon' />
          <input
            type='search'
            className='form-control hero-search-input'
            placeholder='Search by subject name, code (e.g. KCS301), or topic...'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label='Search study materials'
          />
        </form>

        <div className='hero-chips'>
          <span className='small text-white-50 align-self-center me-1'>Popular categories:</span>
          <Link to='/resources?resourceType=Syllabus' className='hero-chip-btn d-inline-flex align-items-center gap-1'>
            <FiBook size={13} /> Syllabus PDFs
          </Link>
          <Link to='/resources?resourceType=Notes' className='hero-chip-btn d-inline-flex align-items-center gap-1'>
            <FiFileText size={13} /> Semester Notes
          </Link>
          <Link to='/resources?resourceType=PYQ' className='hero-chip-btn d-inline-flex align-items-center gap-1'>
            <FiAward size={13} /> Question Papers (PYQs)
          </Link>
          <Link to='/resources' className='hero-chip-btn d-inline-flex align-items-center gap-1 bg-info text-dark fw-bold border-0'>
            Browse All <FiArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
};
