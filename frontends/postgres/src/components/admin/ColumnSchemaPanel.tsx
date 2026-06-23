'use client';

import AddIcon from '@metabuilder/components/fakemui/Add';
import DeleteIcon from '@metabuilder/components/fakemui/Delete';
import EditIcon from '@metabuilder/components/fakemui/Edit';
import {
  Box, Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@metabuilder/components/fakemui';

export type ColumnInfo = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
};

type Props = {
  columns: ColumnInfo[];
  canAdd?: boolean;
  canModify?: boolean;
  canDelete?: boolean;
  onAdd: () => void;
  onModify: () => void;
  onDrop: () => void;
};

export default function ColumnSchemaPanel({
  columns, canAdd, canModify, canDelete, onAdd, onModify, onDrop,
}: Props) {
  const hasColumns = columns.length > 0;
  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        {canAdd && (
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onAdd}>
            Add Column
          </Button>
        )}
        {canModify && (
          <Button variant="outlined" size="small" disabled={!hasColumns} startIcon={<EditIcon />} onClick={onModify}>
            Modify Column
          </Button>
        )}
        {canDelete && (
          <Button variant="outlined" size="small" color="error" disabled={!hasColumns} startIcon={<DeleteIcon />} onClick={onDrop}>
            Drop Column
          </Button>
        )}
      </Box>
      <Paper sx={{ overflow: 'auto' }}>
        <Box sx={{ px: 2, py: 1, borderBottom: '1px solid rgba(202,196,208,0.08)' }}>
          <Typography variant="caption" color="text.secondary">
            {columns.length} column{columns.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Column</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Nullable</strong></TableCell>
                <TableCell><strong>Default</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {columns.map(col => (
                <TableRow key={col.column_name}>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                    {col.column_name}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                    {col.data_type}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8125rem' }}>
                    {col.is_nullable}
                  </TableCell>
                  <TableCell sx={{ color: 'text.disabled', fontSize: '0.8125rem' }}>
                    {col.column_default ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
