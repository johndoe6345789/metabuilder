import { useCallback, useEffect, useState } from 'react';

export type TdvColumn = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
};

export type TdvSchema = {
  columns: TdvColumn[];
  primaryKeys: string[];
};

type Field = { name: string; dataTypeID: number };

export function useTableDataView(tableName: string, basePath: string) {
  const [rows, setRows] = useState<any[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [schema, setSchema] = useState<TdvSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | null>(null);
  const [editingRow, setEditingRow] = useState<any>(null);
  const [rowToDelete, setRowToDelete] = useState<any>(null);

  const limit = 50;

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${basePath}/api/admin/table-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, page: p, limit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load data');
      setRows(data.rows);
      setFields(data.fields);
      setTotalCount(data.totalCount);
      setPage(p);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [tableName, basePath, limit]);

  useEffect(() => {
    fetch(`${basePath}/api/admin/table-schema`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableName }),
    })
      .then(r => r.json())
      .then(d => { if (d.columns) setSchema(d); });
    fetchData(1);
  }, [tableName, basePath, fetchData]);

  const saveRow = async (formData: Record<string, any>) => {
    if (!schema) return;
    const pk: Record<string, any> = {};
    schema.primaryKeys.forEach(k => { pk[k] = editingRow?.[k]; });
    const body = dialogMode === 'add'
      ? { tableName, data: formData }
      : { tableName, primaryKey: pk, data: formData };
    try {
      const res = await fetch(`${basePath}/api/admin/record`, {
        method: dialogMode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Operation failed');
      setDialogMode(null);
      setEditingRow(null);
      fetchData(page);
    } catch (e: any) {
      setError(e.message);
      throw e;
    }
  };

  const confirmDelete = async () => {
    if (!schema || !rowToDelete) return;
    const pk: Record<string, any> = {};
    schema.primaryKeys.forEach(k => { pk[k] = rowToDelete[k]; });
    try {
      const res = await fetch(`${basePath}/api/admin/record`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, primaryKey: pk }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      setRowToDelete(null);
      fetchData(page);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return {
    rows, fields, totalCount, page, limit, schema, loading, error,
    dialogMode, editingRow, rowToDelete, setError, setRowToDelete,
    fetchData,
    handleAddRow: () => setDialogMode('add'),
    handleEditRow: (row: any) => { setEditingRow(row); setDialogMode('edit'); },
    handleDeleteRow: (row: any) => setRowToDelete(row),
    closeDialog: () => { setDialogMode(null); setEditingRow(null); },
    saveRow,
    confirmDelete,
  };
}
