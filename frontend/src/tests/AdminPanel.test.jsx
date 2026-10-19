import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminLayout } from '../layouts/AdminLayout';
import { AdminResourceFormPage } from '../pages/admin/AdminResourceFormPage';
import { AdminResourcesPage } from '../pages/admin/AdminResourcesPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import * as AuthContextModule from '../context/AuthContext';
import * as ApiModule from '../services/api';

describe('Admin Panel Layout & Workflows', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(AuthContextModule, 'useAuth').mockReturnValue({
      admin: { name: 'Super Admin', email: 'admin@aktunotes1965.org' },
      logout: vi.fn(),
      loading: false
    });
  });

  describe('A & B: AdminLayout Component', () => {
    it('renders exactly four admin sidebar navigation items', () => {
      render(
        <BrowserRouter>
          <AdminLayout />
        </BrowserRouter>
      );

      // Verify the desktop navigation menu
      const desktopNav = screen.getByLabelText('Desktop Sidebar Menu');
      expect(desktopNav).toBeInTheDocument();

      // Find all links inside the desktop sidebar menu
      const links = desktopNav.querySelectorAll('.admin-nav-link');
      expect(links.length).toBe(4);

      const linkLabels = Array.from(links).map((l) => l.textContent.trim());
      expect(linkLabels).toEqual(['Dashboard', 'All Resources', 'Add Resource', 'Reports']);
    });

    it('renders the fixed navbar with brand, public site link, admin name, and logout', () => {
      render(
        <BrowserRouter>
          <AdminLayout />
        </BrowserRouter>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('AKTU Notes1965')).toBeInTheDocument();
      expect(screen.getByText('View Public Site')).toBeInTheDocument();
      expect(screen.getByText('Super Admin')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /toggle navigation menu/i })).toBeInTheDocument();
    });

    it('toggles mobile drawer when hamburger button is clicked', () => {
      render(
        <BrowserRouter>
          <AdminLayout />
        </BrowserRouter>
      );

      const hamburger = screen.getByRole('button', { name: /toggle navigation menu/i });
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(hamburger);
      expect(hamburger).toHaveAttribute('aria-expanded', 'true');

      // Mobile drawer exists and is open
      const mobileDrawer = screen.getByLabelText('Mobile Navigation Drawer');
      expect(mobileDrawer).toHaveClass('open');

      // Clicking close button closes drawer
      const closeBtn = screen.getByRole('button', { name: /close navigation menu/i });
      fireEvent.click(closeBtn);
      expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('E: AdminResourceFormPage Two-Step Workflow', () => {
    it('renders step 1 with Board/University field and without resource Description field', () => {
      render(
        <BrowserRouter>
          <AdminResourceFormPage />
        </BrowserRouter>
      );

      // Verify Board/University field exists
      expect(screen.getByLabelText(/board \/ university/i)).toBeInTheDocument();

      // Verify Resource Description field was REMOVED
      expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/brief summary of topics/i)).not.toBeInTheDocument();

      // Verify Regulation field was completely REMOVED from the form
      expect(screen.queryByLabelText(/regulation/i)).not.toBeInTheDocument();

      // Verify "Save & Next" button is present in Step 1
      expect(screen.getByRole('button', { name: /save & next/i })).toBeInTheDocument();
    });

    it('renders full-width container and form card matching All Resources alignment', () => {
      const { container } = render(
        <BrowserRouter>
          <AdminResourceFormPage />
        </BrowserRouter>
      );

      // Verify outer container is full-width without mx-auto or restrictive maxWidth
      const pageContainer = container.firstChild;
      expect(pageContainer).toHaveClass('w-100');
      expect(pageContainer).not.toHaveClass('mx-auto');
      expect(pageContainer.style.maxWidth).toBe('none');

      // Verify form card is full-width
      const formCard = container.querySelector('.card');
      expect(formCard).toHaveClass('w-100');
    });

    it('validates Step 1 and transitions to Step 2 Review when fields are filled', async () => {
      render(
        <BrowserRouter>
          <AdminResourceFormPage />
        </BrowserRouter>
      );

      // Fill in required fields
      fireEvent.change(screen.getByLabelText(/resource title/i), {
        target: { value: 'Computer Networks Full Notes' }
      });
      fireEvent.change(screen.getByLabelText(/subject code/i), {
        target: { value: 'KCS603' }
      });
      fireEvent.change(screen.getByLabelText(/subject name/i), {
        target: { value: 'Computer Networks' }
      });

      // Switch to external URL mode for easy test without real file upload
      const externalModeBtn = screen.getByRole('button', { name: /external pdf link/i });
      fireEvent.click(externalModeBtn);

      const urlInput = screen.getByLabelText(/external secure https url/i);
      fireEvent.change(urlInput, {
        target: { value: 'https://raw.githubusercontent.com/aktu/notes.pdf' }
      });

      // Click "Save & Next"
      const saveAndNextBtn = screen.getByRole('button', { name: /save & next/i });
      fireEvent.click(saveAndNextBtn);

      // Should now be on Step 2 (Review)
      await waitFor(() => {
        expect(screen.getByText(/review details:/i)).toBeInTheDocument();
        expect(screen.getByText('Computer Networks Full Notes')).toBeInTheDocument();
        expect(screen.getByText('Board / University')).toBeInTheDocument();
        expect(screen.queryByText(/^regulation$/i)).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /back to edit details/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /publish resource/i })).toBeInTheDocument();
      });

      // Clicking Back preserves all entered data
      const backBtn = screen.getByRole('button', { name: /back to edit details/i });
      fireEvent.click(backBtn);

      expect(screen.getByLabelText(/resource title/i).value).toBe('Computer Networks Full Notes');
      expect(screen.getByLabelText(/subject code/i).value).toBe('KCS603');
    });

    it('uploads local PDF and submits resource with returned fileUrl on publish', async () => {
      const mockUploadRes = {
        data: {
          success: true,
          message: 'PDF file uploaded successfully',
          data: {
            fileUrl: '/uploads/sample-unit1-notes-12345.pdf',
            filename: 'sample-unit1-notes-12345.pdf'
          }
        }
      };

      const mockCreateRes = {
        data: {
          success: true,
          message: 'Resource created successfully',
          data: { _id: 'res-new-999' }
        }
      };

      const uploadSpy = vi.spyOn(ApiModule, 'adminUploadPdf').mockResolvedValue(mockUploadRes);
      const createSpy = vi.spyOn(ApiModule, 'adminCreateResource').mockResolvedValue(mockCreateRes);

      const { container } = render(
        <BrowserRouter>
          <AdminResourceFormPage />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/resource title/i), {
        target: { value: 'Compiler Design Unit 1 Notes' }
      });
      fireEvent.change(screen.getByLabelText(/subject code/i), {
        target: { value: 'KCS701' }
      });
      fireEvent.change(screen.getByLabelText(/subject name/i), {
        target: { value: 'Compiler Design' }
      });

      // Upload local PDF file
      const file = new File(['%PDF-1.4 dummy pdf'], 'compiler-notes.pdf', { type: 'application/pdf' });
      const fileInput = container.querySelector('#local-pdf-input');
      fireEvent.change(fileInput, { target: { files: [file] } });

      // Click "Save & Next"
      fireEvent.click(screen.getByRole('button', { name: /save & next/i }));

      // Review step reached
      await waitFor(() => {
        expect(screen.getByText('Compiler Design Unit 1 Notes')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /publish resource/i })).toBeInTheDocument();
      });

      // Click "Publish Resource"
      fireEvent.click(screen.getByRole('button', { name: /publish resource/i }));

      await waitFor(() => {
        expect(uploadSpy).toHaveBeenCalledWith(file);
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
          title: 'Compiler Design Unit 1 Notes',
          subjectCode: 'KCS701',
          subjectName: 'Compiler Design',
          fileUrl: '/uploads/sample-unit1-notes-12345.pdf'
        }));
      });
    });
  });

  describe('F: AdminReportsPage Issue Description Column', () => {
    it('preserves the issue-description column in reports table', async () => {
      vi.spyOn(ApiModule, 'adminGetReports').mockResolvedValue({
        data: {
          success: true,
          data: [
            {
              _id: 'rep-1',
              resourceTitle: 'Compiler Design PYQ 2023',
              issueType: 'broken_link',
              description: 'The PDF link throws a 404 error when clicking download.',
              status: 'pending',
              createdAt: '2026-10-18T10:00:00.000Z'
            }
          ]
        }
      });

      render(
        <BrowserRouter>
          <AdminReportsPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        // Verify Issue Description column header
        expect(screen.getByRole('columnheader', { name: /issue description/i })).toBeInTheDocument();
        // Verify student issue description text is rendered
        expect(screen.getByText(/the pdf link throws a 404 error/i)).toBeInTheDocument();
      });
    });
  });

  describe('G: AdminResourcesPage Layout & Responsiveness', () => {
    it('renders full-width resources management layout with responsive table and search toolbar', async () => {
      vi.spyOn(ApiModule, 'adminGetResources').mockResolvedValue({
        data: {
          success: true,
          data: [
            {
              _id: 'res-101',
              title: 'Operating Systems Complete Handwritten Notes',
              resourceType: 'Notes',
              branch: 'CSE',
              year: 3,
              semester: 5,
              subjectCode: 'KCS501',
              subjectName: 'Operating Systems',
              fileUrl: 'https://example.com/os.pdf',
              isPublished: true,
              views: 120
            }
          ],
          pagination: { page: 1, limit: 15, total: 1, totalPages: 1 }
        }
      });

      const { container } = render(
        <BrowserRouter>
          <AdminResourcesPage />
        </BrowserRouter>
      );

      // Verify page title and actions
      expect(screen.getByRole('heading', { level: 1, name: /all resources/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refresh resources list/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /add resource/i })).toBeInTheDocument();

      // Verify search input and filter dropdowns
      expect(screen.getByRole('searchbox', { name: /search resources/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /filter by branch/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /filter by semester/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /filter by resource type/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /filter by publication status/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument();

      // Verify table-responsive wrapper exists
      await waitFor(() => {
        expect(screen.getByText('Operating Systems Complete Handwritten Notes')).toBeInTheDocument();
      });

      const tableResponsive = container.querySelector('.table-responsive');
      expect(tableResponsive).toBeInTheDocument();

      const table = container.querySelector('table');
      expect(table).toHaveClass('w-100');
    });
  });
});

