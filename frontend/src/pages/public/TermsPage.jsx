import React from 'react';

export const TermsPage = () => {
  return (
    <main className='container my-5' id='terms-content'>
      <div className='row justify-content-center'>
        <div className='col-lg-8'>
          <div className='card border-0 shadow-sm p-4 p-md-5 bg-white rounded-3'>
            <h1 className='h3 fw-bold text-dark mb-3'>Terms of Use</h1>
            <p className='text-muted small'>Last updated: October 2026</p>

            <h2 className='h5 fw-bold text-dark mt-4'>1. Educational Fair Use</h2>
            <p className='text-secondary small'>
              All academic materials provided through AKTU Notes1965 are intended solely for personal, non-commercial educational study purposes by enrolled students.
            </p>

            <h2 className='h5 fw-bold text-dark mt-3'>2. Non-Affiliation Disclaimer</h2>
            <p className='text-secondary small'>
              AKTU Notes1965 is an independent student platform and is not officially affiliated with Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow. All university syllabi and question papers belong to their respective copyright holders.
            </p>

            <h2 className='h5 fw-bold text-dark mt-3'>3. Content Accuracy</h2>
            <p className='text-secondary small'>
              While we strive to keep notes, syllabus breakdowns, and PYQs accurate and up-to-date, students should always refer to official university notifications (aktu.ac.in) for definitive examination dates, syllabus amendments, and regulations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
