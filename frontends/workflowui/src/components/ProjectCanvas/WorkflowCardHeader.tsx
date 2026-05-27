/**
 * WorkflowCardHeader - Title and action buttons for WorkflowCard
 */

import React from 'react';

interface WorkflowCardHeaderProps {
  name: string;
  workflowId: string;
  itemId: string;
  onOpen: (workflowId: string) => void;
  onDelete: (id: string) => void;
}

export default function WorkflowCardHeader({
  name,
  workflowId,
  itemId,
  onOpen,
  onDelete,
}: WorkflowCardHeaderProps) {
  return (
    <div data-no-drag>
      <div>{name || 'Untitled Workflow'}</div>
      <div>
        <button
          onClick={() => onOpen(workflowId)}
          title="Open workflow editor"
          aria-label="Open workflow"
        >
          ⟳
        </button>
        <button
          onClick={() => onDelete(itemId)}
          title="Remove from canvas"
          aria-label="Remove"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
