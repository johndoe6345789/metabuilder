'use client';

import { Box } from '../../layout';
import { Paper } from '../../surfaces';
import {
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '../../data-display';
import { Storage } from '../../icons';

export type TableInfo = {
  table_name: string;
};

export type TablesTabProps = {
  tables: TableInfo[];
  selectedTable: string;
  onTableClick: (tableName: string) => void;
  title?: string;
  description?: string;
  testId?: string;
};

/**
 * TablesTab - A component for displaying and selecting database tables.
 * Shows a list of available tables with selection support.
 */
export function TablesTab({
  tables,
  selectedTable,
  onTableClick,
  title = 'Database Tables',
  description,
  testId,
}: TablesTabProps) {
  return (
    <Box data-testid={testId}>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {description}
        </Typography>
      )}

      <Paper sx={{ mt: 2, mb: 2 }}>
        <List>
          {tables.map((table) => (
            <ListItem key={table.table_name} disablePadding>
              <ListItemButton
                selected={selectedTable === table.table_name}
                onClick={() => onTableClick(table.table_name)}
              >
                <ListItemIcon>
                  <Storage />
                </ListItemIcon>
                <ListItemText primary={table.table_name} />
              </ListItemButton>
            </ListItem>
          ))}
          {tables.length === 0 && (
            <ListItem>
              <ListItemText primary="No tables found" />
            </ListItem>
          )}
        </List>
      </Paper>

      {selectedTable && (
        <Typography variant="h6" gutterBottom>
          Table: {selectedTable}
        </Typography>
      )}
    </Box>
  );
}

export default TablesTab;
