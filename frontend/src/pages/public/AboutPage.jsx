import React from 'react';
import { FiCheck, FiShield, FiHeart } from 'react-icons/fi';

export const AboutPage = () => {
  return (
    <main className='container my-5' id='about-content'>
      <div className='row justify-content-center'>
        <div className='col-lg-8'>
          <div className='text-center mb-5'>
            <span className='badge bg-light text-primary border px-3 py-1 mb-2'>About AKTU Notes1965</span>
            <h1 className='h2 fw-bold text-dark'>Study Smart. Score Better.</h1>
            <p className='text-muted'>
              An independent, student-led academic initiative for Dr. A.P.J. Abdul Kalam Technical University students.
            </p>
          </div>

          <div className='card border-0 shadow-sm p-4 p-md-5 mb-4 rounded-3 bg-white'>
            <h2 className='h4 fw-bold mb-3 text-dark'>Our Mission</h2>
            <p className='text-secondary'>
              Engineering examinations require timely access to quality study material, clear unit-wise syllabus coverage, and authentic previous-year question papers (PYQs). Too often, students spend hours searching through unorganized groups, broken links, or behind paywalls and compulsory sign-ups.
            </p>
            <p className='text-secondary'>
              <strong>AKTU Notes1965</strong> was built to solve this exact problem: providing a clean, fast, searchable, and verified public directory where any AKTU student can view and download academic resources in seconds without registration.
            </p>

            <hr className='my-4' />

            <h2 className='h4 fw-bold mb-3 text-dark'>What We Offer</h2>
            <ul className='list-unstyled d-flex flex-column gap-2 mb-4'>
              <li className='d-flex align-items-start gap-2 text-secondary'>
                <FiCheck className='text-success mt-1 flex-shrink-0' size={18} />
                <span><strong>AKTU Syllabus PDFs:</strong> Unit-wise breakdowns, course outcomes, and reference textbooks.</span>
              </li>
              <li className='d-flex align-items-start gap-2 text-secondary'>
                <FiCheck className='text-success mt-1 flex-shrink-0' size={18} />
                <span><strong>Lecture Notes:</strong> Handcrafted and typed revision notes from experienced university teachers and top-performing students.</span>
              </li>
              <li className='d-flex align-items-start gap-2 text-secondary'>
                <FiCheck className='text-success mt-1 flex-shrink-0' size={18} />
                <span><strong>Previous-Year Papers (PYQs):</strong> Original university end-semester examination papers with solution hints.</span>
              </li>
            </ul>

            <div className='alert alert-warning border-0 p-3 rounded-2 small'>
              <div className='d-flex align-items-center gap-2 mb-1 fw-bold text-dark'>
                <FiShield size={18} />
                <span>Non-Affiliation Notice</span>
              </div>
              <p className='mb-0 text-dark-emphasis'>
                AKTU Notes1965 is an independent, non-commercial student resource portal. We are NOT affiliated with, authorized by, or officially associated with Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow, Uttar Pradesh. Official university circulars and notices must always be verified on the official AKTU portal (aktu.ac.in).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
