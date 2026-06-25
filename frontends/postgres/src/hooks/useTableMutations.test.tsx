vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTableMutations } from './useTableMutations';

function mockFetch(ok: boolean, body: object) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

describe('useTableMutations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with loading false and null error', () => {
    const { result } = renderHook(() =>
      useTableMutations(async () => {}),
    );
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should createTable successfully', async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('fetch', mockFetch(true, { message: 'created' }));
    const { result } = renderHook(() => useTableMutations(onSuccess));

    await act(async () => {
      await result.current.createTable('test_table', [
        { name: 'id', type: 'INTEGER' },
      ]);
    });

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error when createTable fails', async () => {
    const onSuccess = vi.fn();
    vi.stubGlobal(
      'fetch',
      mockFetch(false, { error: 'Table already exists' }),
    );
    const { result } = renderHook(() => useTableMutations(onSuccess));

    await act(async () => {
      try {
        await result.current.createTable('existing_table', []);
      } catch (_) {
        // expected
      }
    });

    expect(result.current.error).toBe('Table already exists');
    expect(result.current.loading).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should dropTable successfully', async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('fetch', mockFetch(true, { message: 'dropped' }));
    const { result } = renderHook(() => useTableMutations(onSuccess));

    await act(async () => {
      await result.current.dropTable('test_table');
    });

    expect(onSuccess).toHaveBeenCalledOnce();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set error when dropTable fails', async () => {
    const onSuccess = vi.fn();
    vi.stubGlobal(
      'fetch',
      mockFetch(false, { error: 'Table not found' }),
    );
    const { result } = renderHook(() => useTableMutations(onSuccess));

    await act(async () => {
      try {
        await result.current.dropTable('nonexistent_table');
      } catch (_) {
        // expected
      }
    });

    expect(result.current.error).toBe('Table not found');
    expect(result.current.loading).toBe(false);
  });

  it('should handle network error in createTable', async () => {
    const onSuccess = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );
    const { result } = renderHook(() => useTableMutations(onSuccess));

    await act(async () => {
      try {
        await result.current.createTable('test_table', []);
      } catch (_) {
        // expected
      }
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should handle network error in dropTable', async () => {
    const onSuccess = vi.fn();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('Network error')),
    );
    const { result } = renderHook(() => useTableMutations(onSuccess));

    await act(async () => {
      try {
        await result.current.dropTable('test_table');
      } catch (_) {
        // expected
      }
    });

    expect(result.current.error).toBe('Network error');
  });

  it('should POST to table-manage for createTable', async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const fetchMock = mockFetch(true, { message: 'created' });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useTableMutations(onSuccess));

    await act(async () => {
      await result.current.createTable('new_table', [{ name: 'id', type: 'INTEGER' }]);
    });

    const [url, opts] = fetchMock.mock.calls[0]!;
    expect(url).toContain('table-manage');
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body);
    expect(body.tableName).toBe('new_table');
  });

  it('should DELETE to table-manage for dropTable', async () => {
    const onSuccess = vi.fn().mockResolvedValue(undefined);
    const fetchMock = mockFetch(true, { message: 'dropped' });
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useTableMutations(onSuccess));

    await act(async () => {
      await result.current.dropTable('old_table');
    });

    const [url, opts] = fetchMock.mock.calls[0]!;
    expect(url).toContain('table-manage');
    expect(opts.method).toBe('DELETE');
    const body = JSON.parse(opts.body);
    expect(body.tableName).toBe('old_table');
  });
});
