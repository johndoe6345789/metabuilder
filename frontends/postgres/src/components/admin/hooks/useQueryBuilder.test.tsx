import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

import { useQueryBuilder } from './useQueryBuilder';

describe('useQueryBuilder', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should expose a fetchColumns function', () => {
    const { result } = renderHook(() => useQueryBuilder());
    expect(typeof result.current.fetchColumns).toBe('function');
  });

  it('fetchColumns should return column names on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          columns: [
            { column_name: 'id' },
            { column_name: 'email' },
            { column_name: 'name' },
          ],
        }),
      }),
    );

    const { result } = renderHook(() => useQueryBuilder());
    const columns = await result.current.fetchColumns('users');

    expect(columns).toEqual(['id', 'email', 'name']);
  });

  it('fetchColumns should return empty array on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'not found' }),
      }),
    );

    const { result } = renderHook(() => useQueryBuilder());
    const columns = await result.current.fetchColumns('non_existent');

    expect(columns).toEqual([]);
  });

  it('fetchColumns should return empty array on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network failure')),
    );

    const { result } = renderHook(() => useQueryBuilder());
    const columns = await result.current.fetchColumns('users');

    expect(columns).toEqual([]);
  });

  it('fetchColumns should POST with the correct table name', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ columns: [] }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useQueryBuilder());
    await result.current.fetchColumns('products');

    const opts = mockFetch.mock.calls[0][1];
    expect(opts.method).toBe('POST');
    expect(JSON.parse(opts.body)).toEqual({ tableName: 'products' });
  });
});
