'use client';

import AddIcon from '@metabuilder/components/fakemui/Add';
import DeleteIcon from '@metabuilder/components/fakemui/Delete';
import EditIcon from '@metabuilder/components/fakemui/Edit';
import NavigateBeforeIcon from '@metabuilder/components/fakemui/NavigateBefore';
import NavigateNextIcon from '@metabuilder/components/fakemui/NavigateNext';
import {
  Alert, Box, Button, CircularProgress,
  Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@metabuilder/components/fakemui';
import { BASE_PATH } from '@/lib/app-config';
import RowFormDialog from './RowFormDialog';
import { useTableDataView } from './hooks/useTableDataView';

const BIGINT_OID = 20;
const TS_NAME = /(?:at|_at|time|stamp|created|updated|date)$/i;

function fmtCell(value: any, f: { name: string; dataTypeID: number }) {
  if (value === null || value === undefined) {
    return (
      <Typography component="span" variant="caption" color="text.disabled">NULL</Typography>
    );
  }
  if (f.dataTypeID === BIGINT_OID && TS_NAME.test(f.name)) {
    const n = Number(value);
    if (n > 1_000_000_000 && n < 100_000_000_000_000) {
      return new Date(n < 10_000_000_000 ? n * 1000 : n).toLocaleString();
    }
  }
  return String(value);
}

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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
          onClick={onBack}
        >
          Tables
        </Typography>
        <Typography sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>/</Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{tableName}</Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={handleAddRow}
          disabled={!schema}>
          Add Row
        </Button>
        <Typography variant="caption" color="text.secondary">
          {loading ? 'Loading…' : `${rows.length} of ${totalCount} row${totalCount !== 1 ? 's' : ''}`}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError('')}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>
      ) : (
        <Paper sx={{ overflow: 'auto' }}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 'max-content' }}>
              <TableHead>
                <TableRow>
                  {fields.map(f => (
                    <TableCell key={f.name} sx={{ whiteSpace: 'nowrap' }}>
                      <strong>{f.name}</strong>
                    </TableCell>
                  ))}
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    {fields.map(f => (
                      <TableCell key={f.name} sx={{ whiteSpace: 'nowrap' }}>
                        {fmtCell(row[f.name], f)}
                      </TableCell>
                    ))}
                    <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                      {hasPK ? (
                        <>
                          <Tooltip title="Edit row">
                            <IconButton size="small" onClick={() => handleEditRow(row)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete row">
                            <IconButton size="small" color="error" onClick={() => handleDeleteRow(row)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="No primary key — row edits disabled">
                          <Typography component="span" variant="caption" color="text.disabled">—</Typography>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <IconButton size="small" disabled={page <= 1} onClick={() => fetchData(page - 1)}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="caption">Page {page} of {totalPages}</Typography>
          <IconButton size="small" disabled={page >= totalPages} onClick={() => fetchData(page + 1)}>
            <NavigateNextIcon />
          </IconButton>
        </Box>
      )}

      <Dialog open={!!rowToDelete} onClose={() => setRowToDelete(null)}>
        <DialogTitle>Delete this row?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRowToDelete(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>

      {schema && (
        <RowFormDialog
          open={dialogMode !== null}
          mode={dialogMode ?? 'add'}
          schema={schema}
          editingRow={editingRow}
          onSubmit={saveRow}
          onClose={closeDialog}
        />
      )}
    </Box>
  );
}
