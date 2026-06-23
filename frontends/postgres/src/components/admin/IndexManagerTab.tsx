'use client';

import { Alert, Paper, Typography } from '@metabuilder/components/fakemui';
import { getFeatureById, getIndexTypes } from '@/utils/featureConfig';
import ConfirmDialog from './ConfirmDialog';
import IndexCreateDialog from './IndexCreateDialog';
import IndexList from './IndexList';
import IndexTableSelector from './IndexTableSelector';
import { useIndexManager } from './hooks/useIndexManager';

type IndexManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onRefresh: () => void;
};

export default function IndexManagerTab({
  tables,
  onRefresh,
}: IndexManagerTabProps) {
  const feature = getFeatureById('index-management');
  const INDEX_TYPES = getIndexTypes();
  const {
    selectedTable, indexes, availableColumns, loading,
    error, success, handleTableChange,
    createForm, createActions,
    deleteIndex, setDeleteIndex,
    handleCreateIndex, handleDeleteIndex,
  } = useIndexManager(onRefresh);

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {feature?.name || 'Index Management'}
      </Typography>
      {feature?.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {feature.description}
        </Typography>
      )}
      {success && (
        <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
      )}
      <IndexTableSelector
        tables={tables}
        selectedTable={selectedTable}
        loading={loading}
        onTableChange={handleTableChange}
        onCreateClick={() => createActions.setOpen(true)}
      />
      {selectedTable && indexes.length > 0 && (
        <IndexList
          tableName={selectedTable}
          indexes={indexes}
          onDeleteIndex={setDeleteIndex}
        />
      )}
      {selectedTable && !indexes.length && !loading && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography color="text.secondary">
            No indexes found for table &quot;{selectedTable}&quot;
          </Typography>
        </Paper>
      )}
      {createForm.open && (
        <IndexCreateDialog
          selectedTable={selectedTable}
          indexName={createForm.indexName}
          onIndexNameChange={createActions.setIndexName}
          selectedColumns={createForm.selectedColumns}
          onColumnsChange={createActions.setColumns}
          indexType={createForm.indexType}
          onIndexTypeChange={createActions.setIndexType}
          isUnique={createForm.isUnique}
          onUniqueChange={createActions.setUnique}
          availableColumns={availableColumns}
          indexTypes={INDEX_TYPES}
          loading={loading}
          onCreate={handleCreateIndex}
          onCancel={createActions.reset}
        />
      )}
      <ConfirmDialog
        open={!!deleteIndex}
        title="Drop Index"
        message={`Are you sure you want to drop the index "${deleteIndex}"? This action cannot be undone.`}
        onConfirm={handleDeleteIndex}
        onCancel={() => setDeleteIndex(null)}
      />
    </>
  );
}
