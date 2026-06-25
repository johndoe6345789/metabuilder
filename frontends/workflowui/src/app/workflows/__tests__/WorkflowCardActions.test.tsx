/**
 * Tests for WorkflowCardActions component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/link to a simple anchor
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>;
});

import WorkflowCardActions from '../WorkflowCardActions';

describe('WorkflowCardActions', () => {
  it('renders the Edit button', () => {
    render(
      <WorkflowCardActions workflowId="wf-1" onDelete={jest.fn()} />
    );
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  it('renders the Delete button', () => {
    render(
      <WorkflowCardActions workflowId="wf-1" onDelete={jest.fn()} />
    );
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('Edit link points to /editor/{workflowId}', () => {
    render(
      <WorkflowCardActions workflowId="wf-42" onDelete={jest.fn()} />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/editor/wf-42');
  });

  it('calls onDelete with the workflowId when Delete is clicked', async () => {
    const onDelete = jest.fn();
    render(
      <WorkflowCardActions workflowId="wf-99" onDelete={onDelete} />
    );
    await userEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onDelete).toHaveBeenCalledWith('wf-99');
  });
});
