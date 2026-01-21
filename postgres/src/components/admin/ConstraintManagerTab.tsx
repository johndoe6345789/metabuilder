'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { getConstraintTypes, getFeatureById } from '@/utils/featureConfig';
import ConstraintDialog from './ConstraintDialog';

type ConstraintManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onAddConstraint: (tableName: string, data: any) => Promise<void>;
  onDropConstraint: (tableName: string, constraintName: string) => Promise<void>;
};

export default function ConstraintManagerTab({
  tables,
  onAddConstraint,
  onDropConstraint,
}: ConstraintManagerTabProps) {
  const [selectedTable, setSelectedTable] = useState('');
  const [constraints, setConstraints] = useState<any[]>([]);
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    mode: 'add' | 'delete';
  }>({ open: false, mode: 'add' });
  const [selectedConstraint, setSelectedConstraint] = useState<any>(null);

  // Get feature configuration from JSON
  const feature = getFeatureById('constraint-management');
  const constraintTypes = getConstraintTypes();

  // Check if actions are enabled from config
  const canAdd = feature?.ui.actions.includes('add');
  const canDelete = feature?.ui.actions.includes('delete');

  // Fetch constraints when table is selected
  const fetchConstraints = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/constraints?tableName=${selectedTable}`,
        {
          method: 'GET',
        },
      );

      if (response.ok) {
        const data = await response.json();
        setConstraints(data.constraints || []);
      }
    } catch (error) {
      console.error('Failed to fetch constraints:', error);
    }
  }, [selectedTable]);

  useEffect(() => {
    if (selectedTable) {
      fetchConstraints();
    } else {
      setConstraints([]);
    }
  }, [selectedTable, fetchConstraints]);

  const handleConstraintOperation = async (data: any) => {
    if (dialogState.mode === 'add') {
      await onAddConstraint(selectedTable, data);
    } else if (dialogState.mode === 'delete' && selectedConstraint) {
      await onDropConstraint(selectedTable, selectedConstraint.constraint_name);
    }
    await fetchConstraints(); // Refresh constraints list
  };

  const openAddDialog = () => {
    setSelectedConstraint(null);
    setDialogState({ open: true, mode: 'add' });
  };

  const openDeleteDialog = (constraint: any) => {
    setSelectedConstraint(constraint);
    setDialogState({ open: true, mode: 'delete' });
  };

  const closeDialog = () => {
    setDialogState({ ...dialogState, open: false });
    setSelectedConstraint(null);
  };

  return (
    <>
      <Typography variant="h5" gutterBottom>
        {feature?.name || 'Constraint Manager'}
      </Typography>

      {feature?.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {feature.description}
        </Typography>
      )}

      <Box sx={{ mt: 2, mb: 2 }}>
        <Select
          value={selectedTable}
          onChange={e => setSelectedTable(e.target.value)}
          displayEmpty
          fullWidth
          sx={{ maxWidth: 400 }}
        >
          <MenuItem value="">
            <em>Select a table</em>
          </MenuItem>
          {tables.map(table => (
            <MenuItem key={table.table_name} value={table.table_name}>
              {table.table_name}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {selectedTable && (
        <>
          <Box sx={{ mt: 2, mb: 2 }}>
            {canAdd && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openAddDialog}
              >
                Add Constraint
              </Button>
            )}
          </Box>

          <Paper sx={{ mt: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Constraint Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Column</TableCell>
                    <TableCell>Expression</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {constraints.map((constraint) => (
                    <TableRow key={constraint.constraint_name}>
                      <TableCell>{constraint.constraint_name}</TableCell>
                      <TableCell>{constraint.constraint_type}</TableCell>
                      <TableCell>{constraint.column_name || '-'}</TableCell>
                      <TableCell>{constraint.check_clause || '-'}</TableCell>
                      <TableCell align="right">
                        {canDelete && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => openDeleteDialog(constraint)}
                          >
                            Delete
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {constraints.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No constraints found for this table
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      <ConstraintDialog
        open={dialogState.open}
        mode={dialogState.mode}
        constraintTypes={constraintTypes}
        selectedConstraint={selectedConstraint}
        onSubmit={handleConstraintOperation}
        onClose={closeDialog}
      />
    </>
  );
}
