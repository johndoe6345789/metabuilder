'use client';

import { useState } from 'react';
import { Dialog } from '../../feedback/Dialog';
import {
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogClose,
} from '../../utils';
import { Typography } from '../../data-display';
import { Button, Select, TextField } from '../../inputs';
import { Close } from '../../icons';

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

export function DropTableDialog({
  open,
  tables,
  onClose,
  onDrop,
  testId,
}: DropTableDialogProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDrop = async () => {
    if (!selectedTable || confirmation !== selectedTable) return;

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
    setConfirmation('');
    onClose();
  };

  const confirmed = confirmation === selectedTable && selectedTable !== '';

  return (
    <Dialog open={open} onClose={handleClose} testId={testId} aria-labelledby={testId ? `${testId}-title` : undefined} maxWidth="sm" fullWidth>
      <DialogHeader>
        <DialogTitle id={testId ? `${testId}-title` : undefined}>Drop Table</DialogTitle>
        <DialogClose onClick={handleClose}><Close /></DialogClose>
      </DialogHeader>
      <DialogContent>
        <Typography variant="body2" color="error" gutterBottom>
          Warning: This permanently deletes the table and all its data. This cannot be undone.
        </Typography>
        <Select
          native
          fullWidth
          value={selectedTable}
          onChange={(e) => { setSelectedTable(e.target.value as string); setConfirmation(''); }}
          displayEmpty
          sx={{ mt: 2, mb: 2 }}
        >
          <option value="">Select a table to drop</option>
          {tables.map((table) => (
            <option key={table.table_name} value={table.table_name}>
              {table.table_name}
            </option>
          ))}
        </Select>
        {selectedTable && (
          <TextField
            fullWidth
            label={`Type "${selectedTable}" to confirm`}
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            helperText={confirmed ? '' : 'Must match the table name exactly'}
            sx={{ mt: 1 }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleDrop}
          color="error"
          variant="contained"
          disabled={loading || !confirmed}
        >
          Drop Table
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DropTableDialog;
