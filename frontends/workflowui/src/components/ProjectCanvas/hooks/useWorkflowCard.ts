/**
 * useWorkflowCard - Composes drag, resize, and selection for
 * WorkflowCard items on the project canvas
 */

import { useCallback } from 'react';
import { useCardDrag } from './useCardDrag';
import { useCardResize } from './useCardResize';

interface WorkflowCardParams {
  itemId: string;
  itemPosition: { x: number; y: number };
  itemSize: { width: number; height: number };
  zoom: number;
  snapToGrid: (
    pos: { x: number; y: number }
  ) => { x: number; y: number };
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, w: number, h: number) => void;
  onSelect: (id: string, multiSelect: boolean) => void;
}

export function useWorkflowCard({
  itemId,
  itemPosition,
  itemSize,
  zoom,
  snapToGrid,
  onUpdatePosition,
  onUpdateSize,
  onSelect,
}: WorkflowCardParams) {
  const { cardRef, handleDragStart } = useCardDrag({
    itemId,
    itemPosition,
    zoom,
    snapToGrid,
    onUpdatePosition,
  });

  const { handleResizeStart } = useCardResize({
    itemId,
    itemPosition,
    itemSize,
    zoom,
    onUpdatePosition,
    onUpdateSize,
  });

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect(itemId, e.ctrlKey || e.metaKey || e.shiftKey);
    },
    [itemId, onSelect]
  );

  return {
    cardRef,
    handleSelect,
    handleDragStart,
    handleResizeStart,
  };
}
