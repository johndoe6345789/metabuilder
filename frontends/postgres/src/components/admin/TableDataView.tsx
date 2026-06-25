'use client';

import AddIcon from '@metabuilder/components/m3/Add';
import {
  Alert, Button, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle, Typography,
} from '@metabuilder/components/m3';
import { BASE_PATH } from '@/lib/app-config';
import s from './table-data-view.module.scss';
import TableDataGrid from './TableDataGrid';
import RowFormDialog from './RowFormDialog';
import { useTableDataView } from './hooks/useTableDataView';

type Props = { tableName: string; onBack: () => void };

export default function TableDataView({ tableName, onBack }: Props) {
  const {
    rows, fields, totalCount, page, limit, schema, loading, error,
    dialogMode, editingRow, rowToDelete,
    setError, setRowToDelete, fetchData,
    handleAddRow, handleEditRow, handleDeleteRow,
    closeDialog, saveRow, confirmDelete,
  } = useTableDataView(tableName, BASE_PATH);

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const hasPK = (schema?.primaryKeys.length ?? 0) > 0;
  const countLabel = loading
    ? 'Loading…'
    : `${rows.length} of ${totalCount} row${totalCount !== 1 ? 's' : ''}`;

  return (
    <div>
      <div className={s.breadcrumb}>
        <Typography variant="body2" className={s.breadcrumbLink}
          onClick={onBack}>Tables</Typography>
        <Typography component="span" className={s.breadcrumbSep}>
          /
        </Typography>
        <Typography variant="body2" className={s.breadcrumbCurrent}>
          {tableName}
        </Typography>
      </div>
      <div className={s.toolbar}>
        <Button variant="contained" size="small" startIcon={<AddIcon />}
          onClick={handleAddRow} disabled={!schema}>Add Row</Button>
        <Typography variant="caption" color="text.secondary">
          {countLabel}
        </Typography>
      </div>
      {error && (
        <Alert severity="error" className={s.errorAlert}
          onClose={() => setError('')}>{error}</Alert>
      )}
      {loading
        ? <div className={s.loading}><CircularProgress /></div>
        : (
          <TableDataGrid
            fields={fields} rows={rows} hasPK={hasPK}
            onEditRow={handleEditRow} onDeleteRow={handleDeleteRow}
            page={page} totalPages={totalPages} onFetchPage={fetchData}
          />
        )}
      <Dialog open={!!rowToDelete} onClose={() => setRowToDelete(null)}>
        <DialogTitle>Delete this row?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRowToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {schema && (
        <RowFormDialog open={dialogMode !== null} mode={dialogMode ?? 'add'}
          schema={schema} editingRow={editingRow}
          onSubmit={saveRow} onClose={closeDialog} />
      )}
    </div>
  );
}
