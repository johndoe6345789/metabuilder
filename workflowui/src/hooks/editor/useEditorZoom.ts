/**
 * useEditorZoom Hook
 * Manages editor zoom state and zoom-related actions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  setZoom,
  zoomIn,
  zoomOut,
  resetZoom
} from '../../store/slices/editorSlice';

export interface UseEditorZoomReturn {
  zoom: number;
  setZoom: (newZoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export function useEditorZoom(): UseEditorZoomReturn {
  const dispatch = useDispatch();
  const zoom = useSelector((state: RootState) => state.editor.zoom);

  const setCurrentZoom = useCallback(
    (newZoom: number) => {
      dispatch(setZoom(newZoom));
    },
    [dispatch]
  );

  const zoomInAction = useCallback(() => {
    dispatch(zoomIn());
  }, [dispatch]);

  const zoomOutAction = useCallback(() => {
    dispatch(zoomOut());
  }, [dispatch]);

  const resetZoomAction = useCallback(() => {
    dispatch(resetZoom());
  }, [dispatch]);

  return {
    zoom,
    setZoom: setCurrentZoom,
    zoomIn: zoomInAction,
    zoomOut: zoomOutAction,
    resetZoom: resetZoomAction
  };
}

export default useEditorZoom;
