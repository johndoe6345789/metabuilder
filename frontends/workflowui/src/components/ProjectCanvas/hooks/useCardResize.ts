/** useCardResize - Mouse resize state and handlers for workflow cards */

import { useState, useCallback, useEffect } from 'react';
import { useProjectCanvas } from '../../../hooks/canvas';
import { applyResizeDirection } from './resizeUtils';

interface CardResizeParams {
  itemId: string;
  itemPosition: { x: number; y: number };
  itemSize: { width: number; height: number };
  zoom: number;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, w: number, h: number) => void;
}

export function useCardResize({
  itemId, itemPosition, itemSize, zoom,
  onUpdatePosition, onUpdateSize,
}: CardResizeParams) {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<
    string | null
  >(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { set_resizing } = useProjectCanvas();

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

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !resizeDirection) return;
      const delta = {
        x: (e.clientX - dragStart.x) / zoom,
        y: (e.clientY - dragStart.y) / zoom,
      };
      const { newW, newH, newX, newY } = applyResizeDirection(
        resizeDirection, delta, itemSize, itemPosition
      );
      onUpdateSize(itemId, newW, newH);
      if (newX !== itemPosition.x || newY !== itemPosition.y) {
        onUpdatePosition(itemId, newX, newY);
      }
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [isResizing, resizeDirection, dragStart,
      itemPosition, itemSize, zoom,
      onUpdateSize, onUpdatePosition, itemId]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    setResizeDirection(null);
    set_resizing(false);
  }, [set_resizing]);

  useEffect(() => {
    if (!isResizing) return;
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  return { handleResizeStart };
}
