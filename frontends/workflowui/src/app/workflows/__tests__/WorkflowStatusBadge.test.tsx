/**
 * Tests for WorkflowStatusBadge component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import WorkflowStatusBadge from '../WorkflowStatusBadge';

describe('WorkflowStatusBadge', () => {
  it.each([
    ['active', 'Active'],
    ['draft', 'Draft'],
    ['paused', 'Paused'],
    ['published', 'Published'],
    ['deprecated', 'Deprecated'],
  ])('renders the correct label for status "%s"', (status, label) => {
    render(<WorkflowStatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('renders the raw status value for unknown statuses', () => {
    render(<WorkflowStatusBadge status="custom_status" />);
    expect(screen.getByText('custom_status')).toBeInTheDocument();
  });

  it('applies background color for known statuses', () => {
    const { container } = render(<WorkflowStatusBadge status="active" />);
    const span = container.querySelector('span');
    // Background should be set (color + '20')
    expect(span?.style.backgroundColor).toBeTruthy();
  });

  it('does not apply background for unknown status', () => {
    const { container } = render(<WorkflowStatusBadge status="unknown" />);
    const span = container.querySelector('span');
    expect(span?.style.backgroundColor).toBeFalsy();
  });
});
