'use client';

import AddIcon from '@metabuilder/components/fakemui/Add';
import DeleteIcon from '@metabuilder/components/fakemui/Delete';
import EditIcon from '@metabuilder/components/fakemui/Edit';
import {
  Button, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@metabuilder/components/fakemui';
import s from './column-schema-panel.module.scss';

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
      <div className={s.actions}>
        {canAdd && (
          <Button variant="contained" size="small" startIcon={<AddIcon />}
            onClick={onAdd}>Add Column</Button>
        )}
        {canModify && (
          <Button variant="outlined" size="small" disabled={!hasColumns}
            startIcon={<EditIcon />} onClick={onModify}>Modify Column</Button>
        )}
        {canDelete && (
          <Button variant="outlined" size="small" color="error"
            disabled={!hasColumns} startIcon={<DeleteIcon />}
            onClick={onDrop}>Drop Column</Button>
        )}
      </div>
      <Paper className={s.paper}>
        <div className={s.header}>
          <Typography variant="caption" color="text.secondary">
            {columns.length} column{columns.length !== 1 ? 's' : ''}
          </Typography>
        </div>
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
                  <TableCell className={s.monoCell}>
                    {col.column_name}
                  </TableCell>
                  <TableCell className={s.typeCell}>
                    {col.data_type}
                  </TableCell>
                  <TableCell>{col.is_nullable}</TableCell>
                  <TableCell className={s.dimCell}>
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
