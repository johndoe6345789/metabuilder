'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { BASE_PATH } from '@/lib/app-config';
import { getNavItems } from '@/utils/featureConfig';

type SetMsg = (m: string) => void;
type ApiOpts = { method: string; body: any };

async function callApi(
  url: string, opts: ApiOpts,
  setLoading: SetMsg, setError: SetMsg, setSuccess: SetMsg,
) {
  setLoading('1'); setError(''); setSuccess('');
  try {
    const res = await fetch(url, {
      method: opts.method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opts.body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } finally {
    setLoading('');
  }
}

export function useDashboardContent(section: string, table: string) {
  const router = useRouter();
  const [tables, setTables] = useState<any[]>([]);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getNavItems();
  const tabValue = Math.max(
    0, navItems.findIndex(item => item.id === section),
  );
  const selectedTable = table;

  useEffect(() => {
    const active = navItems.find(item => item.id === section);
    const label = active?.label ?? section;
    document.title = selectedTable
      ? `${selectedTable} — ${label} | Postgres Admin`
      : `${label} | Postgres Admin`;
  }, [section, selectedTable, navItems]);

  const navigate = useCallback((sec: string, tbl?: string) => {
    const path = tbl
      ? `/admin/dashboard/${sec}/${encodeURIComponent(tbl)}`
      : `/admin/dashboard/${sec}`;
    router.push(path, { scroll: false });
  }, [router]);

  const fetchTables = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/tables`);
      if (!res.ok) {
        if (res.status === 401) { router.push('/admin/login'); return; }
        throw new Error('Failed to fetch tables');
      }
      const data = await res.json();
      setTables(data.tables);
    } catch (err: any) { setError(err.message); }
  }, [router]);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const handleTableClick = (t: string) => navigate('tables', t);

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_PATH}/api/admin/logout`, { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) { console.error('Logout error:', err); }
  };

  const handleExecuteQuery = async (query: string) => {
    setLoading(true); setError(''); setQueryResult(null);
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      setQueryResult(data);
      setSuccessMessage('Query executed successfully');
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleExecuteBuiltQuery = async (params: any) => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${BASE_PATH}/api/admin/query-builder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Query failed');
      return data;
    } catch (err: any) { setError(err.message); throw err; }
    finally { setLoading(false); }
  };

  const makeHandler =
    (url: string, method: string, body: (t: string, d: any) => any) =>
    async (tableName: string, data?: any) => {
      setLoading(true); setError(''); setSuccessMessage('');
      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body(tableName, data)),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Request failed');
        setSuccessMessage(result.message ?? 'Done');
        if (method === 'DELETE' && url.includes('table-manage')) {
          if (selectedTable === tableName) { setQueryResult(null); navigate('tables'); }
          await fetchTables();
        }
        if (method === 'POST' && url.includes('table-manage')) await fetchTables();
      } catch (err: any) { setError(err.message); throw err; }
      finally { setLoading(false); }
    };

  const tm = `${BASE_PATH}/api/admin/table-manage`;
  const cm = `${BASE_PATH}/api/admin/column-manage`;
  const co = `${BASE_PATH}/api/admin/constraints`;

  return {
    tables, queryResult, loading, error, successMessage, mobileOpen,
    navItems, tabValue, selectedTable,
    setMobileOpen, setSuccessMessage, setError, navigate, fetchTables,
    handleTableClick, handleExecuteQuery, handleExecuteBuiltQuery,
    handleLogout,
    handleCreateTable: makeHandler(tm, 'POST',
      (n, cols) => ({ tableName: n, columns: cols })),
    handleDropTable: makeHandler(tm, 'DELETE',
      n => ({ tableName: n })),
    handleAddColumn: makeHandler(cm, 'POST',
      (t, d) => ({ tableName: t, ...d })),
    handleModifyColumn: makeHandler(cm, 'PUT',
      (t, d) => ({ tableName: t, ...d })),
    handleDropColumn: makeHandler(cm, 'DELETE',
      (t, d) => ({ tableName: t, ...d })),
    handleAddConstraint: makeHandler(co, 'POST',
      (t, d) => ({ tableName: t, ...d })),
    handleDropConstraint: (t: string, c: string) =>
      makeHandler(co, 'DELETE', (tn) => ({ tableName: tn, constraintName: c }))(t),
  };
}
