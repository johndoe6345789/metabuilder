/**
 * WorkflowCard Component
 * Draggable and resizable workflow card on the canvas
 */

import React from 'react';
import { useWorkflowCard } from './hooks/useWorkflowCard';
import WorkflowCardHeader from './WorkflowCardHeader';
import WorkflowCardResizeHandles from './WorkflowCardResizeHandles';
import {
  type WorkflowCardProps,
  areWorkflowCardPropsEqual,
} from './workflowCardTypes';

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  item,
  workflow,
  isSelected,
  onSelect,
  onUpdatePosition,
  onUpdateSize,
  onDelete,
  onOpen,
  zoom,
  snap_to_grid,
}) => {
  const {
    cardRef,
    handleSelect,
    handleDragStart,
    handleResizeStart,
  } = useWorkflowCard({
    itemId: item.id,
    itemPosition: item.position,
    itemSize: item.size,
    zoom,
    snapToGrid: snap_to_grid,
    onUpdatePosition,
    onUpdateSize,
    onSelect,
  });

  const nodeCount = workflow?.nodes?.length || 0;
  const connectionCount = workflow?.connections?.length || 0;

  return (
    <div
      ref={cardRef}
      style={{
        left: `${item.position.x}px`,
        top: `${item.position.y}px`,
        width: `${item.size.width}px`,
        height: `${item.size.height}px`,
        borderColor: item.color || 'var(--color-primary)',
        zIndex: item.zIndex,
      }}
      onMouseDown={handleSelect}
      onMouseMove={handleDragStart}
    >
      <WorkflowCardHeader
        name={workflow?.name}
        workflowId={workflow?.id}
        itemId={item.id}
        onOpen={onOpen}
        onDelete={onDelete}
      />

      {!item.minimized && (
        <div>
          <div>
            <div>
              <div>{nodeCount}</div>
              <div>nodes</div>
            </div>
          </div>
        </div>
      )}

      <div>
        <span>
          {nodeCount} nodes • {connectionCount} connections
        </span>
      </div>

      <WorkflowCardResizeHandles
        onResizeStart={handleResizeStart}
      />
    </div>
  );
};

export default React.memo(
  WorkflowCard,
  areWorkflowCardPropsEqual
);
