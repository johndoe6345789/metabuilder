/**
 * useApiCall Hook
 * Generic hook for API calls with loading and error states
 *
 * Features:
 * - Built-in JSON request/response handling
 * - Automatic Content-Type headers
 * - Error extraction from response body
 * - HTTP method support (GET, POST, PUT, DELETE, PATCH)
 * - Reset functionality to clear state
 *
 * @example
 * const { data, loading, error, execute, reset } = useApiCall<User[]>()
 *
 * // GET request
 * const users = await execute('/api/users')
 *
 * // POST request with body
 * const newUser = await execute('/api/users', {
 *   method: 'POST',
 *   body: { name: 'John', email: 'john@example.com' }
 * })
 *
 * @example
 * // With custom headers
 * const { execute } = useApiCall()
 * await execute('/api/protected', {
 *   method: 'GET',
 *   headers: { Authorization: 'Bearer token' }
 * })
 *
 * @example
 * // Error handling
 * const { data, loading, error, execute } = useApiCall()
 *
 * try {
 *   await execute('/api/resource')
 * } catch (err) {
 *   // Error is also available via error state
 *   console.error('Request failed:', err.message)
 * }
 */
import { useState, useCallback } from 'react';

export type ApiCallState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export type ApiCallOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: any;
};

export type UseApiCallReturn<T> = ApiCallState<T> & {
  execute: (url: string, options?: ApiCallOptions) => Promise<T>;
  reset: () => void;
};

/**
 * Hook for making API calls with automatic state management
 * @template T - The expected response data type
 * @returns Object containing data, loading, error, execute method, and reset method
 */
export function useApiCall<T = any>(): UseApiCallReturn<T> {
  const [state, setState] = useState<ApiCallState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (url: string, options: ApiCallOptions = {}): Promise<T> => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
