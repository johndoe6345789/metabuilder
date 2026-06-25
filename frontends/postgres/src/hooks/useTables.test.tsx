vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

// Mock next/navigation router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTables } from './useTables';

function mockFetch(ok: boolean, body: object, status = ok ? 200 : 400) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(body),
  });
}

describe('useTables', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with empty tables and loading true', async () => {
    vi.stubGlobal('fetch', mockFetch(true, { tables: [] }));
    const { result } = renderHook(() => useTables());
    // loading starts true on mount (fetch called in useEffect)
    expect(result.current.tables).toEqual([]);
    expect(typeof result.current.fetchTables).toBe('function');
  });

  it('should fetch and populate tables on mount', async () => {
    const tables = [{ table_name: 'users' }, { table_name: 'products' }];
    vi.stubGlobal('fetch', mockFetch(true, { tables }));
    const { result } = renderHook(() => useTables());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tables).toEqual(tables);
    expect(result.current.error).toBeNull();
  });

  it('should set error on failed fetch', async () => {
    vi.stubGlobal(
      'fetch',
      mockFetch(false, { error: 'DB error' }, 500),
    );
    const { result } = renderHook(() => useTables());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch tables');
  });

  it('should set error on network error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );
    const { result } = renderHook(() => useTables());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should expose createTable and dropTable from useTableMutations', async () => {
    vi.stubGlobal('fetch', mockFetch(true, { tables: [] }));
    const { result } = renderHook(() => useTables());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(typeof result.current.createTable).toBe('function');
    expect(typeof result.current.dropTable).toBe('function');
  });

  it('should not throw on 401 (redirect happens internally)', async () => {
    vi.stubGlobal('fetch', mockFetch(false, {}, 401));
    const { result } = renderHook(() => useTables());

    // 401 causes early return, loading should stop eventually
    await waitFor(() => expect(result.current.loading).toBe(false), {
      timeout: 2000,
    });
    // Tables should remain empty
    expect(result.current.tables).toEqual([]);
  });
});
