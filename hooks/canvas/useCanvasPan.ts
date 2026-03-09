/**
 * useCanvasPan Hook
 * Manages canvas pan/scroll state and pan-related actions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setCanvasPan,
  panCanvas,
  selectCanvasPan,
  setDragging,
  selectIsDragging,
  type CanvasPosition
} from '@metabuilder/redux-slices';

export interface UseCanvasPanReturn {
  pan: CanvasPosition;
  isDragging: boolean;
  panTo: (position: CanvasPosition) => void;
  panBy: (delta: CanvasPosition) => void;
  setDraggingState: (isDragging: boolean) => void;
}

export function useCanvasPan(): UseCanvasPanReturn {
  const dispatch = useDispatch();
  const pan = useSelector(selectCanvasPan);
  const isDragging = useSelector(selectIsDragging);

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
