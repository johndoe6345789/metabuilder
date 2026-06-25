/**
 * dbApiCalls - Raw API calls for database connection management
 */

import { BASE_PATH } from '@/lib/app-config';
import { buildUrl } from './dbUrlUtils';

interface ApiResult {
  ok: boolean;
  message: string;
}

async function callDbApi(
  endpoint: string,
  adapter: string,
  formFields: Record<string, string>
): Promise<ApiResult> {
  const url = buildUrl(adapter, formFields);
  const res = await fetch(`${BASE_PATH}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adapter,
      database_url: url,
    }),
  });
  const data = await res.json();
  return {
    ok: data.success,
    message: data.message || data.error || 'Unknown result',
  };
}

export async function testConnection(
  adapter: string,
  formFields: Record<string, string>
): Promise<ApiResult> {
  return callDbApi(
    '/api/dbal/admin/test-connection',
    adapter,
    formFields
  );
}

export async function applyDbConfig(
  adapter: string,
  formFields: Record<string, string>
): Promise<ApiResult> {
  return callDbApi(
    '/api/dbal/admin/config',
    adapter,
    formFields
  );
}
