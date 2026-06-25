/**
 * Tests for workflow-related components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

import WorkflowEmptyState from '../WorkflowEmptyState';

// ── WorkflowEmptyState ────────────────────────────────────────────────────────
describe('WorkflowEmptyState', () => {
  it('renders "No workflows yet" when no filters', () => {
    render(<WorkflowEmptyState hasFilters={false} />);
    expect(screen.getByText('No workflows yet')).toBeInTheDocument();
  });

  it('renders create workflow link when no filters', () => {
    render(<WorkflowEmptyState hasFilters={false} />);
    expect(screen.getByText('Create Your First Workflow')).toBeInTheDocument();
  });

  it('creates link to /editor/new when no filters', () => {
    render(<WorkflowEmptyState hasFilters={false} />);
    const link = screen.getByRole('link', { name: /Create Your First Workflow/i });
    expect(link).toHaveAttribute('href', '/editor/new');
  });

  it('renders "No workflows found" when filters active', () => {
    render(<WorkflowEmptyState hasFilters={true} />);
    expect(screen.getByText('No workflows found')).toBeInTheDocument();
  });

  it('renders filter adjustment message when filters active', () => {
    render(<WorkflowEmptyState hasFilters={true} />);
    expect(screen.getByText(/adjusting your search/i)).toBeInTheDocument();
  });

  it('does not show create link when filters are active', () => {
    render(<WorkflowEmptyState hasFilters={true} />);
    expect(screen.queryByText('Create Your First Workflow')).not.toBeInTheDocument();
  });
});
