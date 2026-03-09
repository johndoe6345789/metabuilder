'use client';

import { useEffect, useState } from 'react';
import { BASE_PATH } from '@/lib/app-config';
import { getComponentTree, getDataTypes, getFeatureById } from '@/utils/featureConfig';
import ComponentTreeRenderer from '@/utils/componentTreeRenderer';
import ColumnDialog from './ColumnDialog';

type ColumnManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onAddColumn: (tableName: string, data: any) => Promise<void>;
  onModifyColumn: (tableName: string, data: any) => Promise<void>;
  onDropColumn: (tableName: string, data: any) => Promise<void>;
};

export default function ColumnManagerTab({
  tables,
  onAddColumn,
  onModifyColumn,
  onDropColumn,
}: ColumnManagerTabProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [tableSchema, setTableSchema] = useState<any>(null);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: 'add' | 'modify' | 'drop';
  }>({ open: false, mode: 'add' });

  // Get feature configuration from JSON
  const feature = getFeatureById('column-management');
  const dataTypes = getDataTypes().map(dt => dt.name);

  // Check if actions are enabled from config
  const canAdd = feature?.ui.actions.includes('add');
  const canModify = feature?.ui.actions.includes('modify');
  const canDelete = feature?.ui.actions.includes('delete');

  // Fetch schema when table is selected
  useEffect(() => {
    if (selectedTable) {
      fetchTableSchema();
    } else {
      setTableSchema(null);
    }
  }, [selectedTable]);

  const fetchTableSchema = async () => {
    try {
      const response = await fetch(`${BASE_PATH}/api/admin/table-schema`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tableName: selectedTable }),
      });

      if (response.ok) {
        const data = await response.json();
        setTableSchema(data);
      }
    } catch (error) {
      console.error('Failed to fetch schema:', error);
    }
  };

  const handleColumnOperation = async (data: any) => {
    switch (dialogState.mode) {
      case 'add':
        await onAddColumn(selectedTable, data);
        break;
      case 'modify':
        await onModifyColumn(selectedTable, data);
        break;
      case 'drop':
        await onDropColumn(selectedTable, data);
        break;
    }
    await fetchTableSchema(); // Refresh schema
  };

  const openDialog = (mode: 'add' | 'modify' | 'drop') => {
    setDialogState({ open: true, mode });
  };

  const closeDialog = () => {
    setDialogState({ ...dialogState, open: false });
  };

  const handleTableChange = (event: any) => {
    setSelectedTable(event.target.value);
  };

  // Get component tree from features.json
  const tree = getComponentTree('ColumnManagerTab');

  // Prepare data for the component tree
  const data = {
    feature,
    tables,
    selectedTable,
    tableSchema,
    canAdd,
    canModify,
    canDelete,
  };

  // Define handlers for the component tree
  const handlers = {
    handleTableChange,
    openAddDialog: () => openDialog('add'),
    openModifyDialog: () => openDialog('modify'),
    openDropDialog: () => openDialog('drop'),
  };

  return (
    <>
      {tree ? (
        <ComponentTreeRenderer tree={tree} data={data} handlers={handlers} />
      ) : (
        <div>Error: Component tree not found</div>
      )}

      <ColumnDialog
        open={dialogState.open}
        mode={dialogState.mode}
        tableName={selectedTable}
        columns={tableSchema?.columns || []}
        onClose={closeDialog}
        onSubmit={handleColumnOperation}
        dataTypes={dataTypes}
      />
    </>
  );
}
