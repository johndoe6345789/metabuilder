'use client';

import { useState } from 'react';
import TableChartIcon from '@metabuilder/components/m3/TableChart';
import SearchIcon from '@metabuilder/components/m3/Search';
import {
  List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Paper, TextField,
} from '@metabuilder/components/m3';
import s from './index-table-list.module.scss';

type Props = {
  tables: Array<{ table_name: string }>;
  selectedTable: string;
  onSelect: (tableName: string) => void;
};

export default function IndexTableList(
  { tables, selectedTable, onSelect }: Props,
) {
  const [filter, setFilter] = useState('');
  const filtered = tables.filter(t =>
    t.table_name.toLowerCase().includes(filter.toLowerCase()),
  );

  return (
    <Paper className={s.paper}>
      <div className={s.header}>
        <span className={s.label}>TABLES ({tables.length})</span>
        <TextField
          placeholder="Filter..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          size="small"
          className={s.search}
          slotProps={{
            input: { startAdornment: <SearchIcon /> },
          }}
        />
      </div>
      <List dense disablePadding className={s.list}>
        {filtered.map(table => (
          <ListItem key={table.table_name} disablePadding>
            <ListItemButton
              selected={selectedTable === table.table_name}
              onClick={() => onSelect(table.table_name)}
              className={s.item}
            >
              <ListItemIcon className={s.icon}>
                <TableChartIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span className={s.itemText}>
                    {table.table_name}
                  </span>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
        {!filtered.length && (
          <span className={s.noMatch}>No tables match</span>
        )}
      </List>
    </Paper>
  );
}
