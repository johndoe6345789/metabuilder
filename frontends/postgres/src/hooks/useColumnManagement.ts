/**
 * Hook for column management operations
 */
import { useState, useCallback } from 'react';
import { BASE_PATH } from '@/lib/app-config';

export function useColumnManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addColumn = useCallback(async (tableName: string, columnData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName, ...columnData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add column');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add column';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const modifyColumn = useCallback(async (tableName: string, columnData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName, ...columnData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to modify column');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to modify column';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const dropColumn = useCallback(async (tableName: string, columnData: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName, ...columnData }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to drop column');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to drop column';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    addColumn,
    modifyColumn,
    dropColumn,
  };
}
