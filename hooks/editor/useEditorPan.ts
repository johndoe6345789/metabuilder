/**
 * useEditorPan Hook
 * Manages editor pan (translate) state and pan-related actions
 *
 * Note: This hook requires Redux store with editor slice.
 * Import paths should be configured by the consuming application.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Type for the editor state slice
export interface EditorState {
  pan: { x: number; y: number };
}

// Type for the root state (to be extended by consuming app)
export interface RootState {
  editor: EditorState;
}

// Action creators - these should be imported from the app's editorSlice
export interface EditorActions {
  setPan: (payload: { x: number; y: number }) => any;
  panBy: (payload: { dx: number; dy: number }) => any;
  resetPan: () => any;
}

export interface UseEditorPanReturn {
  pan: { x: number; y: number };
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  resetPan: () => void;
}

export interface UseEditorPanOptions {
  actions: EditorActions;
}

export function useEditorPan(options: UseEditorPanOptions): UseEditorPanReturn {
  const { actions } = options;
  const dispatch = useDispatch();
  const pan = useSelector((state: RootState) => state.editor.pan);

  const setPanPosition = useCallback(
    (x: number, y: number) => {
      dispatch(actions.setPan({ x, y }));
    },
    [dispatch, actions]
  );

  const panCanvas = useCallback(
    (dx: number, dy: number) => {
      dispatch(actions.panBy({ dx, dy }));
    },
    [dispatch, actions]
  );

  const resetPanAction = useCallback(() => {
    dispatch(actions.resetPan());
  }, [dispatch, actions]);

  return {
    pan,
    setPan: setPanPosition,
    panBy: panCanvas,
    resetPan: resetPanAction
  };
}

export default useEditorPan;
