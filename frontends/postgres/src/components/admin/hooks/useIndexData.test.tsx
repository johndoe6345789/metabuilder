vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIndexData } from './useIndexData';

function mockFetch(ok: boolean, body: object) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

describe('useIndexData', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useIndexData());
    expect(result.current.selectedTable).toBe('');
    expect(result.current.indexes).toEqual([]);
    expect(result.current.availableColumns).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('');
    expect(result.current.success).toBe('');
  });

  it('should fetch indexes on handleTableChange', async () => {
    const indexData = [
      { index_name: 'pk_users', is_primary: true },
    ];
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ indexes: indexData }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({ columns: [{ column_name: 'id' }] }),
        }),
    );
    const { result } = renderHook(() => useIndexData());

    await act(async () => {
      await result.current.handleTableChange('users');
    });

    expect(result.current.selectedTable).toBe('users');
    expect(result.current.indexes).toEqual(indexData);
    expect(result.current.availableColumns).toEqual(['id']);
  });

  it('should set error when fetchIndexes fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn()
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'DB error' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({}),
        }),
    );
    const { result } = renderHook(() => useIndexData());

    await act(async () => {
      await result.current.handleTableChange('users');
    });

    expect(result.current.error).toBe('DB error');
  });

  it('should reset indexes and messages on new table selection', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ indexes: [], columns: [] }),
      }),
    );
    const { result } = renderHook(() => useIndexData());

    // Set some state first
    act(() => {
      result.current.setError('old error');
      result.current.setSuccess('old success');
    });

    await act(async () => {
      await result.current.handleTableChange('products');
    });

    expect(result.current.error).toBe('');
    expect(result.current.success).toBe('');
  });

  it('should not fetch when tableName is empty', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useIndexData());

    await act(async () => {
      await result.current.handleTableChange('');
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.selectedTable).toBe('');
  });

  it('should handle network error in fetchIndexes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );
    const { result } = renderHook(() => useIndexData());

    await act(async () => {
      await result.current.handleTableChange('users');
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should expose setLoading, setError, setSuccess, fetchIndexes', () => {
    const { result } = renderHook(() => useIndexData());
    expect(typeof result.current.setLoading).toBe('function');
    expect(typeof result.current.setError).toBe('function');
    expect(typeof result.current.setSuccess).toBe('function');
    expect(typeof result.current.fetchIndexes).toBe('function');
  });
});
