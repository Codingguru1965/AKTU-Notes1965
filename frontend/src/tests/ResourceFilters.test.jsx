import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ResourceFilters } from '../components/public/ResourceFilters';

describe('ResourceFilters Component', () => {
  it('renders cascading dropdowns and triggers onFilterChange', () => {
    const handleFilterChange = vi.fn();
    const handleReset = vi.fn();

    render(
      <ResourceFilters
        filters={{ branch: 'CSE', year: '2', semester: '3' }}
        onFilterChange={handleFilterChange}
        onResetFilters={handleReset}
        availableFilters={{ branches: ['CSE', 'IT', 'ECE'], resourceTypes: ['Notes', 'Syllabus', 'PYQ'] }}
      />
    );

    const branchSelect = screen.getByLabelText(/Branch/i);
    expect(branchSelect.value).toBe('CSE');

    fireEvent.change(branchSelect, { target: { value: 'IT' } });
    expect(handleFilterChange).toHaveBeenCalledWith({ branch: 'IT', subjectCode: '' });
  });

  it('displays Clear All button when filters are active', () => {
    const handleReset = vi.fn();

    render(
      <ResourceFilters
        filters={{ branch: 'CSE' }}
        onFilterChange={vi.fn()}
        onResetFilters={handleReset}
      />
    );

    const clearBtn = screen.getByRole('button', { name: /Clear all/i });
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});
