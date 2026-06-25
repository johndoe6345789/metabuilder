import type { ApiEndpoint } from './featureConfig';
import { getApiEndpoints } from './featureConfig';

function interpolatePath(path: string, params: Record<string, any>) {
  return path.replace(/:([a-z_$][\w$]*)/gi, (_, name) => {
    const value = params[name];
    if (value === undefined) {
      console.warn(`Missing path parameter: ${name}`);
      return `:${name}`;
    }
    return String(value);
  });
}

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
        headers: { 'Content-Type': 'application/json' },
      };
      if (['POST', 'PUT', 'PATCH'].includes(endpoint.method) && params) {
        options.body = JSON.stringify(params);
      }
      const response = await fetch(url, options);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || `Request failed: ${response.status}`,
        );
      }
      onSuccess?.(data);
      return data;
    } catch (error) {
      const err = error instanceof Error
        ? error
        : new Error('Unknown error');
      onError?.(err);
      throw err;
    }
  };
}

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
  const actions: Record<
    string,
    (params?: Record<string, any>) => Promise<any>
  > = {};
  Object.entries(endpoints).forEach(([actionName, endpoint]) => {
    actions[actionName] = createActionHandler(
      endpoint,
      data => callbacks?.onSuccess?.(actionName, data),
      error => callbacks?.onError?.(actionName, error),
    );
  });
  return actions;
}

type BatchAction = { handler: () => Promise<any>; name: string };
type BatchError = { name: string; error: Error };
type BatchResult = { successes: any[]; errors: BatchError[] };

export async function batchExecuteActions(
  actions: BatchAction[],
): Promise<BatchResult> {
  const results = await Promise.allSettled(
    actions.map(({ handler }) => handler()),
  );
  const successes: any[] = [];
  const errors: BatchError[] = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      errors.push({
        name: actions[i]?.name || `Action ${i}`,
        error: result.reason instanceof Error
          ? result.reason
          : new Error(String(result.reason)),
      });
    }
  });
  return { successes, errors };
}
