/**
 * Tests for WorkspaceCard component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WorkspaceCard from '../WorkspaceCard';

const makeWorkspace = (overrides = {}) => ({
  id: 'ws-1',
  name: 'My Workspace',
  description: 'A test workspace',
  color: '#6750A4',
  createdAt: '2024-01-15T00:00:00.000Z',
  ...overrides,
});

describe('WorkspaceCard', () => {
  it('renders the workspace name', () => {
    render(<WorkspaceCard workspace={makeWorkspace()} onClick={jest.fn()} />);
    expect(screen.getByText('My Workspace')).toBeInTheDocument();
  });

  it('renders the workspace description', () => {
    render(
      <WorkspaceCard
        workspace={makeWorkspace({ description: 'Test desc' })}
        onClick={jest.fn()}
      />
    );
    expect(screen.getByText('Test desc')).toBeInTheDocument();
  });

  it('renders "No description" when description is omitted', () => {
    render(
      <WorkspaceCard
        workspace={makeWorkspace({ description: undefined })}
        onClick={jest.fn()}
      />
    );
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('renders correct initials (first two words)', () => {
    render(
      <WorkspaceCard
        workspace={makeWorkspace({ name: 'Marketing Automation Hub' })}
        onClick={jest.fn()}
      />
    );
    expect(screen.getByText('MA')).toBeInTheDocument();
  });

  it('renders a single-word name initial correctly', () => {
    render(
      <WorkspaceCard
        workspace={makeWorkspace({ name: 'Personal' })}
        onClick={jest.fn()}
      />
    );
    expect(screen.getByText('P')).toBeInTheDocument();
  });

  it('calls onClick when the card is clicked', async () => {
    const onClick = jest.fn();
    render(<WorkspaceCard workspace={makeWorkspace()} onClick={onClick} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick when Enter key is pressed', async () => {
    const onClick = jest.fn();
    render(<WorkspaceCard workspace={makeWorkspace()} onClick={onClick} />);
    const card = screen.getByRole('button');
    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has accessible aria-label', () => {
    render(
      <WorkspaceCard
        workspace={makeWorkspace({ name: 'My Workspace' })}
        onClick={jest.fn()}
      />
    );
    expect(
      screen.getByLabelText('Open My Workspace workspace')
    ).toBeInTheDocument();
  });

  it('renders the formatted creation date', () => {
    render(
      <WorkspaceCard
        workspace={makeWorkspace({ createdAt: '2024-01-15T00:00:00.000Z' })}
        onClick={jest.fn()}
      />
    );
    // Just check "Created" text is present
    expect(screen.getByText(/Created/)).toBeInTheDocument();
  });
});
