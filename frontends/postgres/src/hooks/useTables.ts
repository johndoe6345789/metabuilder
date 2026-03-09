/**
 * Hook for managing database tables
 */
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BASE_PATH } from '@/lib/app-config';

export function useTables() {
  const router = useRouter();
  const [tables, setTables] = useState<Array<{ table_name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/tables`);
      
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
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tables';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const createTable = useCallback(async (tableName: string, columns: any[]) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName, columns }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create table');
      }

      await fetchTables();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create table';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTables]);

  const dropTable = useCallback(async (tableName: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-manage`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to drop table');
      }

      await fetchTables();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to drop table';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchTables]);

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
