import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResourceCard } from '../components/public/ResourceCard';

describe('ResourceCard Component', () => {
  const mockResource = {
    _id: 'res-123',
    title: 'Data Structures and Algorithms Notes',
    resourceType: 'Notes',
    branch: 'CSE',
    year: 2,
    semester: 3,
    subjectCode: 'KCS301',
    subjectName: 'Data Structures',
    fileUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/notes.pdf',
    downloadUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/notes.pdf',
    previewUrl: 'https://raw.githubusercontent.com/aktu-community/sample-notes/main/notes.pdf',
    academicYear: '2024-25',
    regulation: 'CBCS',
    description: 'Comprehensive study notes.'
  };

  it('renders title, subject info, and badges accurately', () => {
    render(<ResourceCard resource={mockResource} onReport={vi.fn()} />);

    expect(screen.getByText('Data Structures and Algorithms Notes')).toBeInTheDocument();
    expect(screen.getByText('KCS301')).toBeInTheDocument();
    expect(screen.getAllByText(/Data Structures/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('CSE')).toBeInTheDocument();
    expect(screen.getByText('Sem 3')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('provides a direct download link without login requirement', () => {
    render(<ResourceCard resource={mockResource} onReport={vi.fn()} />);

    const downloadBtn = screen.getByRole('link', { name: /Download PDF/i });
    expect(downloadBtn).toHaveAttribute('href', mockResource.downloadUrl);
    expect(downloadBtn).toHaveAttribute('target', '_blank');
  });
});
