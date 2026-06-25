'use client';

import {
  Alert, CircularProgress,
} from '@metabuilder/components/fakemui';
import DashboardShell from '@/components/admin/DashboardShell';
import styles from './dashboard-content.module.scss';
import pkg from '../../../../../package.json';
import DashboardTabs from './DashboardTabs';
import QueryResultsPanel from './QueryResultsPanel';
import { useDashboardContent } from './hooks/useDashboardContent';

type Props = { section: string; table: string };

export default function DashboardContent({ section, table }: Props) {
  const {
    tables, queryResult, loading, error, successMessage, mobileOpen,
    navItems, tabValue, selectedTable,
    setMobileOpen, setSuccessMessage, setError,
    navigate, fetchTables, handleTableClick, handleLogout,
    handleExecuteQuery, handleExecuteBuiltQuery,
    handleCreateTable, handleDropTable,
    handleAddColumn, handleModifyColumn, handleDropColumn,
    handleAddConstraint, handleDropConstraint,
  } = useDashboardContent(section, table);

  return (
    <DashboardShell
      navItems={navItems} selectedIndex={tabValue}
      onNavigate={id => { setMobileOpen(false); navigate(id); }}
      onLogout={handleLogout} mobileOpen={mobileOpen}
      onMobileOpen={() => setMobileOpen(true)}
      onMobileClose={() => setMobileOpen(false)}
      version={pkg.version}
    >
      <div className={styles.page}>
        <DashboardTabs
          navItems={navItems} tabValue={tabValue}
          tables={tables} selectedTable={selectedTable}
          onTableClick={handleTableClick} onBack={() => navigate('tables')}
          onExecuteQuery={handleExecuteQuery}
          onExecuteBuiltQuery={handleExecuteBuiltQuery}
          onCreateTable={handleCreateTable} onDropTable={handleDropTable}
          onAddColumn={handleAddColumn} onModifyColumn={handleModifyColumn}
          onDropColumn={handleDropColumn}
          onAddConstraint={handleAddConstraint}
          onDropConstraint={handleDropConstraint}
          onRefresh={fetchTables}
        />
        {successMessage && (
          <Alert severity="success" className={styles.alert}
            onClose={() => setSuccessMessage('')}>{successMessage}</Alert>
        )}
        {error && (
          <Alert severity="error" className={styles.alert}
            onClose={() => setError('')}>{error}</Alert>
        )}
        {loading && (
          <div className={styles.loading}><CircularProgress /></div>
        )}
        {queryResult && !loading && section === 'query' && !selectedTable
          && <QueryResultsPanel queryResult={queryResult} />}
      </div>
    </DashboardShell>
  );
}
