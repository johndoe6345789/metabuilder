/**
 * useDragResize Hook
 * Encapsulates drag and resize logic for WorkflowCard
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { ProjectCanvasItem } from '../../../types/project';
import { useProjectCanvas } from '../../../hooks/canvas';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

interface UseDragResizeParams {
  item: ProjectCanvasItem;
  zoom: number;
  snap_to_grid: (pos: { x: number; y: number }) => { x: number; y: number };
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
}

export const useDragResize = ({
  item,
  zoom,
  snap_to_grid,
  onUpdatePosition,
  onUpdateSize
}: UseDragResizeParams) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { set_dragging, set_resizing } = useProjectCanvas();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !cardRef.current) return;
      const delta = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
      const scaledDelta = { x: delta.x / zoom, y: delta.y / zoom };
      const newPos = {
        x: item.position.x + scaledDelta.x,
        y: item.position.y + scaledDelta.y
      };
      const snappedPos = snap_to_grid(newPos);
      onUpdatePosition(item.id, snappedPos.x, snappedPos.y);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, item, zoom, snap_to_grid, onUpdatePosition]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    set_dragging(false);
  }, [set_dragging]);

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeDirection || !cardRef.current) return;
      const delta = { x: e.clientX - dragStart.x, y: e.clientY - dragStart.y };
      const scaledDelta = { x: delta.x / zoom, y: delta.y / zoom };

      let newWidth = item.size.width;
      let newHeight = item.size.height;
      let newX = item.position.x;
      let newY = item.position.y;

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(MIN_WIDTH, item.size.width + scaledDelta.x);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(MIN_HEIGHT, item.size.height + scaledDelta.y);
      }
      if (resizeDirection.includes('w')) {
        const deltaWidth = -scaledDelta.x;
        newWidth = Math.max(MIN_WIDTH, item.size.width + deltaWidth);
        if (newWidth > MIN_WIDTH) newX = item.position.x - deltaWidth;
      }
      if (resizeDirection.includes('n')) {
        const deltaHeight = -scaledDelta.y;
        newHeight = Math.max(MIN_HEIGHT, item.size.height + deltaHeight);
        if (newHeight > MIN_HEIGHT) newY = item.position.y - deltaHeight;
      }

      onUpdateSize(item.id, newWidth, newHeight);
      if (newX !== item.position.x || newY !== item.position.y) {
        onUpdatePosition(item.id, newX, newY);
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isResizing, resizeDirection, dragStart, item, zoom, onUpdateSize, onUpdatePosition]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
    set_resizing(false);
  }, [set_resizing]);

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

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      set_dragging(true);
    },
    [set_dragging]
  );

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

  return {
    cardRef,
    isDragging,
    handleDragStart,
    handleResizeStart
  };
};
