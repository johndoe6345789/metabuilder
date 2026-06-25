import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

import { useColumnManagement } from './useColumnManagement';

describe('useColumnManagement', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial state', () => {
    const { result } = renderHook(() => useColumnManagement());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.addColumn).toBe('function');
    expect(typeof result.current.modifyColumn).toBe('function');
    expect(typeof result.current.dropColumn).toBe('function');
  });

  it('addColumn should POST and return data on success', async () => {
    const responseData = { message: 'Column added' };
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => responseData,
      }),
    );

    const { result } = renderHook(() => useColumnManagement());

    let data: any;
    await act(async () => {
      data = await result.current.addColumn('users', {
        columnName: 'phone',
        dataType: 'VARCHAR',
        nullable: true,
      });
    });

    expect(data).toEqual(responseData);
    expect(result.current.error).toBeNull();
  });

  it('addColumn should set error on non-ok response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Column already exists' }),
      }),
    );

    const { result } = renderHook(() => useColumnManagement());

    await act(async () => {
      try {
        await result.current.addColumn('users', { columnName: 'email' });
      } catch {
        // expected
      }
    });

    expect(result.current.error).toBe('Column already exists');
  });

  it('modifyColumn should PUT to column-manage', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'modified' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useColumnManagement());

    await act(async () => {
      await result.current.modifyColumn('users', {
        columnName: 'email',
        newType: 'TEXT',
      });
    });

    expect(mockFetch.mock.calls[0][1].method).toBe('PUT');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.tableName).toBe('users');
    expect(body.columnName).toBe('email');
  });

  it('dropColumn should DELETE from column-manage', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'dropped' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useColumnManagement());

    await act(async () => {
      await result.current.dropColumn('users', { columnName: 'phone' });
    });

    expect(mockFetch.mock.calls[0][1].method).toBe('DELETE');
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.tableName).toBe('users');
  });

  it('loading should be false after operation completes', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    const { result } = renderHook(() => useColumnManagement());

    await act(async () => {
      await result.current.addColumn('users', { columnName: 'phone' });
    });

    expect(result.current.loading).toBe(false);
  });

  it('loading should be false after operation fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'fail' }),
      }),
    );

    const { result } = renderHook(() => useColumnManagement());

    await act(async () => {
      try {
        await result.current.addColumn('users', { columnName: 'phone' });
      } catch {
        // expected
      }
    });

    expect(result.current.loading).toBe(false);
  });
});
