/**
 * FavoriteWorkflowActions - Edit and delete buttons for a workflow
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Button } from '@metabuilder/fakemui';
import { Edit, Delete } from '@metabuilder/fakemui';

interface FavoriteWorkflowActionsProps {
  workflowId: string;
  onDelete: (id: string) => void;
}

export default function FavoriteWorkflowActions({
  workflowId,
  onDelete,
}: FavoriteWorkflowActionsProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Link href={`/editor/${workflowId}`}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Edit />}
        >
          Edit
        </Button>
      </Link>
      <Button
        variant="outlined"
        size="small"
        color="error"
        onClick={() => onDelete(workflowId)}
        startIcon={<Delete />}
      >
        Delete
      </Button>
    </Box>
  );
}
