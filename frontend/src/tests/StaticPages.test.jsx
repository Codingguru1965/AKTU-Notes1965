import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { AboutPage } from '../pages/public/AboutPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';
import { ContactPage } from '../pages/public/ContactPage';

describe('Static Pages & Error Handlers', () => {
  it('renders AboutPage with mission and AKTU disclaimer', () => {
    render(
      <BrowserRouter>
        <AboutPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /study smart\. score better\./i })).toBeInTheDocument();
    expect(screen.getByText(/our mission/i)).toBeInTheDocument();
    expect(screen.getByText(/what we offer/i)).toBeInTheDocument();
  });

  it('renders NotFoundPage with 404 code and Return to Homepage navigation link', () => {
    render(
      <BrowserRouter>
        <NotFoundPage />
      </BrowserRouter>
    );

    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText(/page not found/i)).toBeInTheDocument();
    const homeLink = screen.getByRole('link', { name: /return to homepage/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('renders ContactPage with report issue guidance and form controls', () => {
    render(
      <BrowserRouter>
        <ContactPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /get in touch/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send message/i })).toBeInTheDocument();
  });
});
