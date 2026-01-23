/**
 * WorkflowCardHeader Component
 * Displays workflow title and action buttons
 */

import React from 'react';
import styles from '../WorkflowCard.module.scss';

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
    <div className={styles.header} data-no-drag>
      <div className={styles.title}>{workflowName || 'Untitled Workflow'}</div>
      <div className={styles.actions}>
        <button
          className={styles.actionButton}
          onClick={() => onOpen(workflowId)}
          title="Open workflow editor"
          aria-label="Open workflow"
        >
          ⟳
        </button>
        <button
          className={styles.actionButton}
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
