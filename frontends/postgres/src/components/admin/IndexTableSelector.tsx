'use client';

import AddIcon from '@metabuilder/components/fakemui/Add';
import { Box, Button, Paper } from '@metabuilder/components/fakemui';
import TablePicker from './TablePicker';

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
    <Paper sx={{ p: 2, mt: 2, maxWidth: 560, width: '100%' }}>
      <TablePicker
        label="Select Table"
        value={selectedTable}
        onChange={onTableChange}
        options={tables}
      />
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
