// Mock @metabuilder/hooks to avoid ESM resolution issues
vi.mock('@metabuilder/hooks', () => ({
  useApiCall: () => {
    const { useState, useCallback } = require('react');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const execute = useCallback(async (url: string, options: any) => {
      setLoading(true);
      try {
        const response = await fetch(url, {
          method: options.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(options.body),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Request failed');
        return data;
      } catch (err: any) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    }, []);

    return { loading, error, execute };
  },
}));

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTableData } from './useTableData';

function mockFetch(ok: boolean, body: object) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

describe('useTableData', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with null data', () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }));
    const { result } = renderHook(() => useTableData());
    expect(result.current.data).toBeNull();
  });

  it('should expose fetchTableData function', () => {
    const { result } = renderHook(() => useTableData());
    expect(typeof result.current.fetchTableData).toBe('function');
  });

  it('should expose refresh function', () => {
    const { result } = renderHook(() => useTableData());
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should fetch data when tableName is provided', async () => {
    const tableData = { rows: [{ id: 1, name: 'Alice' }] };
    vi.stubGlobal('fetch', mockFetch(true, tableData));
    const { result } = renderHook(() => useTableData('users'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(tableData);
  });

  it('should not fetch when tableName is not provided', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    renderHook(() => useTableData(undefined));

    // Give it a brief moment to potentially run
    await new Promise(r => setTimeout(r, 10));
    // When tableName is undefined, no fetch occurs
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('should call fetchTableData manually', async () => {
    const tableData = { rows: [] };
    vi.stubGlobal('fetch', mockFetch(true, tableData));
    const { result } = renderHook(() => useTableData());

    await act(async () => {
      await result.current.fetchTableData('products');
    });

    expect(result.current.data).toEqual(tableData);
  });

  it('should call refresh to re-fetch with current tableName', async () => {
    const tableData = { rows: [{ id: 2 }] };
    vi.stubGlobal('fetch', mockFetch(true, tableData));
    const { result } = renderHook(() => useTableData('orders'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    // refresh re-fetches so data is set again
    expect(result.current.data).toEqual(tableData);
  });
});
