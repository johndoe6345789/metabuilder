'use client';

/**
 * QueryBuilderTab - Postgres-specific wrapper around M3
 * QueryBuilderTab. Uses postgres-specific utilities and API calls.
 */

import {
  QueryBuilderTab as BaseQueryBuilderTab,
  type QueryBuilderParams,
  type QueryResult,
} from '@metabuilder/m3';
import { useTranslations } from 'next-intl';
import { getQueryOperators } from '@/utils/featureConfig';
import { useQueryBuilder } from './hooks/useQueryBuilder';

type PostgresQueryBuilderTabProps = {
  tables: Array<{ table_name: string }>;
  onExecuteQuery: (params: QueryBuilderParams) => Promise<QueryResult>;
};

export default function QueryBuilderTab({
  tables,
  onExecuteQuery,
}: PostgresQueryBuilderTabProps) {
  const t = useTranslations('Admin');
  const operators = getQueryOperators();
  const { fetchColumns } = useQueryBuilder();

  return (
    <BaseQueryBuilderTab
      tables={tables}
      onExecuteQuery={onExecuteQuery}
      onFetchColumns={fetchColumns}
      operators={operators}
      title={t('queryBuilder.title')}
      description={t('queryBuilder.description')}
      selectTableLabel={t('queryBuilder.selectTable')}
    />
  );
}
