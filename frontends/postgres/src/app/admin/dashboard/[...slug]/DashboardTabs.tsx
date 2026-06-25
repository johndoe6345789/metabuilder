'use client';

import ColumnManagerTab from '@/components/admin/ColumnManagerTab';
import ConstraintManagerTab from '@/components/admin/ConstraintManagerTab';
import IndexManagerTab from '@/components/admin/IndexManagerTab';
import QueryBuilderTab from '@/components/admin/QueryBuilderTab';
import SQLQueryTab from '@/components/admin/SQLQueryTab';
import TableDataView from '@/components/admin/TableDataView';
import TableManagerTab from '@/components/admin/TableManagerTab';
import TablesTab from '@/components/admin/TablesTab';
import { useTranslations } from 'next-intl';
import { useBrowseLabels } from '@/hooks';
import type { AdminNavItem } from '@/components/admin/AdminDrawerContent';

type Props = {
  navItems: AdminNavItem[];
  tabValue: number;
  tables: any[];
  selectedTable: string;
  onTableClick: (t: string) => void;
  onBack: () => void;
  onExecuteQuery: (q: string) => Promise<void>;
  onExecuteBuiltQuery: (p: any) => Promise<any>;
  onCreateTable: (n: string, c: any[]) => Promise<void>;
  onDropTable: (n: string) => Promise<void>;
  onAddColumn: (t: string, d: any) => Promise<void>;
  onModifyColumn: (t: string, d: any) => Promise<void>;
  onDropColumn: (t: string, d: any) => Promise<void>;
  onAddConstraint: (t: string, d: any) => Promise<void>;
  onDropConstraint: (t: string, c: string) => Promise<void>;
  onRefresh: () => void;
};

function TabPanel(
  { children, value, index, ...rest }:
    { children?: React.ReactNode; value: number; index: number },
) {
  return (
    <div role="tabpanel" hidden={value !== index}
      id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...rest}>
      {value === index && children}
    </div>
  );
}

export default function DashboardTabs(p: Props) {
  const browseLabels = useBrowseLabels();
  const t = useTranslations('Admin');
  return (
    <>
      {p.navItems.map((item, i) => (
        <TabPanel key={item.id} value={p.tabValue} index={i}>
          {item.id === 'tables' && (
            p.selectedTable
              ? <TableDataView tableName={p.selectedTable} onBack={p.onBack} />
              : <TablesTab tables={p.tables} selectedTable={p.selectedTable}
                  onTableClick={p.onTableClick}
                  title={browseLabels.title} labels={browseLabels} />
          )}
          {item.id === 'query' && (
            <SQLQueryTab onExecuteQuery={p.onExecuteQuery}
              title={t('sqlQuery.title')} label={t('sqlQuery.label')}
              placeholder={t('sqlQuery.placeholder')}
              executeLabel={t('sqlQuery.execute')} hint={t('sqlQuery.hint')} />
          )}
          {item.id === 'query-builder' && (
            <QueryBuilderTab tables={p.tables}
              onExecuteQuery={p.onExecuteBuiltQuery} />
          )}
          {item.id === 'table-manager' && (
            <TableManagerTab tables={p.tables}
              onCreateTable={p.onCreateTable} onDropTable={p.onDropTable}
              onTableClick={p.onTableClick} />
          )}
          {item.id === 'column-manager' && (
            <ColumnManagerTab tables={p.tables}
              onAddColumn={p.onAddColumn} onModifyColumn={p.onModifyColumn}
              onDropColumn={p.onDropColumn} />
          )}
          {item.id === 'constraints' && (
            <ConstraintManagerTab tables={p.tables}
              onAddConstraint={p.onAddConstraint}
              onDropConstraint={p.onDropConstraint} />
          )}
          {item.id === 'indexes' && (
            <IndexManagerTab tables={p.tables} onRefresh={p.onRefresh} />
          )}
        </TabPanel>
      ))}
    </>
  );
}
