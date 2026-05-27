'use client';

import { useState } from 'react';
import { useIndexData } from './useIndexData';
import { createIndexApi, deleteIndexApi } from './indexApi';

export type CreateFormState = {
  open: boolean;
  indexName: string;
  selectedColumns: string[];
  indexType: string;
  isUnique: boolean;
};

const DEFAULT_FORM: CreateFormState = {
  open: false, indexName: '', selectedColumns: [],
  indexType: 'BTREE', isUnique: false,
};

function makeCreateActions(
  setForm: React.Dispatch<React.SetStateAction<CreateFormState>>,
) {
  return {
    setOpen: (open: boolean) => setForm(p => ({ ...p, open })),
    setIndexName: (indexName: string) =>
      setForm(p => ({ ...p, indexName })),
    setColumns: (selectedColumns: string[]) =>
      setForm(p => ({ ...p, selectedColumns })),
    setIndexType: (indexType: string) =>
      setForm(p => ({ ...p, indexType })),
    setUnique: (isUnique: boolean) =>
      setForm(p => ({ ...p, isUnique })),
    reset: () => setForm({ ...DEFAULT_FORM }),
  };
}

export function useIndexManager(onRefresh: () => void) {
  const data = useIndexData();
  const [createForm, setCreateForm] = useState<CreateFormState>(
    { ...DEFAULT_FORM },
  );
  const [deleteIndex, setDeleteIndex] = useState<string | null>(null);
  const createActions = makeCreateActions(setCreateForm);

  const handleCreateIndex = async () => {
    if (!createForm.indexName || !createForm.selectedColumns.length) {
      data.setError('Index name and at least one column are required');
      return;
    }
    await createIndexApi(
      createForm, data, onRefresh, createActions.reset,
    );
  };

  const handleDeleteIndex = async () => {
    if (!deleteIndex) return;
    await deleteIndexApi(
      deleteIndex, data, onRefresh, () => setDeleteIndex(null),
    );
  };

  return {
    ...data, createForm, createActions,
    deleteIndex, setDeleteIndex,
    handleCreateIndex, handleDeleteIndex,
  };
}
