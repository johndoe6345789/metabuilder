'use client';

import AddIcon from '@mui/icons-material/Add';
import { Box, Button, MenuItem, Select, Typography } from '@mui/material';
import { getConstraintTypes, getFeatureById } from '@/utils/featureConfig';
import ConstraintDialog from './ConstraintDialog';
import ConstraintTable from './ConstraintTable';
import { useConstraintManager } from './hooks/useConstraintManager';

type ConstraintManagerTabProps = {
  tables: Array<{ table_name: string }>;
  onAddConstraint: (tableName: string, data: any) => Promise<void>;
  onDropConstraint: (
    tableName: string,
    constraintName: string,
  ) => Promise<void>;
};

export default function ConstraintManagerTab({
  tables, onAddConstraint, onDropConstraint,
}: ConstraintManagerTabProps) {
  const feature = getFeatureById('constraint-management');
  const constraintTypes = getConstraintTypes();
  const canAdd = feature?.ui.actions.includes('add');
  const canDelete = feature?.ui.actions.includes('delete');
  const {
    selectedTable, setSelectedTable, constraints, dialogState,
    selectedConstraint, handleConstraintOperation,
    openAddDialog, openDeleteDialog, closeDialog,
  } = useConstraintManager(onAddConstraint, onDropConstraint);

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
          displayEmpty fullWidth sx={{ maxWidth: 400 }}
        >
          <MenuItem value=""><em>Select a table</em></MenuItem>
          {tables.map(t => (
            <MenuItem key={t.table_name} value={t.table_name}>
              {t.table_name}
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
          <ConstraintTable
            constraints={constraints}
            canDelete={canDelete}
            onDeleteClick={openDeleteDialog}
          />
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
