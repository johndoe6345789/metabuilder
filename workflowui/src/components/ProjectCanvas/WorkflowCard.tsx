/**
 * WorkflowCard Component
 * Draggable and resizable workflow card on the canvas
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ProjectCanvasItem } from '../../types/project';
import { useProjectCanvas } from '../../hooks/canvas';

interface WorkflowCardProps {
  item: ProjectCanvasItem;
  workflow: any; // From workflow state
  isSelected: boolean;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
  onDelete: (id: string) => void;
  onOpen: (workflowId: string) => void;
  zoom: number;
  snap_to_grid: (pos: { x: number; y: number }) => { x: number; y: number };
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
  snap_to_grid
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { set_dragging, set_resizing, gridSnap } = useProjectCanvas();

  const minWidth = 200;
  const minHeight = 150;

  // Handle card selection
  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const multiSelect = e.ctrlKey || e.metaKey || e.shiftKey;
      onSelect(item.id, multiSelect);
    },
    [item.id, onSelect]
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Only left mouse button
      if ((e.target as HTMLElement).closest('[data-no-drag]')) return; // Skip drag handles

      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      set_dragging(true);
    },
    [set_dragging]
  );

  // Handle drag move
  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !cardRef.current) return;

      const delta = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };

      // Adjust for zoom
      const scaledDelta = {
        x: delta.x / zoom,
        y: delta.y / zoom
      };

      const newPos = {
        x: item.position.x + scaledDelta.x,
        y: item.position.y + scaledDelta.y
      };

      // Apply grid snap
      const snappedPos = snap_to_grid(newPos);
      onUpdatePosition(item.id, snappedPos.x, snappedPos.y);

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, item, zoom, snap_to_grid, onUpdatePosition]
  );

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    set_dragging(false);
  }, [set_dragging]);

  // Handle resize start
  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeDirection(direction);
      setDragStart({ x: e.clientX, y: e.clientY });
      set_resizing(true);
    },
    [set_resizing]
  );

  // Handle resize move
  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeDirection || !cardRef.current) return;

      const delta = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };

      // Adjust for zoom
      const scaledDelta = {
        x: delta.x / zoom,
        y: delta.y / zoom
      };

      let newWidth = item.size.width;
      let newHeight = item.size.height;
      let newX = item.position.x;
      let newY = item.position.y;

      // Handle different resize directions
      if (resizeDirection.includes('e')) {
        newWidth = Math.max(minWidth, item.size.width + scaledDelta.x);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(minHeight, item.size.height + scaledDelta.y);
      }
      if (resizeDirection.includes('w')) {
        const deltaWidth = -scaledDelta.x;
        newWidth = Math.max(minWidth, item.size.width + deltaWidth);
        if (newWidth > minWidth) {
          newX = item.position.x - deltaWidth;
        }
      }
      if (resizeDirection.includes('n')) {
        const deltaHeight = -scaledDelta.y;
        newHeight = Math.max(minHeight, item.size.height + deltaHeight);
        if (newHeight > minHeight) {
          newY = item.position.y - deltaHeight;
        }
      }

      onUpdateSize(item.id, newWidth, newHeight);
      if (newX !== item.position.x || newY !== item.position.y) {
        onUpdatePosition(item.id, newX, newY);
      }

      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isResizing, resizeDirection, dragStart, item, zoom, onUpdateSize, onUpdatePosition]
  );

  // Handle resize end
  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
    set_resizing(false);
  }, [set_resizing]);

  // Mouse move listener
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEnd);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  // Resize move listener
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

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
        zIndex: item.zIndex
      }}
      onMouseDown={handleSelect}
      onMouseMove={handleDragStart}
    >
      {/* Header */}
      <div  data-no-drag>
        <div >{workflow?.name || 'Untitled Workflow'}</div>
        <div >
          <button
            
            onClick={() => onOpen(workflow.id)}
            title="Open workflow editor"
            aria-label="Open workflow"
          >
            ⟳
          </button>
          <button
            
            onClick={() => onDelete(item.id)}
            title="Remove from canvas"
            aria-label="Remove"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body - Mini preview */}
      {!item.minimized ? (
        <div >
          <div >
            <div >
              <div >{nodeCount}</div>
              <div >nodes</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Footer */}
      <div >
        <span >
          {nodeCount} nodes • {connectionCount} connections
        </span>
      </div>

      {/* Resize handles */}
      <div
        className={""}
        data-no-drag
        onMouseDown={(e) => handleResizeStart(e, 'n')}
      />
      <div
        className={""}
        data-no-drag
        onMouseDown={(e) => handleResizeStart(e, 's')}
      />
      <div
        className={""}
        data-no-drag
        onMouseDown={(e) => handleResizeStart(e, 'e')}
      />
      <div
        className={""}
        data-no-drag
        onMouseDown={(e) => handleResizeStart(e, 'w')}
      />
      <div
        className={""}
        data-no-drag
        onMouseDown={(e) => handleResizeStart(e, 'ne')}
      />
      <div
        className={""}
        data-no-drag
        onMouseDown={(e) => handleResizeStart(e, 'nw')}
      />
      <div
        className={""}
        data-no-drag
        onMouseDown={(e) => handleResizeStart(e, 'se')}
      />
      <div
        className={""}
        data-no-drag
        onMouseDown={(e) => handleResizeStart(e, 'sw')}
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders when props haven't changed
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
