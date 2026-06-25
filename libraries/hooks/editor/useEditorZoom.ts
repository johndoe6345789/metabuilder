/**
 * useEditorZoom Hook
 * Manages editor zoom state and zoom-related actions
 *
 * Note: This hook requires Redux store with editor slice.
 * Import paths should be configured by the consuming application.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Type for the editor state slice
export interface EditorState {
  zoom: number;
}

// Type for the root state (to be extended by consuming app)
export interface RootState {
  editor: EditorState;
}

// Action creators - these should be imported from the app's editorSlice
export interface EditorActions {
  setZoom: (zoom: number) => any;
  zoomIn: () => any;
  zoomOut: () => any;
  resetZoom: () => any;
}

export interface UseEditorZoomReturn {
  zoom: number;
  setZoom: (newZoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

export interface UseEditorZoomOptions {
  actions: EditorActions;
}

export function useEditorZoom(options: UseEditorZoomOptions): UseEditorZoomReturn {
  const { actions } = options;
  const dispatch = useDispatch();
  const zoom = useSelector((state: RootState) => state.editor.zoom);

  const setCurrentZoom = useCallback(
    (newZoom: number) => {
      dispatch(actions.setZoom(newZoom));
    },
    [dispatch, actions]
  );

  const zoomInAction = useCallback(() => {
    dispatch(actions.zoomIn());
  }, [dispatch, actions]);

  const zoomOutAction = useCallback(() => {
    dispatch(actions.zoomOut());
  }, [dispatch, actions]);

  const resetZoomAction = useCallback(() => {
    dispatch(actions.resetZoom());
  }, [dispatch, actions]);

  return {
    zoom,
    setZoom: setCurrentZoom,
    zoomIn: zoomInAction,
    zoomOut: zoomOutAction,
    resetZoom: resetZoomAction
  };
}

export default useEditorZoom;
