import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className='footer-aktu' role='contentinfo'>
      <div className='container'>
        <div className='row g-4'>
          <div className='col-lg-5 col-md-6'>
            <div className='d-flex align-items-center gap-2 mb-3'>
              <img src='/icon.svg' alt='AKTU Notes1965 icon' width='36' height='36' />
              <span className='h5 mb-0 fw-bold text-white'>AKTU Notes1965</span>
            </div>
            <p className='small pe-lg-4 mb-3 text-secondary'>
              Study Smart. Score Better. A free, independent academic directory providing AKTU students with verified syllabus PDFs, lecture notes, and previous year question papers.
            </p>
            <div className='p-2 rounded bg-dark border border-secondary border-opacity-25 small text-secondary'>
              <strong className='text-light d-block mb-1'>Disclaimer:</strong>
              AKTU Notes1965 is an independent student platform. We are not affiliated with, endorsed by, or representing Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow.
            </div>
          </div>

          <div className='col-lg-2 col-md-3 col-6'>
            <h6 className='text-white fw-bold mb-3'>Resources</h6>
            <ul className='list-unstyled small d-flex flex-column gap-2 mb-0'>
              <li><Link to='/resources?resourceType=Syllabus'>AKTU Syllabus</Link></li>
              <li><Link to='/resources?resourceType=Notes'>Semester Notes</Link></li>
              <li><Link to='/resources?resourceType=PYQ'>Previous Year Papers</Link></li>
              <li><Link to='/resources?branch=CSE'>CSE Resources</Link></li>
              <li><Link to='/resources?branch=IT'>IT Resources</Link></li>
            </ul>
          </div>

          <div className='col-lg-2 col-md-3 col-6'>
            <h6 className='text-white fw-bold mb-3'>Quick Links</h6>
            <ul className='list-unstyled small d-flex flex-column gap-2 mb-0'>
              <li><Link to='/'>Home</Link></li>
              <li><Link to='/resources'>Browse All</Link></li>
              <li><Link to='/about'>About Platform</Link></li>
              <li><Link to='/contact'>Report an Issue</Link></li>
              <li><Link to='/privacy'>Privacy Policy</Link></li>
              <li><Link to='/terms'>Terms of Use</Link></li>
            </ul>
          </div>

          <div className='col-lg-3 col-md-12'>
            <h6 className='text-white fw-bold mb-3'>Open and Free Access</h6>
            <p className='small text-secondary mb-2'>
              All published materials are freely accessible without accounts or registration fees.
            </p>
            <div className='d-inline-flex align-items-center gap-2 px-3 py-2 rounded bg-opacity-10 bg-info border border-info border-opacity-25 text-info small'>
              <span className='badge bg-info text-dark'>Free</span>
              <span>100% Free for all students</span>
            </div>
          </div>
        </div>

        <hr className='my-4 border-secondary border-opacity-25' />

        <div className='d-flex flex-column flex-md-row justify-content-between align-items-center gap-2 small text-secondary'>
          <div>
            &copy; {new Date().getFullYear()} AKTU Notes1965. Built by students, for students.
          </div>
          <div className='d-flex gap-3'>
            <Link to='/privacy'>Privacy</Link>
            <Link to='/terms'>Terms</Link>
            <Link to='/contact'>Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
