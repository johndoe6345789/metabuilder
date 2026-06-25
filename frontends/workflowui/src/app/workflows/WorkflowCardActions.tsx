/**
 * WorkflowCardActions - Edit and Delete action buttons
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@metabuilder/m3';
import {
  EditIcon,
  DeleteIcon,
} from '@/../../../icons/react';

interface WorkflowCardActionsProps {
  workflowId: string;
  onDelete: (id: string) => void;
}

export default function WorkflowCardActions({
  workflowId,
  onDelete,
}: WorkflowCardActionsProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
      }}
    >
      <Link
        href={`/editor/${workflowId}`}
        style={{ flex: 1 }}
      >
        <Button
          variant="outlined"
          size="small"
          fullWidth
          startIcon={<EditIcon size={16} />}
        >
          Edit
        </Button>
      </Link>
      <Button
        variant="outlined"
        size="small"
        color="error"
        onClick={() => onDelete(workflowId)}
        startIcon={<DeleteIcon size={16} />}
      >
        Delete
      </Button>
    </div>
  );
}
