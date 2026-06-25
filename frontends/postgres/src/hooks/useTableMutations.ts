/**
 * Hook for create/drop table mutations.
 */

import { useCallback, useState } from 'react';
import { BASE_PATH } from '@/lib/app-config';

export function useTableMutations(
  onSuccess: () => Promise<void>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTable = useCallback(
    async (tableName: string, columns: any[]) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${BASE_PATH}/api/admin/table-manage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName, columns }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to create table');
        }
        await onSuccess();
        return data;
      } catch (err) {
        const msg = err instanceof Error
          ? err.message
          : 'Failed to create table';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  const dropTable = useCallback(
    async (tableName: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${BASE_PATH}/api/admin/table-manage`,
          {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableName }),
          },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'Failed to drop table');
        }
        await onSuccess();
        return data;
      } catch (err) {
        const msg = err instanceof Error
          ? err.message
          : 'Failed to drop table';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess],
  );

  return { loading, error, createTable, dropTable };
}
