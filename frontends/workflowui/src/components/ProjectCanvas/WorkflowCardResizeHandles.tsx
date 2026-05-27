/**
 * WorkflowCardResizeHandles - 8-direction resize handle set
 */

import React from 'react';

type ResizeDir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const RESIZE_HANDLES: ResizeDir[] = [
  'n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw',
];

interface WorkflowCardResizeHandlesProps {
  onResizeStart: (
    e: React.MouseEvent,
    dir: ResizeDir
  ) => void;
}

export default function WorkflowCardResizeHandles({
  onResizeStart,
}: WorkflowCardResizeHandlesProps) {
  return (
    <>
      {RESIZE_HANDLES.map((dir) => (
        <div
          key={dir}
          className={''}
          data-no-drag
          onMouseDown={(e) => onResizeStart(e, dir)}
        />
      ))}
    </>
  );
}
