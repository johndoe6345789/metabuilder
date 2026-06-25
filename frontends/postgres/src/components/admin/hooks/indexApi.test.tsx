import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));

import { createIndexApi, deleteIndexApi } from './indexApi';
import type { CreateFormState } from './useIndexManager';

describe('indexApi', () => {
  let setLoading: ReturnType<typeof vi.fn>;
  let setError: ReturnType<typeof vi.fn>;
  let setSuccess: ReturnType<typeof vi.fn>;
  let fetchIndexes: ReturnType<typeof vi.fn>;
  let onRefresh: ReturnType<typeof vi.fn>;
  let onSuccess: ReturnType<typeof vi.fn>;

  const defaultForm: CreateFormState = {
    open: true,
    indexName: 'idx_email',
    selectedColumns: ['email'],
    indexType: 'BTREE',
    isUnique: false,
  };

  const makeDataContext = () => ({
    selectedTable: 'users',
    setLoading,
    setError,
    setSuccess,
    fetchIndexes,
  });

  beforeEach(() => {
    vi.restoreAllMocks();
    setLoading = vi.fn();
    setError = vi.fn();
    setSuccess = vi.fn();
    fetchIndexes = vi.fn().mockResolvedValue(undefined);
    onRefresh = vi.fn();
    onSuccess = vi.fn();
  });

  describe('createIndexApi', () => {
    it('should POST to indexes endpoint and call success handlers', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ message: 'created' }),
        }),
      );

      await createIndexApi(
        defaultForm,
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      expect(setLoading).toHaveBeenCalledWith(true);
      expect(setLoading).toHaveBeenCalledWith(false);
      expect(setSuccess).toHaveBeenCalledWith(
        expect.stringContaining('idx_email'),
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onRefresh).toHaveBeenCalled();
      expect(fetchIndexes).toHaveBeenCalledWith('users');
    });

    it('should set error when response is not ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Index already exists' }),
        }),
      );

      await createIndexApi(
        defaultForm,
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      expect(setError).toHaveBeenCalledWith('Index already exists');
      expect(setSuccess).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should set fallback error when response has no error field', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({}),
        }),
      );

      await createIndexApi(
        defaultForm,
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      expect(setError).toHaveBeenCalledWith('Failed to create index');
    });

    it('should handle network error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network failure')),
      );

      await createIndexApi(
        defaultForm,
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      expect(setError).toHaveBeenCalledWith('Network failure');
      expect(setLoading).toHaveBeenCalledWith(false);
    });

    it('should send correct JSON body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      await createIndexApi(
        defaultForm,
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.tableName).toBe('users');
      expect(body.indexName).toBe('idx_email');
      expect(body.columns).toEqual(['email']);
      expect(body.indexType).toBe('BTREE');
      expect(body.unique).toBe(false);
    });
  });

  describe('deleteIndexApi', () => {
    it('should DELETE index and call success handlers', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({}),
        }),
      );

      await deleteIndexApi(
        'idx_email',
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      expect(setLoading).toHaveBeenCalledWith(true);
      expect(setLoading).toHaveBeenCalledWith(false);
      expect(setSuccess).toHaveBeenCalledWith(
        expect.stringContaining('idx_email'),
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onRefresh).toHaveBeenCalled();
      expect(fetchIndexes).toHaveBeenCalledWith('users');
    });

    it('should set error when delete fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Index not found' }),
        }),
      );

      await deleteIndexApi(
        'idx_email',
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      expect(setError).toHaveBeenCalledWith('Index not found');
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it('should set fallback error when no error field', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({}),
        }),
      );

      await deleteIndexApi(
        'idx_email',
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      expect(setError).toHaveBeenCalledWith('Failed to drop index');
    });

    it('should handle network error during delete', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network error')),
      );

      await deleteIndexApi(
        'idx_email',
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      expect(setError).toHaveBeenCalledWith('Network error');
      expect(setLoading).toHaveBeenCalledWith(false);
    });

    it('should send correct JSON body for delete', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      await deleteIndexApi(
        'idx_email',
        makeDataContext(),
        onRefresh,
        onSuccess,
      );

      const opts = mockFetch.mock.calls[0][1];
      expect(opts.method).toBe('DELETE');
      const body = JSON.parse(opts.body);
      expect(body.indexName).toBe('idx_email');
    });
  });
});
