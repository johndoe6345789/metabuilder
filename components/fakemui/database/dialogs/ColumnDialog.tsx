'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../utils';
import { Typography } from '../../data-display';
import {
  Button,
  TextField,
  Select,
  Checkbox,
  FormControlLabel,
} from '../../inputs';

export type ColumnInfo = {
  column_name: string;
};

export type ColumnDialogMode = 'add' | 'modify' | 'drop';

export type ColumnDialogProps = {
  open: boolean;
  mode: ColumnDialogMode;
  tableName: string;
  columns?: ColumnInfo[];
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  dataTypes: string[];
  testId?: string;
};

/**
 * ColumnDialog - A dialog for managing database columns.
 * Supports adding, modifying, and dropping columns.
 */
export function ColumnDialog({
  open,
  mode,
  tableName,
  columns = [],
  onClose,
  onSubmit,
  dataTypes,
  testId,
}: ColumnDialogProps) {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('VARCHAR');
  const [nullable, setNullable] = useState(true);
  const [defaultValue, setDefaultValue] = useState('');
  const [selectedColumn, setSelectedColumn] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setColumnName('');
      setColumnType('VARCHAR');
      setNullable(true);
      setDefaultValue('');
      setSelectedColumn('');
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data: Record<string, unknown> = {};

      if (mode === 'add') {
        data.columnName = columnName;
        data.dataType = columnType;
        data.nullable = nullable;
        if (defaultValue) data.defaultValue = defaultValue;
      } else if (mode === 'modify') {
        data.columnName = selectedColumn;
        data.newType = columnType;
        data.nullable = nullable;
      } else if (mode === 'drop') {
        data.columnName = selectedColumn;
      }

      await onSubmit(data);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'add':
        return `Add Column to ${tableName}`;
      case 'modify':
        return `Modify Column in ${tableName}`;
      case 'drop':
        return `Drop Column from ${tableName}`;
      default:
        return 'Column Operation';
    }
  };

  const isFormValid = () => {
    if (mode === 'add') {
      return columnName.trim() && columnType;
    }
    return selectedColumn.trim();
  };

  return (
    <Dialog open={open} onClose={onClose} data-testid={testId} aria-labelledby={testId ? `${testId}-title` : undefined}>
      <DialogTitle id={testId ? `${testId}-title` : undefined}>{getTitle()}</DialogTitle>
      <DialogContent>
        {mode === 'drop' && (
          <Typography variant="body2" color="error" gutterBottom>
            Warning: This will permanently delete the column and all its data!
          </Typography>
        )}

        {mode === 'add' ? (
          <>
            <TextField
              fullWidth
              label="Column Name"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
            />
            <Select
              fullWidth
              value={columnType}
              onChange={(e) => setColumnType(e.target.value as string)}
              sx={{ mb: 2 }}
            >
              {dataTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <FormControlLabel
              control={
                <Checkbox
                  checked={nullable}
                  onChange={(e) => setNullable(e.target.checked)}
                />
              }
              label="Nullable"
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Default Value (optional)"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
            />
          </>
        ) : (
          <>
            <Select
              fullWidth
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value as string)}
              displayEmpty
              sx={{ mt: 2, mb: 2 }}
            >
              <option value="">
                <em>Select a column</em>
              </option>
              {columns.map((col) => (
                <option key={col.column_name} value={col.column_name}>
                  {col.column_name}
                </option>
              ))}
            </Select>

            {mode === 'modify' && selectedColumn && (
              <>
                <Select
                  fullWidth
                  value={columnType}
                  onChange={(e) => setColumnType(e.target.value as string)}
                  sx={{ mb: 2 }}
                >
                  {dataTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={nullable}
                      onChange={(e) => setNullable(e.target.checked)}
                    />
                  }
                  label="Nullable"
                />
              </>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={mode === 'drop' ? 'error' : 'primary'}
          disabled={loading || !isFormValid()}
        >
          {mode === 'add'
            ? 'Add Column'
            : mode === 'modify'
              ? 'Modify Column'
              : 'Drop Column'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ColumnDialog;
