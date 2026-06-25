/**
 * Hook for column management operations (add/modify/drop).
 */

import { useCallback, useState } from 'react';
import { BASE_PATH } from '@/lib/app-config';

async function columnRequest(
  method: string,
  body: Record<string, any>,
  onError: (msg: string) => void,
  setLoading: (v: boolean) => void,
) {
  setLoading(true);
  try {
    const response = await fetch(
      `${BASE_PATH}/api/admin/column-manage`,
      {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `Failed (${method})`);
    }
    return result;
  } catch (err) {
    const msg = err instanceof Error
      ? err.message
      : `Failed (${method})`;
    onError(msg);
    throw err;
  } finally {
    setLoading(false);
  }
}

export function useColumnManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addColumn = useCallback(
    async (tableName: string, columnData: any) => {
      setError(null);
      return columnRequest(
        'POST',
        { tableName, ...columnData },
        setError,
        setLoading,
      );
    },
    [],
  );

  const modifyColumn = useCallback(
    async (tableName: string, columnData: any) => {
      setError(null);
      return columnRequest(
        'PUT',
        { tableName, ...columnData },
        setError,
        setLoading,
      );
    },
    [],
  );

  const dropColumn = useCallback(
    async (tableName: string, columnData: any) => {
      setError(null);
      return columnRequest(
        'DELETE',
        { tableName, ...columnData },
        setError,
        setLoading,
      );
    },
    [],
  );

  return { loading, error, addColumn, modifyColumn, dropColumn };
}
