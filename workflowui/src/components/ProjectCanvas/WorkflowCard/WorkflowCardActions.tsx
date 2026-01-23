/**
 * WorkflowCardActions Component
 * Renders resize handles for the workflow card
 */

import React from 'react';
import styles from '../WorkflowCard.module.scss';

const RESIZE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;

interface WorkflowCardActionsProps {
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
}

export const WorkflowCardActions: React.FC<WorkflowCardActionsProps> = ({
  onResizeStart
}) => {
  return (
    <>
      {RESIZE_DIRECTIONS.map((direction) => (
        <div
          key={direction}
          className={`${styles.resizeHandle} ${styles[direction]}`}
          data-no-drag
          onMouseDown={(e) => onResizeStart(e, direction)}
        />
      ))}
    </>
  );
};
