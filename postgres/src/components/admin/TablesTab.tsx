'use client';

import StorageIcon from '@mui/icons-material/Storage';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { getFeatureById } from '@/utils/featureConfig';

type TablesTabProps = {
  tables: Array<{ table_name: string }>;
  selectedTable: string;
  onTableClick: (tableName: string) => void;
};

export default function TablesTab({
  tables,
  selectedTable,
  onTableClick,
}: TablesTabProps) {
  // Get feature configuration from JSON
  const feature = getFeatureById('database-crud');

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {feature?.name || 'Database Tables'}
      </Typography>

      {feature?.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {feature.description}
        </Typography>
      )}

      <Paper sx={{ mt: 2, mb: 2 }}>
        <List>
          {tables.map(table => (
            <ListItem key={table.table_name} disablePadding>
              <ListItemButton
                selected={selectedTable === table.table_name}
                onClick={() => onTableClick(table.table_name)}
              >
                <ListItemIcon>
                  <StorageIcon />
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
