'use client';

import DeleteIcon from '@metabuilder/components/fakemui/Delete';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@metabuilder/components/fakemui';
import s from './constraint-table.module.scss';

type Constraint = {
  constraint_name: string;
  constraint_type: string;
  column_name?: string;
  check_clause?: string;
};

type ConstraintTableProps = {
  constraints: Constraint[];
  canDelete?: boolean;
  onDeleteClick: (constraint: Constraint) => void;
};

export default function ConstraintTable({
  constraints,
  canDelete,
  onDeleteClick,
}: ConstraintTableProps) {
  return (
    <Paper className={s.paper}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Constraint Name</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Column</strong></TableCell>
              <TableCell><strong>Expression</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {constraints.map(constraint => (
              <TableRow key={constraint.constraint_name}>
                <TableCell>{constraint.constraint_name}</TableCell>
                <TableCell>{constraint.constraint_type}</TableCell>
                <TableCell>{constraint.column_name || '-'}</TableCell>
                <TableCell>{constraint.check_clause || '-'}</TableCell>
                <TableCell align="right">
                  {canDelete && (
                    <Button
                      size="small"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => onDeleteClick(constraint)}
                    >
                      Delete
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {constraints.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No constraints found for this table
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
