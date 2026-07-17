'use client';

import { useState } from 'react';
import TableChartIcon from '@metabuilder/components/m3/TableChart';
import SearchIcon from '@metabuilder/components/m3/Search';
import {
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@metabuilder/components/m3';
import s from './column-table-list.module.scss';

type TableRow = { table_name: string };

type Props = {
  tables: TableRow[];
  selectedTable: string;
  onSelect: (tableName: string) => void;
  width?: number;
};

export default function ColumnTableList({
  tables,
  selectedTable,
  onSelect,
  width,
}: Props) {
  const [query, setQuery] = useState('');
  const filtered = query
    ? tables.filter(t =>
        t.table_name.toLowerCase().includes(query.toLowerCase()),
      )
    : tables;

  return (
    <Paper className={s.paper} style={width ? { width } : undefined}>
      <div className={s.header}>
        <Typography variant="caption" className={s.label}>
          Tables ({tables.length})
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Filter…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className={s.search}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
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
                  <span className={s.itemText}>{table.table_name}</span>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" className={s.noMatch}>
            No match
          </Typography>
        )}
      </List>
    </Paper>
  );
}
