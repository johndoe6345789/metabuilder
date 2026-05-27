/**
 * Tests for WorkflowFilters component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkflowFilters from '../WorkflowFilters';

const defaultProps = {
  searchQuery: '',
  setSearchQuery: jest.fn(),
  statusFilter: 'all',
  setStatusFilter: jest.fn(),
  categoryFilter: 'all',
  setCategoryFilter: jest.fn(),
};

describe('WorkflowFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the search input', () => {
    render(<WorkflowFilters {...defaultProps} />);
    expect(
      screen.getByPlaceholderText(/search workflows/i)
    ).toBeInTheDocument();
  });

  it('renders the Status select', () => {
    render(<WorkflowFilters {...defaultProps} />);
    // The Select renders as a <select> element in the mock
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThanOrEqual(1);
  });

  it('shows all status options', () => {
    render(<WorkflowFilters {...defaultProps} />);
    // The mock MenuItem renders as <option>
    expect(screen.getByText('All Status')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
    expect(screen.getByText('Paused')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
  });

  it('shows all category options', () => {
    render(<WorkflowFilters {...defaultProps} />);
    expect(screen.getByText('All Categories')).toBeInTheDocument();
    expect(screen.getByText('Automation')).toBeInTheDocument();
    expect(screen.getByText('Integration')).toBeInTheDocument();
  });

  it('calls setSearchQuery when search input changes', async () => {
    render(<WorkflowFilters {...defaultProps} />);
    const input = screen.getByPlaceholderText(/search workflows/i);
    await userEvent.type(input, 'my workflow');
    // setSearchQuery should have been called per keystroke
    expect(defaultProps.setSearchQuery).toHaveBeenCalled();
  });

  it('calls setStatusFilter when status select changes', () => {
    render(<WorkflowFilters {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    // Status is the first select
    fireEvent.change(selects[0], { target: { value: 'active' } });
    expect(defaultProps.setStatusFilter).toHaveBeenCalledWith('active');
  });

  it('calls setCategoryFilter when category select changes', () => {
    render(<WorkflowFilters {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    // Category is the second select
    fireEvent.change(selects[1], { target: { value: 'automation' } });
    expect(defaultProps.setCategoryFilter).toHaveBeenCalledWith('automation');
  });

  it('reflects the current searchQuery value', () => {
    render(<WorkflowFilters {...defaultProps} searchQuery="hello" />);
    const input = screen.getByPlaceholderText(
      /search workflows/i
    ) as HTMLInputElement;
    expect(input.value).toBe('hello');
  });
});
