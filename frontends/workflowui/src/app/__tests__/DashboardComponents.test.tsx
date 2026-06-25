/**
 * Tests for dashboard components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

import DashboardStatsBanner from '../DashboardStatsBanner';
import DashboardAchievementPreview from '../DashboardAchievementPreview';
import WorkspaceEmptyState from '../WorkspaceEmptyState';

// ── DashboardAchievementPreview ──────────────────────────────────────────────
describe('DashboardAchievementPreview', () => {
  it('renders the "+4 more" link', () => {
    render(<DashboardAchievementPreview />);
    expect(screen.getByText('+4 more')).toBeInTheDocument();
  });

  it('the link points to /achievements', () => {
    render(<DashboardAchievementPreview />);
    const link = screen.getByRole('link', { name: /\+4 more/i });
    expect(link).toHaveAttribute('href', '/achievements');
  });
});

// ── DashboardStatsBanner ─────────────────────────────────────────────────────
describe('DashboardStatsBanner', () => {
  it('renders "nodes today" stat', () => {
    render(<DashboardStatsBanner />);
    expect(screen.getByText('nodes today')).toBeInTheDocument();
  });

  it('renders "runs today" stat', () => {
    render(<DashboardStatsBanner />);
    expect(screen.getByText('runs today')).toBeInTheDocument();
  });

  it('renders "failed" stat', () => {
    render(<DashboardStatsBanner />);
    expect(screen.getByText('failed')).toBeInTheDocument();
  });

  it('renders "saved today" stat', () => {
    render(<DashboardStatsBanner />);
    expect(screen.getByText('saved today')).toBeInTheDocument();
  });

  it('renders the nodes count', () => {
    render(<DashboardStatsBanner />);
    expect(screen.getByText('23')).toBeInTheDocument();
  });

  it('renders the runs count', () => {
    render(<DashboardStatsBanner />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});

// ── WorkspaceEmptyState ──────────────────────────────────────────────────────
describe('WorkspaceEmptyState', () => {
  it('renders "No workspaces yet" heading', () => {
    render(<WorkspaceEmptyState onCreateWorkspace={jest.fn()} />);
    expect(screen.getByText('No workspaces yet')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<WorkspaceEmptyState onCreateWorkspace={jest.fn()} />);
    expect(screen.getByText(/organize your projects/i)).toBeInTheDocument();
  });

  it('renders the create workspace button', () => {
    render(<WorkspaceEmptyState onCreateWorkspace={jest.fn()} />);
    const btn = screen.getByRole('button', { name: /Create Your First Workspace/i });
    expect(btn).toBeInTheDocument();
  });

  it('calls onCreateWorkspace when button is clicked', async () => {
    const onCreateWorkspace = jest.fn();
    render(<WorkspaceEmptyState onCreateWorkspace={onCreateWorkspace} />);
    const btn = screen.getByRole('button', { name: /Create Your First Workspace/i });
    await userEvent.click(btn);
    expect(onCreateWorkspace).toHaveBeenCalledTimes(1);
  });
});
