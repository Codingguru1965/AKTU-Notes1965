import React from 'react';

export const PrivacyPage = () => {
  return (
    <main className='container my-5' id='privacy-content'>
      <div className='row justify-content-center'>
        <div className='col-lg-8'>
          <div className='card border-0 shadow-sm p-4 p-md-5 bg-white rounded-3'>
            <h1 className='h3 fw-bold text-dark mb-3'>Privacy Policy</h1>
            <p className='text-muted small'>Last updated: October 2026</p>

            <h2 className='h5 fw-bold text-dark mt-4'>1. No Student Tracking</h2>
            <p className='text-secondary small'>
              AKTU Notes1965 is built as an open academic directory. Students are not required to register, create accounts, or provide email addresses or phone numbers to browse or download published notes, syllabus PDFs, and question papers.
            </p>

            <h2 className='h5 fw-bold text-dark mt-3'>2. Cookies</h2>
            <p className='text-secondary small'>
              We do not use tracking or advertising cookies for regular public visitors. HTTP-only session cookies are strictly utilized for authorized administrative authentication only.
            </p>

            <h2 className='h5 fw-bold text-dark mt-3'>3. External Storage Providers</h2>
            <p className='text-secondary small'>
              Public study files are linked to approved storage services (such as Google Drive, GitHub, AWS S3). When you click to download or view a PDF, you may be redirected to or served directly by those providers according to their standard privacy terms.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};
