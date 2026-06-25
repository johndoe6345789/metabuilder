'use client';

import StorageIcon from '@metabuilder/components/fakemui/Storage';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@metabuilder/components/fakemui';
import s from './column-table-list.module.scss';

type TableRow = { table_name: string };

type Props = {
  tables: TableRow[];
  selectedTable: string;
  onSelect: (tableName: string) => void;
};

export default function ColumnTableList({
  tables,
  selectedTable,
  onSelect,
}: Props) {
  return (
    <Paper className={s.paper}>
      <List dense disablePadding>
        {tables.map(table => (
          <ListItem key={table.table_name} disablePadding>
            <ListItemButton
              selected={selectedTable === table.table_name}
              onClick={() => onSelect(table.table_name)}
            >
              <ListItemIcon className={s.icon}>
                <StorageIcon className={s.iconSmall} />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span className={s.itemText}>{table.table_name}</span>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
