/**
 * useCardDrag - Mouse drag state and handlers for workflow cards
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useProjectCanvas } from '../../../hooks/canvas';

interface CardDragParams {
  itemId: string;
  itemPosition: { x: number; y: number };
  zoom: number;
  snapToGrid: (
    pos: { x: number; y: number }
  ) => { x: number; y: number };
  onUpdatePosition: (id: string, x: number, y: number) => void;
}

export function useCardDrag({
  itemId,
  itemPosition,
  zoom,
  snapToGrid,
  onUpdatePosition,
}: CardDragParams) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const { set_dragging } = useProjectCanvas();

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if (
        (e.target as HTMLElement).closest('[data-no-drag]')
      )
        return;
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      set_dragging(true);
    },
    [set_dragging]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !cardRef.current) return;
      const scaled = {
        x: (e.clientX - dragStart.x) / zoom,
        y: (e.clientY - dragStart.y) / zoom,
      };
      const snapped = snapToGrid({
        x: itemPosition.x + scaled.x,
        y: itemPosition.y + scaled.y,
      });
      onUpdatePosition(itemId, snapped.x, snapped.y);
      setDragStart({ x: e.clientX, y: e.clientY });
    },
    [
      isDragging,
      dragStart,
      itemPosition,
      zoom,
      snapToGrid,
      onUpdatePosition,
      itemId,
    ]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    set_dragging(false);
  }, [set_dragging]);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [isDragging, handleDragMove, handleDragEnd]);

  return { cardRef, handleDragStart };
}
