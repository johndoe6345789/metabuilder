/**
 * Hook for fetching and managing table data
 */
import { useState, useCallback, useEffect } from 'react';
import { useApiCall } from '@metabuilder/hooks';

export function useTableData(tableName?: string) {
  const { loading, error, execute } = useApiCall();
  const [queryResult, setQueryResult] = useState<any>(null);

  const fetchTableData = useCallback(async (table: string) => {
    try {
      const result = await execute('/api/admin/table-data', {
        method: 'POST',
        body: { tableName: table },
      });
      setQueryResult(result);
      return result;
    } catch (err) {
      console.error('Failed to fetch table data:', err);
      throw err;
    }
  }, [execute]);

  useEffect(() => {
    if (tableName) {
      fetchTableData(tableName);
    }
  }, [tableName, fetchTableData]);

  return {
    data: queryResult,
    loading,
    error,
    refresh: () => tableName && fetchTableData(tableName),
    fetchTableData,
  };
}
