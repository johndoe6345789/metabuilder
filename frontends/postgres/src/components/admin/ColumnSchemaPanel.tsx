'use client';

import AddIcon from '@metabuilder/components/m3/Add';
import DeleteIcon from '@metabuilder/components/m3/Delete';
import EditIcon from '@metabuilder/components/m3/Edit';
import ViewColumnIcon from '@metabuilder/components/m3/ViewColumn';
import { Button, Typography } from '@metabuilder/components/m3';
import s from './column-schema-panel.module.scss';
import t from './index-list.module.scss';
import { usePersistedResizableColumns } from './hooks/usePersistedResizableColumns';

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

const COLS = ['Column', 'Type', 'Nullable', 'Default'];
const INIT_WIDTHS = [220, 180, 90, 260];

export default function ColumnSchemaPanel({
  columns, canAdd, canModify, canDelete, onAdd, onModify, onDrop,
}: Props) {
  const hasColumns = columns.length > 0;
  const { widths, onMouseDown } = usePersistedResizableColumns(
    'column-schema', INIT_WIDTHS,
  );

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
      <div className={s.header}>
        <Typography variant="caption" color="text.secondary">
          {columns.length} column{columns.length !== 1 ? 's' : ''}
        </Typography>
      </div>
      <div className={t.wrapper}>
        <table className={t.table}>
          <colgroup>
            {widths.map((w, i) => <col key={i} style={{ width: w }} />)}
          </colgroup>
          <thead>
            <tr>
              {COLS.map((label, i) => (
                <th key={i} className={t.th}>
                  <span className={t.thLabel}>{label}</span>
                  {i < COLS.length - 1 && (
                    <span className={t.handle} onMouseDown={onMouseDown(i)} />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {columns.map(col => (
              <tr key={col.column_name} className={t.row}>
                <td className={t.td}>
                  <span className={t.nameCell}>
                    <ViewColumnIcon />
                    {col.column_name}
                  </span>
                </td>
                <td className={`${t.td} ${s.typeCell}`}>{col.data_type}</td>
                <td className={t.td}>{col.is_nullable}</td>
                <td className={`${t.td} ${s.dimCell}`}>
                  {col.column_default ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
