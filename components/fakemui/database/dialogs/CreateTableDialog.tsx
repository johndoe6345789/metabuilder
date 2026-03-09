'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../utils';
import { Box } from '../../layout';
import { Paper } from '../../surfaces';
import { Typography } from '../../data-display';
import {
  Button,
  TextField,
  Select,
  Checkbox,
  FormControlLabel,
  IconButton,
} from '../../inputs';
import { Delete } from '../../icons';

export type TableColumn = {
  name: string;
  type: string;
  length?: number;
  nullable: boolean;
  primaryKey: boolean;
};

export type CreateTableDialogProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (tableName: string, columns: TableColumn[]) => Promise<void>;
  dataTypes: string[];
  testId?: string;
};

/**
 * CreateTableDialog - A dialog for creating new database tables.
 * Allows defining table name and column specifications.
 */
export function CreateTableDialog({
  open,
  onClose,
  onCreate,
  dataTypes,
  testId,
}: CreateTableDialogProps) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<TableColumn[]>([
    { name: '', type: 'VARCHAR', length: 255, nullable: true, primaryKey: false },
  ]);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await onCreate(
        tableName,
        columns.filter((col) => col.name.trim())
      );
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTableName('');
    setColumns([
      { name: '', type: 'VARCHAR', length: 255, nullable: true, primaryKey: false },
    ]);
    onClose();
  };

  const addColumn = () => {
    setColumns([
      ...columns,
      { name: '', type: 'VARCHAR', length: 255, nullable: true, primaryKey: false },
    ]);
  };

  const updateColumn = (
    index: number,
    field: keyof TableColumn,
    value: string | number | boolean
  ) => {
    const updated = [...columns];
    updated[index] = { ...updated[index], [field]: value };
    setColumns(updated);
  };

  const removeColumn = (index: number) => {
    if (columns.length > 1) {
      setColumns(columns.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} data-testid={testId} aria-labelledby={testId ? `${testId}-title` : undefined}>
      <DialogTitle id={testId ? `${testId}-title` : undefined}>Create New Table</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Table Name"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          sx={{ mt: 2, mb: 2 }}
        />
        <Typography variant="subtitle1" gutterBottom>
          Columns:
        </Typography>
        {columns.map((col, index) => (
          <Box
            key={index}
            sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}
          >
            <TextField
              label="Column Name"
              value={col.name}
              onChange={(e) => updateColumn(index, 'name', e.target.value)}
              sx={{ mr: 1, mb: 1 }}
            />
            <Select
              value={col.type}
              onChange={(e) => updateColumn(index, 'type', e.target.value as string)}
              sx={{ mr: 1, mb: 1, minWidth: 120 }}
            >
              {dataTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            {col.type === 'VARCHAR' && (
              <TextField
                label="Length"
                type="number"
                value={col.length || 255}
                onChange={(e) => updateColumn(index, 'length', e.target.value)}
                sx={{ mr: 1, mb: 1, width: 100 }}
              />
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={col.nullable}
                  onChange={(e) =>
                    updateColumn(index, 'nullable', e.target.checked)
                  }
                />
              }
              label="Nullable"
              sx={{ mr: 1 }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={col.primaryKey}
                  onChange={(e) =>
                    updateColumn(index, 'primaryKey', e.target.checked)
                  }
                />
              }
              label="Primary Key"
              sx={{ mr: 1 }}
            />
            {columns.length > 1 && (
              <IconButton
                onClick={() => removeColumn(index)}
                color="error"
                size="small"
                aria-label="Remove column"
              >
                <Delete />
              </IconButton>
            )}
          </Box>
        ))}
        <Button variant="outlined" onClick={addColumn}>
          Add Column
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={loading || !tableName.trim()}
        >
          Create Table
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CreateTableDialog;
