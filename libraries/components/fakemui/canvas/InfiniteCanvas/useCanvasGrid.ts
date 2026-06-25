/**
 * useCanvasGrid Hook
 * Manages grid rendering and display logic
 * Calculates grid pattern offset based on pan position
 */

import { useMemo } from 'react';
import { useProjectCanvas } from '@metabuilder/hooks-canvas';

interface UseCanvasGridReturn {
  gridOffset: { x: number; y: number };
  showGrid: boolean;
}

export function useCanvasGrid(): UseCanvasGridReturn {
  const { pan, showGrid, snapSize } = useProjectCanvas();

  // Calculate grid offset for smooth panning
  const gridOffset = useMemo(
    () => ({
      x: pan.x % snapSize,
      y: pan.y % snapSize
    }),
    [pan.x, pan.y, snapSize]
  );

  return {
    gridOffset,
    showGrid
  };
}

export default useCanvasGrid;
