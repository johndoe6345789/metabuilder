/**
 * useCanvasPan Hook
 * Manages canvas pan/scroll state and pan-related actions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@metabuilder/redux-slices';
import {
  setCanvasPan,
  panCanvas,
  selectCanvasPan,
  setDragging,
  selectIsDragging
} from '@metabuilder/redux-slices/canvasSlice';
import { CanvasPosition } from '@metabuilder/redux-slices';

export interface UseCanvasPanReturn {
  pan: CanvasPosition;
  isDragging: boolean;
  panTo: (position: CanvasPosition) => void;
  panBy: (delta: CanvasPosition) => void;
  setDraggingState: (isDragging: boolean) => void;
}

export function useCanvasPan(): UseCanvasPanReturn {
  const dispatch = useDispatch<AppDispatch>();
  const pan = useSelector((state: RootState) => selectCanvasPan(state));
  const isDragging = useSelector((state: RootState) => selectIsDragging(state));

  const panTo = useCallback((position: CanvasPosition) => {
    dispatch(setCanvasPan(position));
  }, [dispatch]);

  const panBy = useCallback((delta: CanvasPosition) => {
    dispatch(panCanvas(delta));
  }, [dispatch]);

  const setDraggingState = useCallback((isDragging: boolean) => {
    dispatch(setDragging(isDragging));
  }, [dispatch]);

  return {
    pan,
    isDragging,
    panTo,
    panBy,
    setDraggingState
  };
}

export default useCanvasPan;
