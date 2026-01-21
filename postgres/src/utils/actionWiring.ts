/**
 * Action Wiring Utilities
 * Create action handlers dynamically from features.json configuration
 */

import type { ApiEndpoint } from './featureConfig';
import { getApiEndpoints } from './featureConfig';

/**
 * Generic action handler factory
 * Creates a function that calls an API endpoint with the specified parameters
 */
export function createActionHandler(
  endpoint: ApiEndpoint,
  onSuccess?: (data: any) => void,
  onError?: (error: Error) => void,
) {
  return async (params?: Record<string, any>) => {
    try {
      const url = interpolatePath(endpoint.path, params || {});

      const options: RequestInit = {
        method: endpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      // Add body for POST, PUT, PATCH methods
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && params) {
        options.body = JSON.stringify(params);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      onSuccess?.(data);
      return data;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      onError?.(err);
      throw err;
    }
  };
}

/**
 * Interpolate path parameters like /api/users/:id
 */
function interpolatePath(path: string, params: Record<string, any>): string {
  return path.replace(/:([a-z_$][\w$]*)/gi, (_, paramName) => {
    const value = params[paramName];
    if (value === undefined) {
      console.warn(`Missing path parameter: ${paramName}`);
      return `:${paramName}`;
    }
    return String(value);
  });
}

/**
 * Create action handlers for a resource from features.json
 */
export function createResourceActions(
  resourceName: string,
  callbacks?: {
    onSuccess?: (action: string, data: any) => void;
    onError?: (action: string, error: Error) => void;
  },
): Record<string, (params?: Record<string, any>) => Promise<any>> {
  const endpoints = getApiEndpoints(resourceName);

  if (!endpoints) {
    console.warn(`No API endpoints found for resource: ${resourceName}`);
    return {};
  }

  const actions: Record<string, (params?: Record<string, any>) => Promise<any>> = {};

  Object.entries(endpoints).forEach(([actionName, endpoint]) => {
    actions[actionName] = createActionHandler(
      endpoint,
      data => callbacks?.onSuccess?.(actionName, data),
      error => callbacks?.onError?.(actionName, error),
    );
  });

  return actions;
}

/**
 * Batch execute multiple actions
 */
export async function batchExecuteActions(
  actions: Array<{ handler: () => Promise<any>; name: string }>,
): Promise<{ successes: any[]; errors: Array<{ name: string; error: Error }> }> {
  const results = await Promise.allSettled(
    actions.map(({ handler }) => handler()),
  );

  const successes: any[] = [];
  const errors: Array<{ name: string; error: Error }> = [];

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      errors.push({
        name: actions[index]?.name || `Action ${index}`,
        error: result.reason instanceof Error ? result.reason : new Error(String(result.reason)),
      });
    }
  });

  return { successes, errors };
}
