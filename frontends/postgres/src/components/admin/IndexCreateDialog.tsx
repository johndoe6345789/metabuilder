'use client';

import {
  Dialog, DialogContent, DialogTitle,
} from '@metabuilder/components/fakemui';
import type { IndexType } from '@/utils/featureConfig';
import IndexCreateForm from './IndexCreateForm';

type IndexCreateDialogProps = {
  selectedTable: string;
  indexName: string;
  onIndexNameChange: (v: string) => void;
  selectedColumns: string[];
  onColumnsChange: (v: string[]) => void;
  indexType: string;
  onIndexTypeChange: (v: string) => void;
  isUnique: boolean;
  onUniqueChange: (v: boolean) => void;
  availableColumns: string[];
  indexTypes: IndexType[];
  loading: boolean;
  onCreate: () => void;
  onCancel: () => void;
};

export default function IndexCreateDialog({
  selectedTable,
  indexName,
  onIndexNameChange,
  selectedColumns,
  onColumnsChange,
  indexType,
  onIndexTypeChange,
  isUnique,
  onUniqueChange,
  availableColumns,
  indexTypes,
  loading,
  onCreate,
  onCancel,
}: IndexCreateDialogProps) {
  return (
    <Dialog open onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Create Index on {selectedTable}</DialogTitle>
      <DialogContent sx={{ pt: '16px !important' }}>
        <IndexCreateForm
          indexName={indexName}
          onIndexNameChange={onIndexNameChange}
          selectedColumns={selectedColumns}
          onColumnsChange={onColumnsChange}
          indexType={indexType}
          onIndexTypeChange={onIndexTypeChange}
          isUnique={isUnique}
          onUniqueChange={onUniqueChange}
          availableColumns={availableColumns}
          indexTypes={indexTypes}
          loading={loading}
          onCreate={onCreate}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
