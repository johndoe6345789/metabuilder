import { useEffect, useState } from 'react';
import { BASE_PATH } from '@/lib/app-config';

export type DialogMode = 'add' | 'modify' | 'drop' | null;

export function useColumnManager() {
  const [selectedTable, setSelectedTable] = useState('');
  const [schema, setSchema] = useState<any>(null);
  const [dialog, setDialog] = useState<DialogMode>(null);

  const refreshSchema = async (table: string) => {
    const r = await fetch(`${BASE_PATH}/api/admin/table-schema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName: table }),
    });
    if (r.ok) setSchema(await r.json());
  };

  useEffect(() => {
    if (!selectedTable) { setSchema(null); return; }
    refreshSchema(selectedTable);
  }, [selectedTable]);

  const withRefresh = (
    fn: (table: string, data: any) => Promise<void>,
  ) => async (data: any) => {
    await fn(selectedTable, data);
    await refreshSchema(selectedTable);
    setDialog(null);
  };

  return {
    selectedTable, setSelectedTable,
    schema,
    dialog, setDialog,
    columns: schema?.columns ?? [],
    withRefresh,
  };
}
