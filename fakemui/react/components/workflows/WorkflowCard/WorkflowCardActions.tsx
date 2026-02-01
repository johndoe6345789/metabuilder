/**
 * WorkflowCardActions Component
 * Renders resize handles for the workflow card
 */

import React from 'react';

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
          data-no-drag
          data-resize-handle={direction}
          onMouseDown={(e) => onResizeStart(e, direction)}
          style={{
            position: 'absolute',
            backgroundColor: 'transparent',
            cursor: direction === 'n' || direction === 's' ? 'ns-resize' : 'ew-resize',
          }}
        />
      ))}
    </>
  );
};
