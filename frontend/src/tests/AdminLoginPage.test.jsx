import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import * as AuthContextModule from '../context/AuthContext';

describe('AdminLoginPage Component', () => {
  it('renders login form elements and placeholders accurately', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: vi.fn(),
      admin: null,
      loading: false
    });

    render(
      <BrowserRouter>
        <AdminLoginPage />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { name: /aktu notes1965 admin portal/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/admin email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('updates input values when typing', () => {
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: vi.fn(),
      admin: null,
      loading: false
    });

    render(
      <BrowserRouter>
        <AdminLoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/admin email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: 'ankit@1965gmail.co.in' } });
    fireEvent.change(passwordInput, { target: { value: 'Ankit@()1965' } });

    expect(emailInput.value).toBe('ankit@1965gmail.co.in');
    expect(passwordInput.value).toBe('Ankit@()1965');
  });

  it('calls login function on form submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue({});
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      login: mockLogin,
      admin: null,
      loading: false
    });

    render(
      <BrowserRouter>
        <AdminLoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/admin email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitBtn = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'ankit@1965gmail.co.in' } });
    fireEvent.change(passwordInput, { target: { value: 'Ankit@()1965' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('ankit@1965gmail.co.in', 'Ankit@()1965');
    });
  });
});
