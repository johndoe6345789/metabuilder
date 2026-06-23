'use client';

import AddIcon from '@metabuilder/components/fakemui/Add';
import { Box, Button, Stack, Typography } from '@metabuilder/components/fakemui';
import { getConstraintTypes, getFeatureById } from '@/utils/featureConfig';
import ConstraintDialog from './ConstraintDialog';
import ConstraintTable from './ConstraintTable';
import { useConstraintManager } from './hooks/useConstraintManager';
import TablePicker from './TablePicker';

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
      <Stack spacing={2} sx={{ mt: 2, mb: 2, maxWidth: 560, width: '100%' }}>
        <TablePicker
          label="Select Table"
          value={selectedTable}
          onChange={setSelectedTable}
          options={tables}
        />
        {selectedTable && (
          <>
            <Box>
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
      </Stack>
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
