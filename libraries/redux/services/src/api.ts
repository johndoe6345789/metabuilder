/**
 * API Client
 * Centralized HTTP client for communicating with Flask backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
  status: number;
}

/**
 * Generic API request handler with error handling and retry logic
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit & { retries?: number } = {}
): Promise<T> {
  const { retries = 3, ...init } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...init.headers
        },
        ...init
      });

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        const error = new Error(errorData.error?.message || errorData.error || 'API Error');
        (error as any).status = response.status;
        throw error;
      }

      return response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');

      // Retry logic for network errors (not for HTTP errors)
      if (attempt < retries - 1 && !(error as any).status) {
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        continue;
      }

      throw lastError;
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

export const api = {
  /**
   * Workflow endpoints
   */
  workflows: {
    list: (tenantId: string = 'default') =>
      apiRequest(`/workflows?tenantId=${tenantId}`, { method: 'GET' }),

    get: (id: string) => apiRequest(`/workflows/${id}`, { method: 'GET' }),

    create: (data: any) =>
      apiRequest('/workflows', {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    update: (id: string, data: any) =>
      apiRequest(`/workflows/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),

    delete: (id: string) =>
      apiRequest(`/workflows/${id}`, {
        method: 'DELETE'
      }),

    validate: (id: string, data: any) =>
      apiRequest(`/workflows/${id}/validate`, {
        method: 'POST',
        body: JSON.stringify(data)
      })
  },

  /**
   * Execution endpoints
   */
  executions: {
    execute: (workflowId: string, data: any) =>
      apiRequest(`/workflows/${workflowId}/execute`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),

    getHistory: (workflowId: string, limit: number = 50) =>
      apiRequest(`/workflows/${workflowId}/executions?limit=${limit}`, {
        method: 'GET'
      }),

    getById: (executionId: string) =>
      apiRequest(`/executions/${executionId}`, {
        method: 'GET'
      })
  },

  /**
   * Node registry endpoints
   */
  nodes: {
    list: (category?: string) => {
      const query = category ? `?category=${category}` : '';
      return apiRequest(`/nodes${query}`, { method: 'GET' });
    },

    get: (nodeId: string) => apiRequest(`/nodes/${nodeId}`, { method: 'GET' }),

    categories: () => apiRequest('/nodes/categories', { method: 'GET' })
  },

  /**
   * Health check
   */
  health: () => apiRequest('/health', { method: 'GET' })
};

/**
 * Error utilities
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

// Default export for backward compatibility
export default api;
