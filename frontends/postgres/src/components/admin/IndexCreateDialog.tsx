'use client';

import { Box, Paper, Typography } from '@metabuilder/components/fakemui';
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
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgcolor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1299,
        }}
        onClick={onCancel}
      />
      <Paper
        sx={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          p: 3,
          zIndex: 1300,
          minWidth: 400,
          maxWidth: 600,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Create Index on {selectedTable}
        </Typography>
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
      </Paper>
    </>
  );
}
