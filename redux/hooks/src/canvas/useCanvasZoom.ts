/**
 * useCanvasZoom Hook
 * Manages canvas zoom state and zoom-related actions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@metabuilder/redux-slices';
import {
  setCanvasZoom,
  resetCanvasView,
  selectCanvasZoom
} from '@metabuilder/redux-slices/canvasSlice';

export interface UseCanvasZoomReturn {
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
  setZoom: (zoom: number) => void;
}

export function useCanvasZoom(): UseCanvasZoomReturn {
  const dispatch = useDispatch<AppDispatch>();
  const zoom = useSelector((state: RootState) => selectCanvasZoom(state));

  const zoomIn = useCallback(() => {
    dispatch(setCanvasZoom(Math.min(zoom * 1.2, 3)));
  }, [zoom, dispatch]);

  const zoomOut = useCallback(() => {
    dispatch(setCanvasZoom(Math.max(zoom / 1.2, 0.1)));
  }, [zoom, dispatch]);

  const resetView = useCallback(() => {
    dispatch(resetCanvasView());
  }, [dispatch]);

  const setZoom = useCallback((newZoom: number) => {
    dispatch(setCanvasZoom(Math.max(0.1, Math.min(newZoom, 3))));
  }, [dispatch]);

  return {
    zoom,
    zoomIn,
    zoomOut,
    resetView,
    setZoom
  };
}

export default useCanvasZoom;
