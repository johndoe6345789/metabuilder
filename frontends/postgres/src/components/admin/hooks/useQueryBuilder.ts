'use client';

import { useCallback } from 'react';
import { BASE_PATH } from '@/lib/app-config';

export function useQueryBuilder() {
  const fetchColumns = useCallback(
    async (tableName: string): Promise<string[]> => {
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
          return data.columns.map(
            (col: { column_name: string }) => col.column_name,
          );
        }
        return [];
      } catch (err) {
        console.error('Failed to fetch columns:', err);
        return [];
      }
    },
    [],
  );

  return { fetchColumns };
}
