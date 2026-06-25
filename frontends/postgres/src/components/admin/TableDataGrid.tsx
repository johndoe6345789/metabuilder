'use client';

import DeleteIcon from '@metabuilder/components/fakemui/Delete';
import EditIcon from '@metabuilder/components/fakemui/Edit';
import NavigateBeforeIcon
  from '@metabuilder/components/fakemui/NavigateBefore';
import NavigateNextIcon
  from '@metabuilder/components/fakemui/NavigateNext';
import {
  IconButton, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Tooltip, Typography,
} from '@metabuilder/components/fakemui';
import s from './table-data-view.module.scss';
import { fmtCell, type TdvField } from './tableDataViewUtils';

type Props = {
  fields: TdvField[];
  rows: Record<string, any>[];
  hasPK: boolean;
  onEditRow: (row: any) => void;
  onDeleteRow: (row: any) => void;
  page: number;
  totalPages: number;
  onFetchPage: (p: number) => void;
};

export default function TableDataGrid({
  fields, rows, hasPK, onEditRow, onDeleteRow,
  page, totalPages, onFetchPage,
}: Props) {
  return (
    <>
      <Paper className={s.tableWrap}>
        <TableContainer>
          <Table size="small" className={s.tableRoot}>
            <TableHead>
              <TableRow>
                {fields.map(f => (
                  <TableCell key={f.name} className={s.noWrap}>
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
                    <TableCell key={f.name} className={s.noWrap}>
                      {fmtCell(row[f.name], f)}
                    </TableCell>
                  ))}
                  <TableCell align="right" className={s.actionsCell}>
                    {hasPK ? (
                      <>
                        <Tooltip title="Edit row">
                          <IconButton size="small"
                            onClick={() => onEditRow(row)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete row">
                          <IconButton size="small" color="error"
                            onClick={() => onDeleteRow(row)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title="No primary key — row edits disabled">
                        <Typography component="span" variant="caption"
                          color="text.disabled">—</Typography>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {totalPages > 1 && (
        <div className={s.pagination}>
          <IconButton size="small" disabled={page <= 1}
            onClick={() => onFetchPage(page - 1)}>
            <NavigateBeforeIcon />
          </IconButton>
          <Typography variant="caption">
            Page {page} of {totalPages}
          </Typography>
          <IconButton size="small" disabled={page >= totalPages}
            onClick={() => onFetchPage(page + 1)}>
            <NavigateNextIcon />
          </IconButton>
        </div>
      )}
    </>
  );
}
