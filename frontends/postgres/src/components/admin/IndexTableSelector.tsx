'use client';

import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Paper } from '@mui/material';

type IndexTableSelectorProps = {
  tables: Array<{ table_name: string }>;
  selectedTable: string;
  loading: boolean;
  onTableChange: (tableName: string) => void;
  onCreateClick: () => void;
};

export default function IndexTableSelector({
  tables,
  selectedTable,
  loading,
  onTableChange,
  onCreateClick,
}: IndexTableSelectorProps) {
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <select
        value={selectedTable}
        onChange={e => onTableChange(e.target.value)}
        style={{ display: 'block', width: '100%', maxWidth: 400 }}
      >
        <option value="">Select a table</option>
        {tables.map(table => (
          <option key={table.table_name} value={table.table_name}>
            {table.table_name}
          </option>
        ))}
      </select>
      {selectedTable && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onCreateClick}
            disabled={loading}
          >
            Create Index
          </Button>
        </Box>
      )}
    </Paper>
  );
}
