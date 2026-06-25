vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useIndexManager } from './useIndexManager';

function mockFetch(ok: boolean, body: object) {
  return vi.fn().mockResolvedValue({
    ok,
    json: () => Promise.resolve(body),
  });
}

describe('useIndexManager', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with default createForm state', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    expect(result.current.createForm.open).toBe(false);
    expect(result.current.createForm.indexName).toBe('');
    expect(result.current.createForm.selectedColumns).toEqual([]);
    expect(result.current.createForm.indexType).toBe('BTREE');
    expect(result.current.createForm.isUnique).toBe(false);
  });

  it('should initialize deleteIndex as null', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    expect(result.current.deleteIndex).toBeNull();
  });

  it('should update createForm via createActions.setOpen', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    act(() => {
      result.current.createActions.setOpen(true);
    });
    expect(result.current.createForm.open).toBe(true);
  });

  it('should update indexName via createActions.setIndexName', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    act(() => {
      result.current.createActions.setIndexName('my_idx');
    });
    expect(result.current.createForm.indexName).toBe('my_idx');
  });

  it('should update selectedColumns via createActions.setColumns', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    act(() => {
      result.current.createActions.setColumns(['id', 'email']);
    });
    expect(result.current.createForm.selectedColumns).toEqual(['id', 'email']);
  });

  it('should update indexType via createActions.setIndexType', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    act(() => {
      result.current.createActions.setIndexType('HASH');
    });
    expect(result.current.createForm.indexType).toBe('HASH');
  });

  it('should update isUnique via createActions.setUnique', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    act(() => {
      result.current.createActions.setUnique(true);
    });
    expect(result.current.createForm.isUnique).toBe(true);
  });

  it('should reset createForm via createActions.reset', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    act(() => {
      result.current.createActions.setIndexName('my_idx');
      result.current.createActions.setUnique(true);
    });
    act(() => {
      result.current.createActions.reset();
    });
    expect(result.current.createForm.indexName).toBe('');
    expect(result.current.createForm.isUnique).toBe(false);
  });

  it('should update deleteIndex with setDeleteIndex', () => {
    const { result } = renderHook(() => useIndexManager(vi.fn()));
    act(() => {
      result.current.setDeleteIndex('idx_email');
    });
    expect(result.current.deleteIndex).toBe('idx_email');
  });

  it('should set error when handleCreateIndex called with empty fields', async () => {
    // fetch shouldn't be called as validation runs first
    vi.stubGlobal('fetch', vi.fn());
    const { result } = renderHook(() => useIndexManager(vi.fn()));

    await act(async () => {
      await result.current.handleCreateIndex();
    });

    expect(result.current.error).toBe(
      'Index name and at least one column are required',
    );
  });

  it('should call createIndexApi when handleCreateIndex called with valid form', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'created' }),
      }),
    );
    const onRefresh = vi.fn();
    const { result } = renderHook(() => useIndexManager(onRefresh));

    act(() => {
      result.current.createActions.setIndexName('idx_test');
      result.current.createActions.setColumns(['id']);
    });

    // Stub fetch calls needed for after create (fetchIndexes for selectedTable = '')
    await act(async () => {
      await result.current.handleCreateIndex();
    });

    // The fetch was called (for create index API)
    expect((vi.mocked(fetch) as any).mock.calls.length).toBeGreaterThan(0);
  });

  it('should not call deleteIndexApi when deleteIndex is null', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useIndexManager(vi.fn()));

    await act(async () => {
      await result.current.handleDeleteIndex();
    });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
