'use client';

/**
 * QueryBuilderTab - Postgres-specific wrapper around FakeMUI QueryBuilderTab
 *
 * This component uses postgres-specific utilities (featureConfig, API calls)
 * and wraps the generic FakeMUI QueryBuilderTab component.
 */

import { useState } from 'react';
import { BASE_PATH } from '@/lib/app-config';
import {
  QueryBuilderTab as BaseQueryBuilderTab,
  type QueryBuilderParams,
  type QueryResult,
} from '@metabuilder/fakemui';
import { getQueryOperators } from '@/utils/featureConfig';

type PostgresQueryBuilderTabProps = {
  tables: Array<{ table_name: string }>;
  onExecuteQuery: (params: QueryBuilderParams) => Promise<QueryResult>;
};

export default function QueryBuilderTab({
  tables,
  onExecuteQuery,
}: PostgresQueryBuilderTabProps) {
  // Get operators from postgres-specific configuration
  const operators = getQueryOperators();

  // Fetch columns from postgres API
  const handleFetchColumns = async (tableName: string): Promise<string[]> => {
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.columns.map((col: { column_name: string }) => col.column_name);
      }
      return [];
    } catch (err) {
      console.error('Failed to fetch columns:', err);
      return [];
    }
  };

  return (
    <BaseQueryBuilderTab
      tables={tables}
      onExecuteQuery={onExecuteQuery}
      onFetchColumns={handleFetchColumns}
      operators={operators}
    />
  );
}
