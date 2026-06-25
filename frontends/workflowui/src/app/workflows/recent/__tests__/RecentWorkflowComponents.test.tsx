/**
 * Tests for recent workflow components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

import RecentWorkflowHeader from '../RecentWorkflowHeader';
import RecentWorkflowMeta from '../RecentWorkflowMeta';
import RecentWorkflowItem from '../RecentWorkflowItem';

// ── RecentWorkflowHeader ──────────────────────────────────────────────────────
describe('RecentWorkflowHeader', () => {
  it('renders workflow name', () => {
    render(<RecentWorkflowHeader name="Email Notifier" status="active" />);
    expect(screen.getByText('Email Notifier')).toBeInTheDocument();
  });

  it('renders workflow status', () => {
    render(<RecentWorkflowHeader name="Email Notifier" status="active" />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders draft status', () => {
    render(<RecentWorkflowHeader name="Test WF" status="draft" />);
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('renders paused status', () => {
    render(<RecentWorkflowHeader name="Test WF" status="paused" />);
    expect(screen.getByText('paused')).toBeInTheDocument();
  });
});

// ── RecentWorkflowMeta ────────────────────────────────────────────────────────
describe('RecentWorkflowMeta', () => {
  const formatTimeAgo = jest.fn(() => '5m ago');

  it('renders time ago', () => {
    render(
      <RecentWorkflowMeta
        updatedAt={Date.now()}
        nodeCount={5}
        version="1.2.0"
        formatTimeAgo={formatTimeAgo}
      />
    );
    expect(screen.getByText(/Updated 5m ago/)).toBeInTheDocument();
  });

  it('renders node count', () => {
    render(
      <RecentWorkflowMeta
        updatedAt={Date.now()}
        nodeCount={7}
        version="1.0.0"
        formatTimeAgo={formatTimeAgo}
      />
    );
    expect(screen.getByText('7 nodes')).toBeInTheDocument();
  });

  it('renders version', () => {
    render(
      <RecentWorkflowMeta
        updatedAt={Date.now()}
        nodeCount={3}
        version="2.5.1"
        formatTimeAgo={formatTimeAgo}
      />
    );
    expect(screen.getByText('v2.5.1')).toBeInTheDocument();
  });
});

// ── RecentWorkflowItem ────────────────────────────────────────────────────────
describe('RecentWorkflowItem', () => {
  const workflow = {
    id: 'wf-123',
    name: 'Data Pipeline',
    description: 'Syncs data hourly',
    status: 'active',
    updatedAt: Date.now(),
    nodes: [{ id: 'n1' }, { id: 'n2' }, { id: 'n3' }],
    version: '1.0.0',
    connections: [],
  } as any;

  it('renders workflow name', () => {
    render(<RecentWorkflowItem workflow={workflow} formatTimeAgo={() => '1h ago'} />);
    expect(screen.getByText('Data Pipeline')).toBeInTheDocument();
  });

  it('renders workflow description', () => {
    render(<RecentWorkflowItem workflow={workflow} formatTimeAgo={() => '1h ago'} />);
    expect(screen.getByText('Syncs data hourly')).toBeInTheDocument();
  });

  it('renders "No description" for empty description', () => {
    render(
      <RecentWorkflowItem
        workflow={{ ...workflow, description: '' }}
        formatTimeAgo={() => '1h ago'}
      />
    );
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('renders node count', () => {
    render(<RecentWorkflowItem workflow={workflow} formatTimeAgo={() => '1h ago'} />);
    expect(screen.getByText('3 nodes')).toBeInTheDocument();
  });

  it('renders edit button', () => {
    render(<RecentWorkflowItem workflow={workflow} formatTimeAgo={() => '1h ago'} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('edit button links to correct editor URL', () => {
    render(<RecentWorkflowItem workflow={workflow} formatTimeAgo={() => '1h ago'} />);
    const link = screen.getByRole('link', { name: /edit/i });
    expect(link).toHaveAttribute('href', '/editor/wf-123');
  });
});
