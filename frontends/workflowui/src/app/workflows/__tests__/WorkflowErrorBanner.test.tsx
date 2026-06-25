/**
 * Tests for WorkflowErrorBanner component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import WorkflowErrorBanner from '../WorkflowErrorBanner';

describe('WorkflowErrorBanner', () => {
  it('renders nothing when error is null', () => {
    const { container } = render(<WorkflowErrorBanner error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the error message when error is provided', () => {
    render(<WorkflowErrorBanner error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders a div when error is a non-empty string', () => {
    const { container } = render(
      <WorkflowErrorBanner error="Network error" />
    );
    expect(container.querySelector('div')).toBeInTheDocument();
  });
});
