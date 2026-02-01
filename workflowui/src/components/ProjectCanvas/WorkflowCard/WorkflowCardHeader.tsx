/**
 * WorkflowCardHeader Component
 * Displays workflow title and action buttons
 */

import React from 'react';

interface WorkflowCardHeaderProps {
  workflowName: string;
  workflowId: string;
  onOpen: (workflowId: string) => void;
  onDelete: (id: string) => void;
  itemId: string;
}

export const WorkflowCardHeader: React.FC<WorkflowCardHeaderProps> = ({
  workflowName,
  workflowId,
  onOpen,
  onDelete,
  itemId
}) => {
  return (
    <div  data-no-drag>
      <div >{workflowName || 'Untitled Workflow'}</div>
      <div >
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
};
