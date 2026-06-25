/**
 * Raw API calls for index create/delete operations.
 */

import { BASE_PATH } from '@/lib/app-config';
import type { CreateFormState } from './useIndexManager';

type DataContext = {
  selectedTable: string;
  setLoading: (v: boolean) => void;
  setError: (v: string) => void;
  setSuccess: (v: string) => void;
  fetchIndexes: (t: string) => Promise<void>;
};

export async function createIndexApi(
  form: CreateFormState,
  data: DataContext,
  onRefresh: () => void,
  onSuccess: () => void,
) {
  data.setLoading(true);
  data.setError('');
  try {
    const response = await fetch(
      `${BASE_PATH}/api/admin/indexes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableName: data.selectedTable,
          indexName: form.indexName,
          columns: form.selectedColumns,
          indexType: form.indexType,
          unique: form.isUnique,
        }),
      },
    );
    const json = await response.json();
    if (response.ok) {
      data.setSuccess(`Index "${form.indexName}" created successfully`);
      onSuccess();
      await data.fetchIndexes(data.selectedTable);
      onRefresh();
    } else {
      data.setError(json.error || 'Failed to create index');
    }
  } catch (err: any) {
    data.setError(err.message || 'Failed to create index');
  } finally {
    data.setLoading(false);
  }
}

export async function deleteIndexApi(
  indexName: string,
  data: DataContext,
  onRefresh: () => void,
  onSuccess: () => void,
) {
  data.setLoading(true);
  data.setError('');
  try {
    const response = await fetch(
      `${BASE_PATH}/api/admin/indexes`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ indexName }),
      },
    );
    const json = await response.json();
    if (response.ok) {
      data.setSuccess(`Index "${indexName}" dropped successfully`);
      onSuccess();
      await data.fetchIndexes(data.selectedTable);
      onRefresh();
    } else {
      data.setError(json.error || 'Failed to drop index');
    }
  } catch (err: any) {
    data.setError(err.message || 'Failed to drop index');
  } finally {
    data.setLoading(false);
  }
}
