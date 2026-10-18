import React, { useState } from 'react';
import { FiMail, FiSend, FiCheck, FiInfo } from 'react-icons/fi';

export const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className='container my-5' id='contact-content'>
      <div className='row justify-content-center'>
        <div className='col-lg-7 col-md-9'>
          <div className='text-center mb-4'>
            <span className='badge bg-light text-primary border px-3 py-1 mb-2'>Contact & Support</span>
            <h1 className='h3 fw-bold text-dark'>Get in Touch</h1>
            <p className='text-muted small'>
              Have suggestions for new study notes, found an incorrect link, or want to contribute materials?
            </p>
          </div>

          <div className='card border-0 shadow-sm p-4 rounded-3 bg-white'>
            {submitted ? (
              <div className='text-center py-4'>
                <div className='d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3'>
                  <FiCheck size={32} />
                </div>
                <h2 className='h5 fw-bold text-dark'>Message Received!</h2>
                <p className='text-muted small mb-0'>
                  Thank you for contacting the AKTU Notes1965 team. We will review your message promptly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <label htmlFor='contact-name' className='form-label small fw-semibold text-secondary'>Name</label>
                  <input
                    type='text'
                    id='contact-name'
                    className='form-control form-control-sm'
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder='Your Name'
                  />
                </div>

                <div className='mb-3'>
                  <label htmlFor='contact-email' className='form-label small fw-semibold text-secondary'>Email Address</label>
                  <input
                    type='email'
                    id='contact-email'
                    className='form-control form-control-sm'
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder='student@example.com'
                  />
                </div>

                <div className='mb-3'>
                  <label htmlFor='contact-subject' className='form-label small fw-semibold text-secondary'>Subject</label>
                  <input
                    type='text'
                    id='contact-subject'
                    className='form-control form-control-sm'
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder='e.g., Suggest new notes for Compiler Design'
                  />
                </div>

                <div className='mb-4'>
                  <label htmlFor='contact-message' className='form-label small fw-semibold text-secondary'>Message</label>
                  <textarea
                    id='contact-message'
                    className='form-control form-control-sm'
                    rows='4'
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder='Type your suggestion or feedback here...'
                  ></textarea>
                </div>

                <button type='submit' className='btn btn-primary-aktu w-100 py-2 d-inline-flex align-items-center justify-content-center gap-2'>
                  <FiSend size={15} />
                  <span>Send Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
