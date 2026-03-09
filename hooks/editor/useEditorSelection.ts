/**
 * useEditorSelection Hook
 * Manages combined node and edge selection state and unified selection actions
 *
 * Note: This hook requires Redux store with editor slice.
 * Import paths should be configured by the consuming application.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Type for the editor state slice
export interface EditorState {
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  isDrawing: boolean;
}

// Type for the root state (to be extended by consuming app)
export interface RootState {
  editor: EditorState;
}

// Action creators - these should be imported from the app's editorSlice
export interface EditorActions {
  clearSelection: () => any;
  setSelection: (payload: { nodes?: string[]; edges?: string[] }) => any;
  setDrawing: (drawing: boolean) => any;
}

export interface UseEditorSelectionReturn {
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  isDrawing: boolean;
  clearSelection: () => void;
  setSelection: (nodes?: string[], edges?: string[]) => void;
  setDrawing: (drawing: boolean) => void;
}

export interface UseEditorSelectionOptions {
  actions: EditorActions;
}

export function useEditorSelection(options: UseEditorSelectionOptions): UseEditorSelectionReturn {
  const { actions } = options;
  const dispatch = useDispatch();
  const selectedNodes = useSelector((state: RootState) => state.editor.selectedNodes);
  const selectedEdges = useSelector((state: RootState) => state.editor.selectedEdges);
  const isDrawing = useSelector((state: RootState) => state.editor.isDrawing);

  const clearCurrentSelection = useCallback(() => {
    dispatch(actions.clearSelection());
  }, [dispatch, actions]);

  const setCurrentSelection = useCallback(
    (nodes?: string[], edges?: string[]) => {
      dispatch(actions.setSelection({ nodes, edges }));
    },
    [dispatch, actions]
  );

  const setIsDrawing = useCallback(
    (drawing: boolean) => {
      dispatch(actions.setDrawing(drawing));
    },
    [dispatch, actions]
  );

  return {
    selectedNodes,
    selectedEdges,
    isDrawing,
    clearSelection: clearCurrentSelection,
    setSelection: setCurrentSelection,
    setDrawing: setIsDrawing
  };
}

export default useEditorSelection;
