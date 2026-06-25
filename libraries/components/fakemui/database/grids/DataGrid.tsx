'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '../../data-display';
import { Paper } from '../../surfaces';
import { IconButton } from '../../inputs';
import { Edit, Delete } from '../../icons';

export type DataGridColumn = {
  name: string;
  label?: string;
};

export type DataGridProps = {
  columns: DataGridColumn[];
  rows: Record<string, unknown>[];
  onEdit?: (row: Record<string, unknown>) => void;
  onDelete?: (row: Record<string, unknown>) => void;
  primaryKey?: string;
  testId?: string;
};

/**
 * DataGrid - A generic data grid component for displaying tabular data
 * with optional edit and delete actions.
 */
export function DataGrid({
  columns,
  rows,
  onEdit,
  onDelete,
  primaryKey = 'id',
  testId,
}: DataGridProps) {
  return (
    <Paper data-testid={testId}>
      <TableContainer>
        <Table size="small" role="grid">
        <TableHead>
          <TableRow>
            {columns.map((col) => (
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
            <TableRow key={(row[primaryKey] as string | number) || idx}>
              {columns.map((col) => (
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
                      <IconButton
                        size="small"
                        onClick={() => onEdit(row)}
                        aria-label="Edit row"
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(row)}
                        aria-label="Delete row"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default DataGrid;
