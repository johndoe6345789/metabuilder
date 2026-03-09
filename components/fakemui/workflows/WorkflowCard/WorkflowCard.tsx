/**
 * WorkflowCard Component
 * Draggable and resizable workflow card on the canvas
 */

import React, { useCallback } from 'react';
import { ProjectCanvasItem } from '../types';
// import styles from (TODO: SCSS module - Phase 5)
import { WorkflowCardHeader } from './WorkflowCardHeader';
import { WorkflowCardPreview } from './WorkflowCardPreview';
import { WorkflowCardFooter } from './WorkflowCardFooter';
import { WorkflowCardActions } from './WorkflowCardActions';
import { useDragResize } from './useDragResize';
import { testId } from '../../../../hooks/useAccessible';

interface WorkflowCardProps {
  item: ProjectCanvasItem;
  workflow: any;
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onOpen: (workflowId: string) => void;
  zoom: number;
  snapToGrid: (pos: { x: number; y: number }) => { x: number; y: number };
}

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
  snapToGrid
}) => {
  const { cardRef, isDragging, handleDragStart, handleResizeStart } =
    useDragResize({
      item,
      zoom,
      snapToGrid,
      onUpdatePosition,
      onUpdateSize
    });

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const multiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
      onSelect(item.id, multiSelect);
    },
    [item.id, onSelect]
  );

  const nodeCount = workflow?.nodes?.length || 0;
  const connectionCount = workflow?.connections?.length || 0;

  return (
    <div
      ref={cardRef}
      data-selected={isSelected}
      data-dragging={isDragging}
      style={{
        left: `${item.position.x}px`,
        top: `${item.position.y}px`,
        width: `${item.size.width}px`,
        height: `${item.size.height}px`,
        borderColor: item.color || 'var(--color-primary)',
        zIndex: item.zIndex,
        position: 'absolute',
        border: '2px solid',
        borderRadius: '4px',
        backgroundColor: 'var(--color-surface)',
        boxShadow: isSelected ? 'var(--shadow-lg)' : 'var(--shadow-md)',
        opacity: isDragging ? 0.8 : 1,
        transition: 'box-shadow 200ms ease-in-out, opacity 200ms ease-in-out',
      }}
      onMouseDown={handleSelect}
      onMouseMove={handleDragStart}
      data-testid={testId.workflowCard(item.id)}
      role="article"
      aria-label={`Workflow card: ${workflow?.name}`}
      aria-selected={isSelected}
      aria-grabbed={isDragging}
      tabIndex={0}
      aria-describedby={`workflow-${item.id}-info`}
    >
      <WorkflowCardHeader
        workflowName={workflow?.name}
        workflowId={workflow?.id}
        onOpen={onOpen}
        onDelete={onDelete}
        itemId={item.id}
      />
      <WorkflowCardPreview nodeCount={nodeCount} isMinimized={item.minimized ?? false} />
      <WorkflowCardFooter
        nodeCount={nodeCount}
        connectionCount={connectionCount}
      />
      <WorkflowCardActions onResizeStart={handleResizeStart} />

      {/* SR-only description of workflow info */}
      <div
        id={`workflow-${item.id}-info`}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {nodeCount} nodes, {connectionCount} connections. {isSelected ? 'Currently selected.' : ''} {isDragging ? 'Currently dragging.' : ''}
        Use arrow keys to move, drag to reposition, or resize handles to resize.
      </div>
    </div>
  );
};

export default React.memo(WorkflowCard, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.position.x === nextProps.item.position.x &&
    prevProps.item.position.y === nextProps.item.position.y &&
    prevProps.item.size.width === nextProps.item.size.width &&
    prevProps.item.size.height === nextProps.item.size.height &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.item.zIndex === nextProps.item.zIndex
  );
});
