'use client';

import { Alert, Paper, Typography } from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import { getFeatureById, getIndexTypes } from '@/utils/featureConfig';
import s from './index-manager-tab.module.scss';
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
  const t = useTranslations('Admin');
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
        {t('view.indexes.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('view.indexes.description')}
      </Typography>
      {success && (
        <Alert severity="success" className={s.alert}>{success}</Alert>
      )}
      {error && (
        <Alert severity="error" className={s.alert}>{error}</Alert>
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
        <Paper className={s.empty}>
          <Typography color="text.secondary">
            {t('view.indexes.noIndexes', { table: selectedTable })}
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
        title={t('view.indexes.dropIndex')}
        message={t('view.indexes.dropIndexConfirm', { name: deleteIndex ?? '' })}
        onConfirm={handleDeleteIndex}
        onCancel={() => setDeleteIndex(null)}
      />
    </>
  );
}
