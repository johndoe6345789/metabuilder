'use client';

import DeleteIcon from '@metabuilder/components/m3/Delete';
import SpeedIcon from '@metabuilder/components/m3/Speed';
import { Chip, IconButton, Tooltip } from '@metabuilder/components/m3';
import s from './index-list.module.scss';
import { usePersistedResizableColumns } from './hooks/usePersistedResizableColumns';

type IndexEntry = {
  index_name: string;
  is_primary: boolean;
  is_unique: boolean;
  index_type: string;
  columns: string[];
};

type IndexListProps = {
  indexes: IndexEntry[];
  onDeleteIndex: (indexName: string) => void;
};

const COLS = ['Name', 'Type', 'Columns', 'Flags', ''];
const INIT_WIDTHS = [260, 80, 220, 160, 56];

export default function IndexList(
  { indexes, onDeleteIndex }: IndexListProps,
) {
  const { widths, onMouseDown } = usePersistedResizableColumns(
    'index-list', INIT_WIDTHS,
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
                  <span
                    className={s.handle}
                    onMouseDown={onMouseDown(i)}
                  />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {indexes.map(idx => (
            <tr key={idx.index_name} className={s.row}>
              <td className={s.td}>
                <span className={s.nameCell}>
                  <SpeedIcon />
                  {idx.index_name}
                </span>
              </td>
              <td className={s.td}>{idx.index_type.toUpperCase()}</td>
              <td className={s.td}>{idx.columns.join(', ')}</td>
              <td className={s.td}>
                <span className={s.chips}>
                  {idx.is_primary && (
                    <Chip label="PRIMARY KEY" size="small" color="primary" />
                  )}
                  {idx.is_unique && !idx.is_primary && (
                    <Chip label="UNIQUE" size="small" color="secondary" />
                  )}
                </span>
              </td>
              <td className={s.td}>
                {idx.is_primary ? (
                  <Tooltip title="Primary key indexes cannot be dropped">
                    <span>
                      <IconButton size="small" disabled>
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                ) : (
                  <Tooltip title="Drop Index">
                    <IconButton
                      size="small"
                      color="error"
                      aria-label="Drop index"
                      onClick={() => onDeleteIndex(idx.index_name)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
