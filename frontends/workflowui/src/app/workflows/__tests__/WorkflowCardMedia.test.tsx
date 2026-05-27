/**
 * Tests for WorkflowCardMedia component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import WorkflowCardMedia from '../WorkflowCardMedia';

describe('WorkflowCardMedia', () => {
  it('renders the default icon when no icon prop provided', () => {
    render(<WorkflowCardMedia status="active" />);
    expect(screen.getByText('⚙️')).toBeInTheDocument();
  });

  it('renders the custom icon when provided', () => {
    render(<WorkflowCardMedia status="active" icon="🚀" />);
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('uses a known status color for "active"', () => {
    const { container } = render(<WorkflowCardMedia status="active" />);
    const div = container.firstChild as HTMLElement;
    expect(div.style.backgroundColor).toBe('var(--mat-sys-tertiary)');
  });

  it('uses primary color fallback for unknown status', () => {
    const { container } = render(
      <WorkflowCardMedia status="unknown_status" />
    );
    const div = container.firstChild as HTMLElement;
    expect(div.style.backgroundColor).toBe('var(--mat-sys-primary)');
  });

  it.each(['active', 'draft', 'paused', 'published', 'deprecated'])(
    'applies a background color for status "%s"',
    (status) => {
      const { container } = render(<WorkflowCardMedia status={status} />);
      const div = container.firstChild as HTMLElement;
      expect(div.style.backgroundColor).toBeTruthy();
    }
  );
});
