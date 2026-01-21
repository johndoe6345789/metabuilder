'use client';

import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
} from '../atoms';

type DataGridProps = {
  columns: Array<{ name: string; label?: string }>;
  rows: any[];
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  primaryKey?: string;
};

export default function DataGrid({ columns, rows, onEdit, onDelete, primaryKey = 'id' }: DataGridProps) {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            {columns.map(col => (
              <TableCell key={col.name}>
                <strong>{col.label || col.name}</strong>
              </TableCell>
            ))}
            {(onEdit || onDelete) && (
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row[primaryKey] || idx}>
              {columns.map(col => (
                <TableCell key={col.name}>
                  {row[col.name] !== null && row[col.name] !== undefined
                    ? String(row[col.name])
                    : 'NULL'}
                </TableCell>
              ))}
              {(onEdit || onDelete) && (
                <TableCell>
                  {onEdit && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(row)} icon="Edit" />
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDelete(row)} icon="Delete" />
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
