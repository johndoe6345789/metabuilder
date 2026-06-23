'use client';

import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@metabuilder/components/fakemui';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import DashboardShell from '@/components/admin/DashboardShell';
import ColumnManagerTab from '@/components/admin/ColumnManagerTab';
import ConstraintManagerTab from '@/components/admin/ConstraintManagerTab';
import IndexManagerTab from '@/components/admin/IndexManagerTab';
import QueryBuilderTab from '@/components/admin/QueryBuilderTab';
import SQLQueryTab from '@/components/admin/SQLQueryTab';
import TableDataView from '@/components/admin/TableDataView';
import TableManagerTab from '@/components/admin/TableManagerTab';
import TablesTab from '@/components/admin/TablesTab';
import { getNavItems } from '@/utils/featureConfig';
import { BASE_PATH } from '@/lib/app-config';
import pkg from '../../../../../package.json';

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

type Props = {
  section: string;
  table: string;
};

export default function DashboardContent({ section, table }: Props) {
  const router = useRouter();
  const [tables, setTables] = useState<any[]>([]);
  const [queryResult, setQueryResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getNavItems();
  const tabValue = Math.max(0, navItems.findIndex(item => item.id === section));
  const selectedTable = table;

  useEffect(() => {
    const active = navItems.find(item => item.id === section);
    const sectionLabel = active?.label ?? section;
    document.title = selectedTable
      ? `${selectedTable} — ${sectionLabel} | Postgres Admin`
      : `${sectionLabel} | Postgres Admin`;
  }, [section, selectedTable, navItems]);

  const navigate = useCallback((sec: string, tbl?: string) => {
    const path = tbl
      ? `/admin/dashboard/${sec}/${encodeURIComponent(tbl)}`
      : `/admin/dashboard/${sec}`;
    router.push(path, { scroll: false });
  }, [router]);

  const fetchTables = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/tables`);
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/admin/login');
          return;
        }
        throw new Error('Failed to fetch tables');
      }
      const data = await response.json();
      setTables(data.tables);
    } catch (err: any) {
      setError(err.message);
    }
  }, [router]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleTableClick = (tableName: string) => {
    navigate('tables', tableName);
  };

  const handleExecuteQuery = async (query: string) => {
    setLoading(true);
    setError('');
    setQueryResult(null);

    try {
      const response = await fetch(`${BASE_PATH}/api/admin/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Query failed');
      }

      setQueryResult(data);
      setSuccessMessage('Query executed successfully');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_PATH}/api/admin/logout`, { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleCreateTable = async (tableName: string, columns: any[]) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, columns }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create table');
      setSuccessMessage(data.message);
      await fetchTables();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDropTable = async (tableName: string) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-manage`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to drop table');
      setSuccessMessage(data.message);
      if (selectedTable === tableName) {
        setQueryResult(null);
        navigate('tables');
      }
      await fetchTables();
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAddColumn = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, ...data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add column');
      setSuccessMessage(result.message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleModifyColumn = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, ...data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to modify column');
      setSuccessMessage(result.message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDropColumn = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/column-manage`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, ...data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to drop column');
      setSuccessMessage(result.message);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAddConstraint = async (tableName: string, data: any) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/constraints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, ...data }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add constraint');
      setSuccessMessage(result.message || 'Constraint added successfully');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleDropConstraint = async (tableName: string, constraintName: string) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/constraints`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName, constraintName }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to drop constraint');
      setSuccessMessage(result.message || 'Constraint dropped successfully');
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteBuiltQuery = async (params: any) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/query-builder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Query failed');
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
        navItems={navItems}
        selectedIndex={tabValue}
        onNavigate={id => {
          setMobileOpen(false);
          navigate(id);
        }}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onMobileOpen={() => setMobileOpen(true)}
        onMobileClose={() => setMobileOpen(false)}
        version={pkg.version}
      >
        <Box>
          {navItems.map((item, index) => (
            <TabPanel key={item.id} value={tabValue} index={index}>
              {item.id === 'tables' && (
                selectedTable ? (
                  <TableDataView
                    tableName={selectedTable}
                    onBack={() => navigate('tables')}
                  />
                ) : (
                  <TablesTab
                    tables={tables}
                    selectedTable={selectedTable}
                    onTableClick={handleTableClick}
                  />
                )
              )}
              {item.id === 'query' && (
                <SQLQueryTab onExecuteQuery={handleExecuteQuery} />
              )}
              {item.id === 'query-builder' && (
                <QueryBuilderTab tables={tables} onExecuteQuery={handleExecuteBuiltQuery} />
              )}
              {item.id === 'table-manager' && (
                <TableManagerTab
                  tables={tables}
                  onCreateTable={handleCreateTable}
                  onDropTable={handleDropTable}
                  onTableClick={handleTableClick}
                />
              )}
              {item.id === 'column-manager' && (
                <ColumnManagerTab
                  tables={tables}
                  onAddColumn={handleAddColumn}
                  onModifyColumn={handleModifyColumn}
                  onDropColumn={handleDropColumn}
                />
              )}
              {item.id === 'constraints' && (
                <ConstraintManagerTab
                  tables={tables}
                  onAddConstraint={handleAddConstraint}
                  onDropConstraint={handleDropConstraint}
                />
              )}
              {item.id === 'indexes' && (
                <IndexManagerTab tables={tables} onRefresh={fetchTables} />
              )}
            </TabPanel>
          ))}

          {successMessage && (
            <Alert severity="success" sx={{ mt: 2 }} onClose={() => setSuccessMessage('')}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* SQL query results — only when not in table drill-down */}
          {queryResult && !loading && !selectedTable && (
            <Paper sx={{ mt: 2, overflow: 'auto' }}>
              <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(202,196,208,0.08)' }}>
                <Typography variant="caption" color="text.secondary">
                  {queryResult.rowCount} row{queryResult.rowCount !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {queryResult.fields?.map((field: any) => (
                        <TableCell key={field.name}><strong>{field.name}</strong></TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {queryResult.rows?.map((row: any, idx: number) => (
                      <TableRow key={idx}>
                        {queryResult.fields?.map((field: any) => (
                          <TableCell key={field.name}>
                            {row[field.name] !== null
                              ? String(row[field.name])
                              : <Typography component="span" variant="caption" color="text.disabled">NULL</Typography>}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Box>
    </DashboardShell>
  );
}
