/**
 * Tests for useWorkflowsPage hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';

const mockListWorkflows = jest.fn().mockResolvedValue(undefined);
const mockDeleteWorkflow = jest.fn().mockResolvedValue(true);

const workflows = [
  {
    id: 'wf-1',
    name: 'Automation Flow',
    description: 'Automates tasks',
    status: 'active',
    nodes: [],
    version: '1',
    updatedAt: 0,
  },
  {
    id: 'wf-2',
    name: 'Data Pipeline',
    description: null,
    status: 'draft',
    nodes: [{ id: 'n1' }],
    version: '2',
    updatedAt: 0,
  },
];

jest.mock('@metabuilder/hooks', () => ({
  useWorkflows: jest.fn(() => ({
    workflows,
    isLoading: false,
    error: null,
    listWorkflows: mockListWorkflows,
    deleteWorkflow: mockDeleteWorkflow,
  })),
}));

import { useWorkflowsPage } from '../useWorkflowsPage';

describe('useWorkflowsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls listWorkflows on mount', async () => {
    renderHook(() => useWorkflowsPage());
    await waitFor(() => {
      expect(mockListWorkflows).toHaveBeenCalledTimes(1);
    });
  });

  it('returns all workflows initially', () => {
    const { result } = renderHook(() => useWorkflowsPage());
    expect(result.current.workflows).toHaveLength(2);
  });

  it('filters by name via searchQuery', async () => {
    const { result } = renderHook(() => useWorkflowsPage());
    act(() => {
      result.current.setSearchQuery('auto');
    });
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].id).toBe('wf-1');
  });

  it('filters by description via searchQuery', async () => {
    const { result } = renderHook(() => useWorkflowsPage());
    act(() => {
      result.current.setSearchQuery('automates');
    });
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].id).toBe('wf-1');
  });

  it('returns empty array when no workflows match searchQuery', () => {
    const { result } = renderHook(() => useWorkflowsPage());
    act(() => {
      result.current.setSearchQuery('zzz_no_match');
    });
    expect(result.current.workflows).toHaveLength(0);
  });

  it('hasFilters is false initially', () => {
    const { result } = renderHook(() => useWorkflowsPage());
    expect(result.current.hasFilters).toBe(false);
  });

  it('hasFilters is true when searchQuery is set', () => {
    const { result } = renderHook(() => useWorkflowsPage());
    act(() => {
      result.current.setSearchQuery('flow');
    });
    expect(result.current.hasFilters).toBe(true);
  });

  it('hasFilters is true when statusFilter is not "all"', async () => {
    const { result } = renderHook(() => useWorkflowsPage());
    act(() => {
      result.current.setStatusFilter('active');
    });
    expect(result.current.hasFilters).toBe(true);
  });

  it('hasFilters is true when categoryFilter is not "all"', () => {
    const { result } = renderHook(() => useWorkflowsPage());
    act(() => {
      result.current.setCategoryFilter('automation');
    });
    expect(result.current.hasFilters).toBe(true);
  });

  it('reloads workflows when statusFilter changes', async () => {
    const { result } = renderHook(() => useWorkflowsPage());
    await waitFor(() => expect(mockListWorkflows).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.setStatusFilter('active');
    });

    await waitFor(() =>
      expect(mockListWorkflows).toHaveBeenCalledWith({ status: 'active' })
    );
  });

  it('reloads workflows when categoryFilter changes', async () => {
    const { result } = renderHook(() => useWorkflowsPage());
    await waitFor(() => expect(mockListWorkflows).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.setCategoryFilter('automation');
    });

    await waitFor(() =>
      expect(mockListWorkflows).toHaveBeenCalledWith({
        category: 'automation',
      })
    );
  });

  describe('handleDelete', () => {
    it('calls deleteWorkflow and reloads on confirmation', async () => {
      jest.spyOn(global, 'confirm').mockReturnValue(true);
      const { result } = renderHook(() => useWorkflowsPage());
      await act(async () => {
        await result.current.handleDelete('wf-1');
      });
      expect(mockDeleteWorkflow).toHaveBeenCalledWith('wf-1');
    });

    it('does not delete when confirm is cancelled', async () => {
      jest.spyOn(global, 'confirm').mockReturnValue(false);
      const { result } = renderHook(() => useWorkflowsPage());
      await act(async () => {
        await result.current.handleDelete('wf-1');
      });
      expect(mockDeleteWorkflow).not.toHaveBeenCalled();
    });
  });
});
