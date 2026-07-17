'use client';

import { useState } from 'react';
import { BASE_PATH } from '@/lib/app-config';

/**
 * Handles fetching indexes and columns for a selected table.
 */
export function useIndexData() {
  const [selectedTable, setSelectedTable] = useState('');
  const [indexes, setIndexes] = useState<any[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchIndexes = async (tableName: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `${BASE_PATH}/api/admin/indexes?tableName=${encodeURIComponent(tableName)}`,
      );
      const data = await response.json();
      if (response.ok) {
        setIndexes(data.indexes || []);
      } else {
        setError(data.error || 'Failed to fetch indexes');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch indexes');
    } finally {
      setLoading(false);
    }
  };

  const fetchColumns = async (tableName: string) => {
    try {
      const response = await fetch(
        `${BASE_PATH}/api/admin/table-schema`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableName }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableColumns(
          data.columns.map((col: any) => col.column_name),
        );
      }
    } catch (err) {
      console.error('Failed to fetch columns:', err);
    }
  };

  const handleTableChange = async (tableName: string) => {
    setSelectedTable(tableName);
    setIndexes([]);
    setError('');
    setSuccess('');
    if (tableName) {
      await Promise.all([
        fetchIndexes(tableName),
        fetchColumns(tableName),
      ]);
    }
  };

  return {
    selectedTable,
    indexes,
    availableColumns,
    loading,
    setLoading,
    error,
    setError,
    success,
    setSuccess,
    fetchIndexes,
    handleTableChange,
  };
}
