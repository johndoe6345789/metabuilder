'use client';

import DeleteIcon from '@metabuilder/components/m3/Delete';
import KeyIcon from '@metabuilder/components/m3/LockOutlined';
import { Chip, IconButton, Tooltip } from '@metabuilder/components/m3';
import s from './index-list.module.scss';
import { usePersistedResizableColumns } from './hooks/usePersistedResizableColumns';

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

const COLS = ['Name', 'Type', 'Column', 'Expression', ''];
const INIT_WIDTHS = [240, 150, 120, 290, 56];

const TYPE_COLOR: Record<string, 'primary' | 'secondary' | 'default'> = {
  'PRIMARY KEY': 'primary',
  'UNIQUE': 'secondary',
  'FOREIGN KEY': 'secondary',
  'CHECK': 'default',
};

export default function ConstraintTable({
  constraints, canDelete, onDeleteClick,
}: ConstraintTableProps) {
  const { widths, onMouseDown } = usePersistedResizableColumns(
    'constraint-table', INIT_WIDTHS,
  );

  return (
    <div className={s.wrapper}>
      <table className={s.table}>
        <colgroup>
          {widths.map((w, i) => <col key={i} style={{ width: w }} />)}
        </colgroup>
        <thead>
          <tr>
            {COLS.map((label, i) => (
              <th key={i} className={s.th}>
                <span className={s.thLabel}>{label}</span>
                {i < COLS.length - 1 && (
                  <span className={s.handle} onMouseDown={onMouseDown(i)} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {constraints.map(c => (
            <tr key={c.constraint_name} className={s.row}>
              <td className={s.td}>
                <span className={s.nameCell}>
                  <KeyIcon />
                  {c.constraint_name}
                </span>
              </td>
              <td className={s.td}>
                <Chip
                  label={c.constraint_type}
                  size="small"
                  color={TYPE_COLOR[c.constraint_type] ?? 'default'}
                />
              </td>
              <td className={s.td}>{c.column_name || '-'}</td>
              <td className={s.td}>{c.check_clause || '-'}</td>
              <td className={s.td}>
                {canDelete
                  ? (
                    <Tooltip title="Drop Constraint">
                      <IconButton
                        size="small"
                        color="error"
                        aria-label="Drop constraint"
                        onClick={() => onDeleteClick(c)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )
                  : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
