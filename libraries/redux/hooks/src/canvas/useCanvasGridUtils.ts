/**
 * useCanvasGridUtils Hook
 * Utility functions for canvas grid operations
 */

import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  selectGridSnap,
  selectSnapSize
} from '@metabuilder/redux-slices/canvasSlice';

export interface UseCanvasGridUtilsReturn {
  snapToGrid: (position: { x: number; y: number }) => { x: number; y: number };
}

export function useCanvasGridUtils(): UseCanvasGridUtilsReturn {
  const gridSnap = useSelector((state: RootState) => selectGridSnap(state));
  const snapSize = useSelector((state: RootState) => selectSnapSize(state));

  // Snap position to grid
  const snapToGrid = useCallback(
    (position: { x: number; y: number }) => {
      if (!gridSnap) return position;

      return {
        x: Math.round(position.x / snapSize) * snapSize,
        y: Math.round(position.y / snapSize) * snapSize
      };
    },
    [gridSnap, snapSize]
  );

  return {
    snapToGrid
  };
}

export default useCanvasGridUtils;
