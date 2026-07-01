'use client';

import { useEffect } from 'react';
import AddIcon from '@metabuilder/components/m3/Add';
import { Button, Typography } from '@metabuilder/components/m3';
import { useTranslations } from 'next-intl';
import { getConstraintTypes, getFeatureById } from '@/utils/featureConfig';
import s from './constraint-manager-tab.module.scss';
import ConstraintDialog from './ConstraintDialog';
import ConstraintTable from './ConstraintTable';
import ResizablePanelLayout from './ResizablePanelLayout';
import TableListPanel from './TableListPanel';
import { useConstraintManager } from './hooks/useConstraintManager';
import { useResizablePanel } from './hooks/useResizablePanel';

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
  const { width: panelWidth, onMouseDown } = useResizablePanel('constraint');

  useEffect(() => {
    if (!selectedTable && tables.length) {
      setSelectedTable(tables[0].table_name);
    }
  }, [tables]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <ResizablePanelLayout
        panel={
          <TableListPanel tables={tables} selectedTable={selectedTable}
            onSelect={setSelectedTable} />
        }
        panelWidth={panelWidth}
        onHandleMouseDown={onMouseDown}
      >
        <div className={s.contentHeader}>
          <Typography variant="h6" className={s.tableTitle}>
            {selectedTable || t('view.constraints.selectTable')}
          </Typography>
          {selectedTable && canAdd && (
            <Button variant="contained" startIcon={<AddIcon />}
              onClick={openAddDialog}>
              {t('view.constraints.addConstraint')}
            </Button>
          )}
        </div>
        {selectedTable
          ? (
            <ConstraintTable
              constraints={constraints}
              canDelete={canDelete}
              onDeleteClick={openDeleteDialog}
            />
          )
          : (
            <div className={s.emptyState}>
              <Typography color="text.secondary">
                Select a table to view its constraints
              </Typography>
            </div>
          )}
      </ResizablePanelLayout>
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
