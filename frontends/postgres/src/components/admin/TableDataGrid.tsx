'use client';

import DeleteIcon from '@metabuilder/components/m3/Delete';
import EditIcon from '@metabuilder/components/m3/Edit';
import NavigateBeforeIcon from '@metabuilder/components/m3/NavigateBefore';
import NavigateNextIcon from '@metabuilder/components/m3/NavigateNext';
import { IconButton, Tooltip, Typography } from '@metabuilder/components/m3';
import { useMemo, useState } from 'react';
import s from './table-data-view.module.scss';
import t from './index-list.module.scss';
import { fmtCell, type TdvField } from './tableDataViewUtils';
import { useResizableColumns } from './hooks/useResizableColumns';

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

const ACTIONS_WIDTH = 80;
const COL_WIDTH = 160;

export default function TableDataGrid({
  fields, rows, hasPK, onEditRow, onDeleteRow,
  page, totalPages, onFetchPage,
}: Props) {
  const initialWidths = useMemo(
    () => [...fields.map(() => COL_WIDTH), ACTIONS_WIDTH],
    [fields.length], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const allCols = useMemo(() => [...fields.map(f => f.name), ''], [fields]);
  const { widths, onMouseDown } = useResizableColumns(initialWidths);

  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (col: string) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('asc'); }
  };

  const sortedRows = useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const cmp = String(a[sortCol] ?? '').localeCompare(
        String(b[sortCol] ?? ''), undefined, { numeric: true },
      );
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortCol, sortDir]);

  return (
    <>
      <div className={t.wrapper}>
        <table className={t.table}>
          <colgroup>
            {widths.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr>
              {allCols.map((label, i) => {
                const isData = i < fields.length;
                const sorted = isData && sortCol === label;
                return (
                  <th key={i} className={t.th}
                    onClick={isData ? () => toggleSort(label) : undefined}
                    style={{ cursor: isData ? 'pointer' : 'default' }}>
                    <span className={t.thLabel}>
                      {label}
                      {sorted && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                    </span>
                    {i < allCols.length - 1 && (
                      <span className={t.handle} onMouseDown={onMouseDown(i)} />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, idx) => (
              <tr key={idx} className={t.row}>
                {fields.map(f => (
                  <td key={f.name} className={t.td}>{fmtCell(row[f.name], f)}</td>
                ))}
                <td className={t.td}>
                  {hasPK
                    ? (
                      <span style={{ display: 'flex', gap: 2 }}>
                        <Tooltip title="Edit row">
                          <IconButton size="small" onClick={() => onEditRow(row)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete row">
                          <IconButton size="small" color="error"
                            onClick={() => onDeleteRow(row)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </span>
                    )
                    : (
                      <Tooltip title="No primary key — row edits disabled">
                        <Typography component="span" variant="caption"
                          color="text.disabled">—</Typography>
                      </Tooltip>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
