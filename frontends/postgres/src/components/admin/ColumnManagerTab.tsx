'use client';

import { Typography } from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import { getDataTypes, getFeatureById } from '@/utils/featureConfig';
import s from './column-manager-tab.module.scss';
import AddColumnDialog from './AddColumnDialog';
import ColumnSchemaPanel from './ColumnSchemaPanel';
import ColumnTableList from './ColumnTableList';
import DropColumnDialog from './DropColumnDialog';
import ModifyColumnDialog from './ModifyColumnDialog';
import { useColumnManager } from './hooks/useColumnManager';

type Props = {
  tables: Array<{ table_name: string }>;
  onAddColumn: (table: string, data: any) => Promise<void>;
  onModifyColumn: (table: string, data: any) => Promise<void>;
  onDropColumn: (table: string, data: any) => Promise<void>;
};

export default function ColumnManagerTab({
  tables, onAddColumn, onModifyColumn, onDropColumn,
}: Props) {
  const {
    selectedTable, setSelectedTable,
    schema, dialog, setDialog, columns, withRefresh,
  } = useColumnManager();
  const t = useTranslations('Admin');
  const dataTypes = getDataTypes();
  const feature = getFeatureById('column-management');
  const canAdd = feature?.ui.actions.includes('add');
  const canModify = feature?.ui.actions.includes('modify');
  const canDelete = feature?.ui.actions.includes('delete');

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {t('view.columnManager.title')}
      </Typography>
      <div className={s.stack}>
        <ColumnTableList tables={tables} selectedTable={selectedTable}
          onSelect={setSelectedTable} />
        <div className={s.content}>
          {!selectedTable || !schema
            ? (
              <Typography color="text.secondary" className={s.hint}>
                {!selectedTable
                  ? t('view.columnManager.selectTable')
                  : t('view.columnManager.loading')}
              </Typography>
            )
            : (
              <ColumnSchemaPanel columns={columns}
                canAdd={canAdd} canModify={canModify} canDelete={canDelete}
                onAdd={() => setDialog('add')}
                onModify={() => setDialog('modify')}
                onDrop={() => setDialog('drop')} />
            )}
        </div>
      </div>
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
