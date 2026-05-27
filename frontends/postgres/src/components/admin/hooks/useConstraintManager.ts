'use client';

import { useCallback, useEffect, useState } from 'react';

type DialogState = { open: boolean; mode: 'add' | 'delete' };

export function useConstraintManager(
  onAddConstraint: (tableName: string, data: any) => Promise<void>,
  onDropConstraint: (
    tableName: string,
    constraintName: string,
  ) => Promise<void>,
) {
  const [selectedTable, setSelectedTable] = useState('');
  const [constraints, setConstraints] = useState<any[]>([]);
  const [dialogState, setDialogState] = useState<DialogState>({
    open: false,
    mode: 'add',
  });
  const [selectedConstraint, setSelectedConstraint]
    = useState<any>(null);

  const fetchConstraints = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/admin/constraints?tableName=${selectedTable}`,
        { method: 'GET' },
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
    } else if (
      dialogState.mode === 'delete'
      && selectedConstraint
    ) {
      await onDropConstraint(
        selectedTable,
        selectedConstraint.constraint_name,
      );
    }
    await fetchConstraints();
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
    setDialogState(prev => ({ ...prev, open: false }));
    setSelectedConstraint(null);
  };

  return {
    selectedTable,
    setSelectedTable,
    constraints,
    dialogState,
    selectedConstraint,
    handleConstraintOperation,
    openAddDialog,
    openDeleteDialog,
    closeDialog,
  };
}
