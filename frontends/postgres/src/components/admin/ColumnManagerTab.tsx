'use client';

import { Box, Stack, Typography } from '@metabuilder/components/fakemui';
import { getDataTypes, getFeatureById } from '@/utils/featureConfig';
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
    schema, dialog, setDialog,
    columns, withRefresh,
  } = useColumnManager();

  const feature = getFeatureById('column-management');
  const dataTypes = getDataTypes();
  const canAdd = feature?.ui.actions.includes('add');
  const canModify = feature?.ui.actions.includes('modify');
  const canDelete = feature?.ui.actions.includes('delete');

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {feature?.name ?? 'Column Management'}
      </Typography>

      <Stack
        spacing={2}
        sx={{
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
        }}
      >
        <ColumnTableList
          tables={tables}
          selectedTable={selectedTable}
          onSelect={setSelectedTable}
        />

        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          {!selectedTable && (
            <Typography
              color="text.secondary"
              sx={{ mt: 1, fontSize: '0.875rem' }}
            >
              Select a table to manage its columns
            </Typography>
          )}
          {selectedTable && !schema && (
            <Typography
              color="text.secondary"
              sx={{ fontSize: '0.875rem' }}
            >
              Loading…
            </Typography>
          )}
          {selectedTable && schema && (
            <ColumnSchemaPanel
              columns={columns}
              canAdd={canAdd} canModify={canModify} canDelete={canDelete}
              onAdd={() => setDialog('add')}
              onModify={() => setDialog('modify')}
              onDrop={() => setDialog('drop')}
            />
          )}
        </Box>
      </Stack>

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
