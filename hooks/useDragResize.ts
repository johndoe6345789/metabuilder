/**
 * useDragResize Hook
 * Encapsulates drag and resize logic for draggable/resizable components
 */

import { useRef, useState, useCallback, useEffect } from 'react';

const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

export interface DragResizeItem {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export interface UseDragResizeParams {
  item: DragResizeItem;
  zoom?: number;
  snapToGrid?: (pos: { x: number; y: number }) => { x: number; y: number };
  onUpdatePosition?: (id: string, x: number, y: number) => void;
  onUpdateSize?: (id: string, width: number, height: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onResizeStart?: () => void;
  onResizeEnd?: () => void;
  minWidth?: number;
  minHeight?: number;
}

export interface UseDragResizeReturn {
  cardRef: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  isResizing: boolean;
  handleDragStart: (e: React.MouseEvent) => void;
  handleResizeStart: (e: React.MouseEvent, direction: string) => void;
}

export const useDragResize = ({
  item,
  zoom = 1,
  snapToGrid = (pos) => pos,
  onUpdatePosition,
  onUpdateSize,
  onDragStart,
  onDragEnd,
  onResizeStart,
  onResizeEnd,
  minWidth = MIN_WIDTH,
  minHeight = MIN_HEIGHT,
}: UseDragResizeParams): UseDragResizeReturn => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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
      const snappedPos = snapToGrid(newPos);
      onUpdatePosition?.(item.id, snappedPos.x, snappedPos.y);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isDragging, dragStart, item, zoom, snapToGrid, onUpdatePosition]
  );

  const handleDragEndInternal = useCallback(() => {
    setIsDragging(false);
    onDragEnd?.();
  }, [onDragEnd]);

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
        newWidth = Math.max(minWidth, item.size.width + scaledDelta.x);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(minHeight, item.size.height + scaledDelta.y);
      }
      if (resizeDirection.includes('w')) {
        const deltaWidth = -scaledDelta.x;
        newWidth = Math.max(minWidth, item.size.width + deltaWidth);
        if (newWidth > minWidth) newX = item.position.x - deltaWidth;
      }
      if (resizeDirection.includes('n')) {
        const deltaHeight = -scaledDelta.y;
        newHeight = Math.max(minHeight, item.size.height + deltaHeight);
        if (newHeight > minHeight) newY = item.position.y - deltaHeight;
      }

      onUpdateSize?.(item.id, newWidth, newHeight);
      if (newX !== item.position.x || newY !== item.position.y) {
        onUpdatePosition?.(item.id, newX, newY);
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isResizing, resizeDirection, dragStart, item, zoom, minWidth, minHeight, onUpdateSize, onUpdatePosition]
  );

  const handleResizeEndInternal = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
    onResizeEnd?.();
  }, [onResizeEnd]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', handleDragEndInternal);
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEndInternal);
      };
    }
  }, [isDragging, handleDragMove, handleDragEndInternal]);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEndInternal);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEndInternal);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEndInternal]);

  const handleDragStartInternal = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if ((e.target as HTMLElement).closest('[data-no-drag]')) return;
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      onDragStart?.();
    },
    [onDragStart]
  );

  const handleResizeStartInternal = useCallback(
    (e: React.MouseEvent, direction: string) => {
      e.stopPropagation();
      setIsResizing(true);
      setResizeDirection(direction);
      setDragStart({ x: e.clientX, y: e.clientY });
      onResizeStart?.();
    },
    [onResizeStart]
  );

  return {
    cardRef,
    isDragging,
    isResizing,
    handleDragStart: handleDragStartInternal,
    handleResizeStart: handleResizeStartInternal
  };
};

export default useDragResize;
