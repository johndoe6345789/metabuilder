/**
 * Tests for useFavorites hook
 */

import { renderHook, act } from '@testing-library/react';

const mockListWorkflows = jest.fn().mockResolvedValue(undefined);
const mockDeleteWorkflow = jest.fn().mockResolvedValue(true);

const NOW = 1_700_000_000_000;
const rawWorkflows = [
  {
    id: 'wf-1',
    name: 'Bravo',
    description: 'second',
    updatedAt: NOW - 2 * 60 * 1000,
  },
  {
    id: 'wf-2',
    name: 'Alpha',
    description: 'first',
    updatedAt: NOW - 5 * 60 * 1000,
  },
  {
    id: 'wf-3',
    name: 'Charlie',
    description: null,
    updatedAt: NOW - 1 * 60 * 1000,
  },
];

jest.mock('@metabuilder/hooks', () => ({
  useWorkflows: jest.fn(() => ({
    workflows: rawWorkflows,
    isLoading: false,
    listWorkflows: mockListWorkflows,
    deleteWorkflow: mockDeleteWorkflow,
  })),
}));

import { useFavorites } from '../useFavorites';

describe('useFavorites', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(NOW);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls listWorkflows on mount', () => {
    renderHook(() => useFavorites());
    expect(mockListWorkflows).toHaveBeenCalledTimes(1);
  });

  it('returns isLoading from useWorkflows', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.isLoading).toBe(false);
  });

  it('defaults sortBy to "updatedAt"', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.sortBy).toBe('updatedAt');
  });

  it('sorts by updatedAt descending by default', () => {
    const { result } = renderHook(() => useFavorites());
    const ids = result.current.workflows.map((w) => w.id);
    expect(ids).toEqual(['wf-3', 'wf-1', 'wf-2']);
  });

  it('sorts alphabetically when sortBy is "name"', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.setSortBy('name');
    });
    const names = result.current.workflows.map((w) => w.name);
    expect(names).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  it('filters by searchQuery matching name', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.setSearchQuery('alpha');
    });
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].id).toBe('wf-2');
  });

  it('filters by searchQuery matching description', () => {
    const { result } = renderHook(() => useFavorites());
    act(() => {
      result.current.setSearchQuery('second');
    });
    expect(result.current.workflows).toHaveLength(1);
    expect(result.current.workflows[0].id).toBe('wf-1');
  });

  it('returns all workflows when searchQuery is empty', () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.workflows).toHaveLength(3);
  });

  describe('formatLastUpdated', () => {
    it('returns "Just now" for < 1 minute ago', () => {
      const { result } = renderHook(() => useFavorites());
      expect(result.current.formatLastUpdated(NOW - 30_000)).toBe('Just now');
    });

    it('returns "X min ago" for < 60 minutes', () => {
      const { result } = renderHook(() => useFavorites());
      expect(result.current.formatLastUpdated(NOW - 10 * 60_000)).toBe(
        '10 min ago'
      );
    });

    it('returns "X hours ago" for < 24 hours', () => {
      const { result } = renderHook(() => useFavorites());
      expect(result.current.formatLastUpdated(NOW - 5 * 60 * 60_000)).toBe(
        '5 hours ago'
      );
    });

    it('returns "X days ago" for < 7 days', () => {
      const { result } = renderHook(() => useFavorites());
      expect(result.current.formatLastUpdated(NOW - 3 * 24 * 60 * 60_000)).toBe(
        '3 days ago'
      );
    });

    it('returns a locale date string for >= 7 days', () => {
      const { result } = renderHook(() => useFavorites());
      const old = NOW - 14 * 24 * 60 * 60_000;
      expect(result.current.formatLastUpdated(old)).toBe(
        new Date(old).toLocaleDateString()
      );
    });
  });

  describe('handleDelete', () => {
    it('calls deleteWorkflow and reloads when confirmed', async () => {
      jest.spyOn(global, 'confirm').mockReturnValue(true);
      const { result } = renderHook(() => useFavorites());
      await act(async () => {
        await result.current.handleDelete('wf-1');
      });
      expect(mockDeleteWorkflow).toHaveBeenCalledWith('wf-1');
      expect(mockListWorkflows).toHaveBeenCalledTimes(2); // once on mount + once after delete
    });

    it('does not call deleteWorkflow when not confirmed', async () => {
      jest.spyOn(global, 'confirm').mockReturnValue(false);
      const { result } = renderHook(() => useFavorites());
      await act(async () => {
        await result.current.handleDelete('wf-1');
      });
      expect(mockDeleteWorkflow).not.toHaveBeenCalled();
    });
  });
});
