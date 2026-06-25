/**
 * WorkflowCardActions Component
 * Renders resize handles for the workflow card
 */

import React from 'react';

const RESIZE_DIRECTIONS = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const;

interface WorkflowCardActionsProps {
  onResizeStart: (e: React.MouseEvent, direction: string) => void;
  testId?: string;
}

export const WorkflowCardActions: React.FC<WorkflowCardActionsProps> = ({
  onResizeStart,
  testId,
}) => {
  return (
    <div data-testid={testId} role="group" aria-label="Resize handles">
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
    </div>
  );
};
