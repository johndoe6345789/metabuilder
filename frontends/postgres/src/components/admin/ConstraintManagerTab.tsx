'use client';

import AddIcon from '@metabuilder/components/m3/Add';
import { Button, Typography } from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import { getConstraintTypes, getFeatureById } from '@/utils/featureConfig';
import s from './constraint-manager-tab.module.scss';
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
  const t = useTranslations('Admin');
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
        {t('view.constraints.title')}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {t('view.constraints.description')}
      </Typography>
      <div className={s.stack}>
        <TablePicker
          label={t('queryBuilder.selectTable')}
          value={selectedTable}
          onChange={setSelectedTable}
          options={tables}
        />
        {selectedTable && (
          <>
            <div>
              {canAdd && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openAddDialog}
                >
                  {t('view.constraints.addConstraint')}
                </Button>
              )}
            </div>
            <ConstraintTable
              constraints={constraints}
              canDelete={canDelete}
              onDeleteClick={openDeleteDialog}
            />
          </>
        )}
      </div>
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
