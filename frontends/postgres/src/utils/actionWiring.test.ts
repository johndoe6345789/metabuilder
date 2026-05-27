import { describe, expect, it, vi, beforeEach } from 'vitest';
import {
  batchExecuteActions,
  createActionHandler,
  createResourceActions,
} from './actionWiring';
import type { ApiEndpoint } from './featureConfig';

const makeEndpoint = (
  method: ApiEndpoint['method'],
  path: string,
): ApiEndpoint => ({
  method,
  path,
  description: 'test endpoint',
});

describe('actionWiring', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('createActionHandler', () => {
    it('should call fetch with correct URL and method for GET', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ result: 'ok' }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const handler = createActionHandler(
        makeEndpoint('GET', '/api/admin/users'),
      );
      const result = await handler();

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users',
        expect.objectContaining({ method: 'GET' }),
      );
      expect(result).toEqual({ result: 'ok' });
    });

    it('should interpolate path parameters', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      const handler = createActionHandler(
        makeEndpoint('DELETE', '/api/admin/users/:id'),
      );
      await handler({ id: 42 });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users/42',
        expect.objectContaining({ method: 'DELETE' }),
      );
    });

    it('should send body for POST requests', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ created: true }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const handler = createActionHandler(
        makeEndpoint('POST', '/api/admin/users'),
      );
      await handler({ name: 'Alice', email: 'alice@example.com' });

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/admin/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            name: 'Alice',
            email: 'alice@example.com',
          }),
        }),
      );
    });

    it('should NOT send body for GET requests', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });
      vi.stubGlobal('fetch', mockFetch);

      const handler = createActionHandler(
        makeEndpoint('GET', '/api/admin/users'),
      );
      await handler({ someParam: 'value' });

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs.body).toBeUndefined();
    });

    it('should call onSuccess callback on success', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 1 }),
      });
      vi.stubGlobal('fetch', mockFetch);
      const onSuccess = vi.fn();

      const handler = createActionHandler(
        makeEndpoint('POST', '/api/admin/users'),
        onSuccess,
      );
      await handler({});

      expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    });

    it('should call onError and throw on non-ok response', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad request' }),
      });
      vi.stubGlobal('fetch', mockFetch);
      const onError = vi.fn();

      const handler = createActionHandler(
        makeEndpoint('POST', '/api/admin/users'),
        undefined,
        onError,
      );

      await expect(handler({})).rejects.toThrow('Bad request');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should throw on network error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network failure')),
      );
      const onError = vi.fn();

      const handler = createActionHandler(
        makeEndpoint('GET', '/api/admin/users'),
        undefined,
        onError,
      );

      await expect(handler()).rejects.toThrow('Network failure');
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('createResourceActions', () => {
    it('should return empty object for unknown resource', () => {
      const actions = createResourceActions('non-existent-resource');
      expect(actions).toEqual({});
    });

    it('should return action handlers for known resource', () => {
      const actions = createResourceActions('users');
      expect(typeof actions.list).toBe('function');
      expect(typeof actions.create).toBe('function');
    });

    it('should call onSuccess callback with action name', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: [] }),
      });
      vi.stubGlobal('fetch', mockFetch);

      const onSuccess = vi.fn();
      const actions = createResourceActions('users', { onSuccess });

      await actions.list?.();
      expect(onSuccess).toHaveBeenCalledWith('list', expect.any(Object));
    });

    it('should call onError callback with action name', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' }),
        }),
      );

      const onError = vi.fn();
      const actions = createResourceActions('users', { onError });

      await expect(actions.list?.()).rejects.toThrow();
      expect(onError).toHaveBeenCalledWith('list', expect.any(Error));
    });
  });

  describe('batchExecuteActions', () => {
    it('should collect successes and errors', async () => {
      const successHandler = vi.fn().mockResolvedValue('ok');
      const failHandler = vi.fn().mockRejectedValue(new Error('fail'));

      const result = await batchExecuteActions([
        { handler: successHandler, name: 'action1' },
        { handler: failHandler, name: 'action2' },
      ]);

      expect(result.successes).toEqual(['ok']);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].name).toBe('action2');
      expect(result.errors[0].error).toBeInstanceOf(Error);
    });

    it('should return all successes when none fail', async () => {
      const h1 = vi.fn().mockResolvedValue('a');
      const h2 = vi.fn().mockResolvedValue('b');

      const result = await batchExecuteActions([
        { handler: h1, name: 'a1' },
        { handler: h2, name: 'a2' },
      ]);

      expect(result.successes).toEqual(['a', 'b']);
      expect(result.errors).toHaveLength(0);
    });

    it('should return all errors when all fail', async () => {
      const h1 = vi
        .fn()
        .mockRejectedValue(new Error('err1'));
      const h2 = vi
        .fn()
        .mockRejectedValue(new Error('err2'));

      const result = await batchExecuteActions([
        { handler: h1, name: 'a1' },
        { handler: h2, name: 'a2' },
      ]);

      expect(result.successes).toHaveLength(0);
      expect(result.errors).toHaveLength(2);
    });

    it('should handle empty actions array', async () => {
      const result = await batchExecuteActions([]);
      expect(result.successes).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should wrap non-Error rejections in an Error', async () => {
      const h = vi.fn().mockRejectedValue('string error');

      const result = await batchExecuteActions([
        { handler: h, name: 'a1' },
      ]);

      expect(result.errors[0].error).toBeInstanceOf(Error);
      expect(result.errors[0].error.message).toBe('string error');
    });
  });
});
