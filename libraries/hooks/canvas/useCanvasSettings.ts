/**
 * useCanvasSettings Hook
 * Manages canvas grid and snap settings
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setGridSnap,
  setShowGrid,
  setSnapSize,
  selectGridSnap,
  selectShowGrid,
  selectSnapSize
} from '@metabuilder/redux-slices';

export interface UseCanvasSettingsReturn {
  gridSnap: boolean;
  showGrid: boolean;
  snapSize: number;
  toggleGridSnap: () => void;
  toggleShowGrid: () => void;
  setSnapSizeValue: (size: number) => void;
}

export function useCanvasSettings(): UseCanvasSettingsReturn {
  const dispatch = useDispatch();
  const gridSnap = useSelector(selectGridSnap);
  const showGrid = useSelector(selectShowGrid);
  const snapSize = useSelector(selectSnapSize);

  const toggleGridSnap = useCallback(() => {
    dispatch(setGridSnap(!gridSnap));
  }, [gridSnap, dispatch]);

  const toggleShowGrid = useCallback(() => {
    dispatch(setShowGrid(!showGrid));
  }, [showGrid, dispatch]);

  const setSnapSizeValue = useCallback((size: number) => {
    dispatch(setSnapSize(Math.max(size, 1)));
  }, [dispatch]);

  return {
    gridSnap,
    showGrid,
    snapSize,
    toggleGridSnap,
    toggleShowGrid,
    setSnapSizeValue
  };
}

export default useCanvasSettings;
