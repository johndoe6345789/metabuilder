/**
 * Tests for useRecentWorkflows hook
 */

import { renderHook, act } from '@testing-library/react';

const mockListWorkflows = jest.fn();
const mockWorkflows = [
  {
    id: 'wf-1',
    name: 'Alpha',
    updatedAt: Date.now() - 5 * 60 * 1000, // 5 min ago
  },
  {
    id: 'wf-2',
    name: 'Beta',
    updatedAt: Date.now() - 2 * 60 * 1000, // 2 min ago
  },
  {
    id: 'wf-3',
    name: 'Gamma',
    updatedAt: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago
  },
];

jest.mock('@metabuilder/hooks', () => ({
  useWorkflows: jest.fn(() => ({
    workflows: mockWorkflows,
    isLoading: false,
    listWorkflows: mockListWorkflows,
  })),
}));

import { useRecentWorkflows } from '../useRecentWorkflows';

describe('useRecentWorkflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls listWorkflows on mount with limit 20', () => {
    renderHook(() => useRecentWorkflows());
    expect(mockListWorkflows).toHaveBeenCalledWith({ limit: 20 });
  });

  it('returns workflows sorted by updatedAt descending', () => {
    const { result } = renderHook(() => useRecentWorkflows());
    const ids = result.current.workflows.map((w) => w.id);
    // Beta (2 min) > Alpha (5 min) > Gamma (25 hours)
    expect(ids).toEqual(['wf-2', 'wf-1', 'wf-3']);
  });

  it('returns isLoading from useWorkflows', () => {
    const { result } = renderHook(() => useRecentWorkflows());
    expect(result.current.isLoading).toBe(false);
  });

  it('returns a formatTimeAgo function', () => {
    const { result } = renderHook(() => useRecentWorkflows());
    expect(typeof result.current.formatTimeAgo).toBe('function');
  });

  describe('formatTimeAgo', () => {
    const NOW = 1_700_000_000_000;

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(NOW);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('returns "Just now" for < 1 minute ago', () => {
      const { result } = renderHook(() => useRecentWorkflows());
      expect(result.current.formatTimeAgo(NOW - 30_000)).toBe('Just now');
    });

    it('returns singular "minute ago" for exactly 1 min', () => {
      const { result } = renderHook(() => useRecentWorkflows());
      expect(result.current.formatTimeAgo(NOW - 60_000)).toBe('1 minute ago');
    });

    it('returns plural "minutes ago" for > 1 min', () => {
      const { result } = renderHook(() => useRecentWorkflows());
      expect(result.current.formatTimeAgo(NOW - 5 * 60_000)).toBe(
        '5 minutes ago'
      );
    });

    it('returns singular "hour ago" for exactly 1 hour', () => {
      const { result } = renderHook(() => useRecentWorkflows());
      expect(result.current.formatTimeAgo(NOW - 60 * 60_000)).toBe(
        '1 hour ago'
      );
    });

    it('returns plural "hours ago" for > 1 hour', () => {
      const { result } = renderHook(() => useRecentWorkflows());
      expect(result.current.formatTimeAgo(NOW - 3 * 60 * 60_000)).toBe(
        '3 hours ago'
      );
    });

    it('returns singular "day ago" for exactly 1 day', () => {
      const { result } = renderHook(() => useRecentWorkflows());
      expect(result.current.formatTimeAgo(NOW - 24 * 60 * 60_000)).toBe(
        '1 day ago'
      );
    });

    it('returns plural "days ago" for 2–6 days', () => {
      const { result } = renderHook(() => useRecentWorkflows());
      expect(result.current.formatTimeAgo(NOW - 3 * 24 * 60 * 60_000)).toBe(
        '3 days ago'
      );
    });

    it('returns locale date string for >= 7 days', () => {
      const { result } = renderHook(() => useRecentWorkflows());
      const old = NOW - 10 * 24 * 60 * 60_000;
      const expected = new Date(old).toLocaleDateString();
      expect(result.current.formatTimeAgo(old)).toBe(expected);
    });
  });
});
