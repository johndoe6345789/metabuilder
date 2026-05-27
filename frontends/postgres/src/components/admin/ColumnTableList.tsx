'use client';

import StorageIcon from '@mui/icons-material/Storage';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material';

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
    <Paper sx={{ width: 200, flexShrink: 0, overflow: 'auto', maxHeight: '75vh' }}>
      <List dense disablePadding>
        {tables.map(table => (
          <ListItem key={table.table_name} disablePadding>
            <ListItemButton
              selected={selectedTable === table.table_name}
              onClick={() => onSelect(table.table_name)}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <StorageIcon sx={{ fontSize: 16 }} />
              </ListItemIcon>
              <ListItemText
                primary={table.table_name}
                slotProps={{
                  primary: { sx: { fontSize: '0.8125rem' } },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
