'use client';

import AddIcon from '@mui/icons-material/Add';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
} from '@mui/material';

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
      <FormControl fullWidth>
        <InputLabel>Select Table</InputLabel>
        <Select
          value={selectedTable}
          label="Select Table"
          onChange={e => onTableChange(e.target.value)}
        >
          {tables.map(table => (
            <MenuItem
              key={table.table_name}
              value={table.table_name}
            >
              {table.table_name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
