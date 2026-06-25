/**
 * Hook for managing database tables (fetch + mutations).
 */

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BASE_PATH } from '@/lib/app-config';
import { useTableMutations } from './useTableMutations';

export function useTables() {
  const router = useRouter();
  const [tables, setTables] = useState<
    Array<{ table_name: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_PATH}/api/admin/tables`,
      );
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      setTables(data.tables);
    } catch (err) {
      const msg = err instanceof Error
        ? err.message
        : 'Failed to fetch tables';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const { createTable, dropTable } = useTableMutations(fetchTables);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  return {
    tables,
    loading,
    error,
    fetchTables,
    createTable,
    dropTable,
  };
}
