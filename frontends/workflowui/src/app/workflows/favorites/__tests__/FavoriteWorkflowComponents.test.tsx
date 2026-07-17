/**
 * Tests for favorite workflow components
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

jest.mock('next/link', () => ({ children, href }: any) => <a href={href}>{children}</a>);

import FavoriteWorkflowActions from '../FavoriteWorkflowActions';
import FavoriteWorkflowInfo from '../FavoriteWorkflowInfo';
import FavoriteWorkflowFilters from '../FavoriteWorkflowFilters';
import FavoriteWorkflowItem from '../FavoriteWorkflowItem';

// ── FavoriteWorkflowActions ────────────────────────────────────────────────────
describe('FavoriteWorkflowActions', () => {
  it('renders the Edit button', () => {
    render(<FavoriteWorkflowActions workflowId="wf-1" onDelete={jest.fn()} />);
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('renders the Delete button', () => {
    render(<FavoriteWorkflowActions workflowId="wf-1" onDelete={jest.fn()} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('edit button links to the editor', () => {
    render(<FavoriteWorkflowActions workflowId="wf-abc" onDelete={jest.fn()} />);
    const link = screen.getByRole('link', { name: /edit/i });
    expect(link).toHaveAttribute('href', '/editor/wf-abc');
  });

  it('calls onDelete when Delete is clicked', async () => {
    const onDelete = jest.fn();
    render(<FavoriteWorkflowActions workflowId="wf-1" onDelete={onDelete} />);
    await userEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('wf-1');
  });
});

// ── FavoriteWorkflowInfo ──────────────────────────────────────────────────────
describe('FavoriteWorkflowInfo', () => {
  const props = {
    name: 'Email Pipeline',
    status: 'active',
    description: 'Sends emails on trigger',
    version: '1.0.0',
    nodeCount: 5,
    updatedAt: 1700000000,
    formatLastUpdated: jest.fn(() => '2 days ago'),
  };

  it('renders workflow name', () => {
    render(<FavoriteWorkflowInfo {...props} />);
    expect(screen.getByText('Email Pipeline')).toBeInTheDocument();
  });

  it('renders workflow status', () => {
    render(<FavoriteWorkflowInfo {...props} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<FavoriteWorkflowInfo {...props} />);
    expect(screen.getByText('Sends emails on trigger')).toBeInTheDocument();
  });

  it('renders "No description" when description is empty', () => {
    render(<FavoriteWorkflowInfo {...props} description={undefined} />);
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('renders node count', () => {
    render(<FavoriteWorkflowInfo {...props} />);
    expect(screen.getByText('5 nodes')).toBeInTheDocument();
  });

  it('renders version', () => {
    render(<FavoriteWorkflowInfo {...props} />);
    expect(screen.getByText('v1.0.0')).toBeInTheDocument();
  });

  it('renders formatted last updated time', () => {
    render(<FavoriteWorkflowInfo {...props} />);
    expect(props.formatLastUpdated).toHaveBeenCalledWith(1700000000);
    expect(screen.getByText('2 days ago')).toBeInTheDocument();
  });
});

// ── FavoriteWorkflowFilters ───────────────────────────────────────────────────
describe('FavoriteWorkflowFilters', () => {
  const props = {
    searchQuery: '',
    sortBy: 'updatedAt' as const,
    setSearchQuery: jest.fn(),
    setSortBy: jest.fn(),
  };

  it('renders search input', () => {
    render(<FavoriteWorkflowFilters {...props} />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('calls setSearchQuery when search input changes', async () => {
    const setSearchQuery = jest.fn();
    render(<FavoriteWorkflowFilters {...props} setSearchQuery={setSearchQuery} />);
    await userEvent.type(screen.getByTestId('search-input'), 'email');
    expect(setSearchQuery).toHaveBeenCalled();
  });

  it('renders the sort select with options', () => {
    render(<FavoriteWorkflowFilters {...props} />);
    expect(screen.getByText('Last Updated')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('calls setSortBy when sort changes', () => {
    const setSortBy = jest.fn();
    render(<FavoriteWorkflowFilters {...props} setSortBy={setSortBy} />);
    // The select is a native <select> in m3Mock
    const select = document.querySelector('select') as HTMLSelectElement;
    if (select) {
      fireEvent.change(select, { target: { value: 'name' } });
      expect(setSortBy).toHaveBeenCalledWith('name');
    }
  });
});

// ── FavoriteWorkflowItem ──────────────────────────────────────────────────────
describe('FavoriteWorkflowItem', () => {
  const workflow = {
    id: 'wf-10',
    name: 'Data Sync',
    description: 'Syncs data',
    status: 'active',
    version: '2.0.0',
    updatedAt: 1700000000,
    nodes: [{ id: 'n1' }, { id: 'n2' }],
  };

  it('renders workflow name', () => {
    render(
      <FavoriteWorkflowItem
        workflow={workflow}
        onDelete={jest.fn()}
        formatLastUpdated={() => 'Today'}
      />
    );
    expect(screen.getByText('Data Sync')).toBeInTheDocument();
  });

  it('renders workflow status', () => {
    render(
      <FavoriteWorkflowItem
        workflow={workflow}
        onDelete={jest.fn()}
        formatLastUpdated={() => 'Today'}
      />
    );
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('renders node count', () => {
    render(
      <FavoriteWorkflowItem
        workflow={workflow}
        onDelete={jest.fn()}
        formatLastUpdated={() => 'Today'}
      />
    );
    expect(screen.getByText('2 nodes')).toBeInTheDocument();
  });

  it('calls onDelete when Delete button clicked', async () => {
    const onDelete = jest.fn();
    render(
      <FavoriteWorkflowItem
        workflow={workflow}
        onDelete={onDelete}
        formatLastUpdated={() => 'Today'}
      />
    );
    await userEvent.click(screen.getByText('Delete'));
    expect(onDelete).toHaveBeenCalledWith('wf-10');
  });
});
