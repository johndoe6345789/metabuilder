'use client';

import { useEffect } from 'react';
import AddIcon from '@metabuilder/components/m3/Add';
import { Alert, Button, Paper, Typography } from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import { getIndexTypes } from '@/utils/featureConfig';
import s from './index-manager-tab.module.scss';
import ConfirmDialog from './ConfirmDialog';
import IndexCreateDialog from './IndexCreateDialog';
import IndexList from './IndexList';
import ResizablePanelLayout from './ResizablePanelLayout';
import TableListPanel from './TableListPanel';
import { useIndexManager } from './hooks/useIndexManager';
import { useResizablePanel } from './hooks/useResizablePanel';

type IndexManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onRefresh: () => void;
};

export default function IndexManagerTab(
  { tables, onRefresh }: IndexManagerTabProps,
) {
  const t = useTranslations('Admin');
  const INDEX_TYPES = getIndexTypes();
  const {
    selectedTable, indexes, availableColumns, loading,
    error, success, handleTableChange,
    createForm, createActions,
    deleteIndex, setDeleteIndex,
    handleCreateIndex, handleDeleteIndex,
  } = useIndexManager(onRefresh);
  const { width: panelWidth, onMouseDown } = useResizablePanel('index');

  useEffect(() => {
    if (!selectedTable && tables.length) {
      handleTableChange(tables[0].table_name);
    }
  }, [tables]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ResizablePanelLayout
        panel={
          <TableListPanel tables={tables} selectedTable={selectedTable}
            onSelect={handleTableChange} />
        }
        panelWidth={panelWidth}
        onHandleMouseDown={onMouseDown}
      >
        <div className={s.contentHeader}>
          <Typography variant="h6" className={s.tableTitle}>
            {selectedTable || t('view.indexes.selectTable')}
          </Typography>
          {selectedTable && (
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={() => createActions.setOpen(true)} disabled={loading}>
              Create Index
            </Button>
          )}
        </div>
        {success && (
          <Alert severity="success" className={s.alert}>{success}</Alert>
        )}
        {error && (
          <Alert severity="error" className={s.alert}>{error}</Alert>
        )}
        {selectedTable && indexes.length > 0 && (
          <IndexList indexes={indexes} onDeleteIndex={setDeleteIndex} />
        )}
        {selectedTable && !indexes.length && !loading && (
          <Paper className={s.empty}>
            <Typography color="text.secondary">
              {t('view.indexes.noIndexes', { table: selectedTable })}
            </Typography>
          </Paper>
        )}
        {!selectedTable && (
          <div className={s.emptyState}>
            <Typography color="text.secondary">
              Select a table to view its indexes
            </Typography>
          </div>
        )}
      </ResizablePanelLayout>
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
        message={t('view.indexes.dropIndexConfirm', {
          name: deleteIndex ?? '',
        })}
        onConfirm={handleDeleteIndex}
        onCancel={() => setDeleteIndex(null)}
      />
    </>
  );
}
