'use client';

import { useEffect } from 'react';
import { Typography } from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import { getDataTypes, getFeatureById } from '@/utils/featureConfig';
import s from './column-manager-tab.module.scss';
import AddColumnDialog from './AddColumnDialog';
import ColumnSchemaPanel from './ColumnSchemaPanel';
import DropColumnDialog from './DropColumnDialog';
import ModifyColumnDialog from './ModifyColumnDialog';
import ResizablePanelLayout from './ResizablePanelLayout';
import TableListPanel from './TableListPanel';
import { useColumnManager } from './hooks/useColumnManager';
import { useResizablePanel } from './hooks/useResizablePanel';

type Props = {
  tables: Array<{ table_name: string }>;
  initialTable?: string;
  onAddColumn: (table: string, data: any) => Promise<void>;
  onModifyColumn: (table: string, data: any) => Promise<void>;
  onDropColumn: (table: string, data: any) => Promise<void>;
};

export default function ColumnManagerTab({
  tables, initialTable, onAddColumn, onModifyColumn, onDropColumn,
}: Props) {
  const {
    selectedTable, setSelectedTable,
    schema, dialog, setDialog, columns, withRefresh,
  } = useColumnManager();
  const { width: panelWidth, onMouseDown } = useResizablePanel('column');
  const t = useTranslations('Admin');

  // Honour URL-driven table (from Schema click) immediately
  useEffect(() => {
    if (initialTable) setSelectedTable(initialTable);
  }, [initialTable]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select first table when no explicit selection
  useEffect(() => {
    if (!selectedTable && !initialTable && tables.length) {
      setSelectedTable(tables[0].table_name);
    }
  }, [tables]); // eslint-disable-line react-hooks/exhaustive-deps
  const dataTypes = getDataTypes();
  const feature = getFeatureById('column-management');
  const canAdd = feature?.ui.actions.includes('add');
  const canModify = feature?.ui.actions.includes('modify');
  const canDelete = feature?.ui.actions.includes('delete');

  return (
    <>
      <div className={s.header}>
        <Typography variant="h5">
          {t('view.columnManager.title')}
        </Typography>
        <Typography className={s.description}>
          {t('view.columnManager.description')}
        </Typography>
      </div>
      <ResizablePanelLayout
        panel={
          <TableListPanel tables={tables} selectedTable={selectedTable}
            onSelect={setSelectedTable} />
        }
        panelWidth={panelWidth}
        onHandleMouseDown={onMouseDown}
      >
        {!selectedTable || !schema
          ? (
            <div className={s.hint}>
              {!selectedTable
                ? t('view.columnManager.selectTable')
                : t('view.columnManager.loading')}
            </div>
          )
          : (
            <ColumnSchemaPanel columns={columns}
              canAdd={canAdd} canModify={canModify} canDelete={canDelete}
              onAdd={() => setDialog('add')}
              onModify={() => setDialog('modify')}
              onDrop={() => setDialog('drop')} />
          )}
      </ResizablePanelLayout>
      <AddColumnDialog open={dialog === 'add'} tableName={selectedTable}
        dataTypes={dataTypes} onClose={() => setDialog(null)}
        onSubmit={withRefresh(onAddColumn)} />
      <ModifyColumnDialog open={dialog === 'modify'} tableName={selectedTable}
        columns={columns} dataTypes={dataTypes} onClose={() => setDialog(null)}
        onSubmit={withRefresh(onModifyColumn)} />
      <DropColumnDialog open={dialog === 'drop'} tableName={selectedTable}
        columns={columns} onClose={() => setDialog(null)}
        onSubmit={withRefresh(onDropColumn)} />
    </>
  );
}
