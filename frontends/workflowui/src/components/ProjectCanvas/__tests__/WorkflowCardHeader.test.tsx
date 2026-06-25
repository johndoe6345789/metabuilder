/**
 * Tests for WorkflowCardHeader component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import WorkflowCardHeader from '../WorkflowCardHeader';

const defaultProps = {
  name: 'My Workflow',
  workflowId: 'wf-1',
  itemId: 'item-1',
  onOpen: jest.fn(),
  onDelete: jest.fn(),
};

describe('WorkflowCardHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders workflow name', () => {
    render(<WorkflowCardHeader {...defaultProps} />);
    expect(screen.getByText('My Workflow')).toBeInTheDocument();
  });

  it('renders "Untitled Workflow" when name is empty', () => {
    render(<WorkflowCardHeader {...defaultProps} name="" />);
    expect(screen.getByText('Untitled Workflow')).toBeInTheDocument();
  });

  it('renders Open button', () => {
    render(<WorkflowCardHeader {...defaultProps} />);
    expect(screen.getByRole('button', { name: /open workflow/i })).toBeInTheDocument();
  });

  it('renders Remove button', () => {
    render(<WorkflowCardHeader {...defaultProps} />);
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('calls onOpen with workflowId when open button clicked', () => {
    const onOpen = jest.fn();
    render(<WorkflowCardHeader {...defaultProps} onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /open workflow/i }));
    expect(onOpen).toHaveBeenCalledWith('wf-1');
  });

  it('calls onDelete with itemId when remove button clicked', () => {
    const onDelete = jest.fn();
    render(<WorkflowCardHeader {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onDelete).toHaveBeenCalledWith('item-1');
  });
});
