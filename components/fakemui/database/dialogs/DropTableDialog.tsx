'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../utils';
import { Typography } from '../../data-display';
import { Button, Select } from '../../inputs';

export type TableInfo = {
  table_name: string;
};

export type DropTableDialogProps = {
  open: boolean;
  tables: TableInfo[];
  onClose: () => void;
  onDrop: (tableName: string) => Promise<void>;
  testId?: string;
};

/**
 * DropTableDialog - A dialog for dropping/deleting database tables.
 * Displays a warning and requires table selection.
 */
export function DropTableDialog({
  open,
  tables,
  onClose,
  onDrop,
  testId,
}: DropTableDialogProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDrop = async () => {
    if (!selectedTable) return;

    setLoading(true);
    try {
      await onDrop(selectedTable);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTable('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} data-testid={testId} role="alertdialog" aria-labelledby={testId ? `${testId}-title` : undefined}>
      <DialogTitle id={testId ? `${testId}-title` : undefined}>Drop Table</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="error" gutterBottom>
          Warning: This will permanently delete the table and all its data!
        </Typography>
        <Select
          fullWidth
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value as string)}
          displayEmpty
          sx={{ mt: 2 }}
        >
          <option value="">
            <em>Select a table to drop</em>
          </option>
          {tables.map((table) => (
            <option key={table.table_name} value={table.table_name}>
              {table.table_name}
            </option>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDrop}
          color="error"
          variant="contained"
          disabled={loading || !selectedTable}
        >
          Drop Table
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DropTableDialog;
