'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

type ConstraintDialogProps = {
  open: boolean;
  mode: 'add' | 'delete';
  constraintTypes: Array<{
    name: string;
    description: string;
    requiresColumn: boolean;
    requiresExpression: boolean;
  }>;
  selectedConstraint?: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
};

export default function ConstraintDialog({
  open,
  mode,
  constraintTypes,
  selectedConstraint,
  onClose,
  onSubmit,
}: ConstraintDialogProps) {
  const [constraintName, setConstraintName] = useState('');
  const [constraintType, setConstraintType] = useState('UNIQUE');
  const [columnName, setColumnName] = useState('');
  const [checkExpression, setCheckExpression] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setConstraintName('');
      setConstraintType('UNIQUE');
      setColumnName('');
      setCheckExpression('');
    }
  }, [open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (mode === 'add') {
        const data: any = {
          constraintName,
          constraintType,
        };

        // Get the current constraint type config
        const currentType = constraintTypes.find(ct => ct.name === constraintType);

        if (currentType?.requiresColumn) {
          data.columnName = columnName;
        }

        if (currentType?.requiresExpression) {
          data.checkExpression = checkExpression;
        }

        await onSubmit(data);
      } else if (mode === 'delete') {
        // For delete, we just need to confirm
        await onSubmit({});
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (mode === 'add') {
      return 'Add Constraint';
    }
    return `Delete Constraint: ${selectedConstraint?.constraint_name}`;
  };

  const isFormValid = () => {
    if (mode === 'delete') {
      return true; // Always valid for delete
    }

    if (!constraintName.trim() || !constraintType) {
      return false;
    }

    const currentType = constraintTypes.find(ct => ct.name === constraintType);

    if (currentType?.requiresColumn && !columnName.trim()) {
      return false;
    }

    if (currentType?.requiresExpression && !checkExpression.trim()) {
      return false;
    }

    return true;
  };

  const currentType = constraintTypes.find(ct => ct.name === constraintType);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{getTitle()}</DialogTitle>
      <DialogContent>
        {mode === 'delete' ? (
          <Typography variant="body2" color="error" gutterBottom>
            Are you sure you want to delete the constraint "
            {selectedConstraint?.constraint_name}"? This action cannot be undone.
          </Typography>
        ) : (
          <>
            <TextField
              fullWidth
              label="Constraint Name"
              value={constraintName}
              onChange={e => setConstraintName(e.target.value)}
              sx={{ mt: 2, mb: 2 }}
              helperText="A unique name for this constraint"
            />

            <Select
              fullWidth
              value={constraintType}
              onChange={e => setConstraintType(e.target.value)}
              sx={{ mb: 2 }}
            >
              {constraintTypes.map((type) => (
                <MenuItem key={type.name} value={type.name}>
                  {type.name} - {type.description}
                </MenuItem>
              ))}
            </Select>

            {currentType?.requiresColumn && (
              <TextField
                fullWidth
                label="Column Name"
                value={columnName}
                onChange={e => setColumnName(e.target.value)}
                sx={{ mb: 2 }}
                helperText="The column to apply this constraint to"
              />
            )}

            {currentType?.requiresExpression && (
              <TextField
                fullWidth
                label="Check Expression"
                value={checkExpression}
                onChange={e => setCheckExpression(e.target.value)}
                sx={{ mb: 2 }}
                multiline
                rows={3}
                helperText="Boolean expression for the check constraint (e.g., price > 0)"
              />
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={mode === 'delete' ? 'error' : 'primary'}
          disabled={loading || !isFormValid()}
        >
          {mode === 'add' ? 'Add Constraint' : 'Delete Constraint'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
