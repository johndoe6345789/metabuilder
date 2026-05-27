import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

import { useColumnManager } from './useColumnManager';

describe('useColumnManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial empty state', () => {
    vi.stubGlobal('fetch', vi.fn());

    const { result } = renderHook(() => useColumnManager());

    expect(result.current.selectedTable).toBe('');
    expect(result.current.schema).toBeNull();
    expect(result.current.dialog).toBeNull();
    expect(result.current.columns).toEqual([]);
  });

  it('should update selectedTable via setSelectedTable', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        columns: [{ column_name: 'id' }, { column_name: 'name' }],
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useColumnManager());

    act(() => {
      result.current.setSelectedTable('users');
    });

    expect(result.current.selectedTable).toBe('users');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('should set schema to null when selectedTable cleared', async () => {
    vi.stubGlobal('fetch', vi.fn());

    const { result } = renderHook(() => useColumnManager());

    act(() => {
      result.current.setSelectedTable('');
    });

    expect(result.current.schema).toBeNull();
  });

  it('should update schema on successful fetch', async () => {
    const schemaData = {
      columns: [{ column_name: 'id' }, { column_name: 'email' }],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => schemaData,
      }),
    );

    const { result } = renderHook(() => useColumnManager());

    act(() => {
      result.current.setSelectedTable('users');
    });

    await waitFor(() => {
      expect(result.current.schema).toEqual(schemaData);
    });

    expect(result.current.columns).toHaveLength(2);
  });

  it('should update dialog state via setDialog', () => {
    vi.stubGlobal('fetch', vi.fn());

    const { result } = renderHook(() => useColumnManager());

    act(() => {
      result.current.setDialog('add');
    });

    expect(result.current.dialog).toBe('add');

    act(() => {
      result.current.setDialog(null);
    });

    expect(result.current.dialog).toBeNull();
  });

  it('withRefresh should call fn, refresh schema, and close dialog', async () => {
    const schemaData = {
      columns: [{ column_name: 'id' }],
    };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => schemaData,
      }),
    );

    const { result } = renderHook(() => useColumnManager());

    act(() => {
      result.current.setSelectedTable('users');
      result.current.setDialog('add');
    });

    await waitFor(() => {
      expect(result.current.schema).toBeDefined();
    });

    const mockFn = vi
      .fn()
      .mockResolvedValue(undefined);

    await act(async () => {
      await result.current.withRefresh(mockFn)({ columnName: 'test' });
    });

    expect(mockFn).toHaveBeenCalledWith('users', { columnName: 'test' });
    expect(result.current.dialog).toBeNull();
  });
});
