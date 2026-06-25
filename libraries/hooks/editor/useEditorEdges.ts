/**
 * useEditorEdges Hook
 * Manages editor edge/connection selection state and edge-related actions
 *
 * Note: This hook requires Redux store with editor slice.
 * Import paths should be configured by the consuming application.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Type for the editor state slice
export interface EditorState {
  selectedEdges: Set<string>;
}

// Type for the root state (to be extended by consuming app)
export interface RootState {
  editor: EditorState;
}

// Action creators - these should be imported from the app's editorSlice
export interface EditorActions {
  selectEdge: (edgeId: string) => any;
  addEdgeToSelection: (edgeId: string) => any;
  removeEdgeFromSelection: (edgeId: string) => any;
  clearSelection: () => any;
  setSelection: (payload: { nodes?: string[]; edges?: string[] }) => any;
}

export interface UseEditorEdgesReturn {
  selectedEdges: Set<string>;
  selectEdge: (edgeId: string) => void;
  addEdgeToSelection: (edgeId: string) => void;
  removeEdgeFromSelection: (edgeId: string) => void;
  clearSelection: () => void;
  setEdgeSelection: (edges: string[], nodes?: string[]) => void;
}

export interface UseEditorEdgesOptions {
  actions: EditorActions;
}

export function useEditorEdges(options: UseEditorEdgesOptions): UseEditorEdgesReturn {
  const { actions } = options;
  const dispatch = useDispatch();
  const selectedEdges = useSelector((state: RootState) => state.editor.selectedEdges);

  const selectEdgeAction = useCallback(
    (edgeId: string) => {
      dispatch(actions.selectEdge(edgeId));
    },
    [dispatch, actions]
  );

  const addToEdgeSelection = useCallback(
    (edgeId: string) => {
      dispatch(actions.addEdgeToSelection(edgeId));
    },
    [dispatch, actions]
  );

  const removeFromEdgeSelection = useCallback(
    (edgeId: string) => {
      dispatch(actions.removeEdgeFromSelection(edgeId));
    },
    [dispatch, actions]
  );

  const clearEdgeSelection = useCallback(() => {
    dispatch(actions.clearSelection());
  }, [dispatch, actions]);

  const setEdgeSelection = useCallback(
    (edges: string[], nodes?: string[]) => {
      dispatch(actions.setSelection({ nodes, edges }));
    },
    [dispatch, actions]
  );

  return {
    selectedEdges,
    selectEdge: selectEdgeAction,
    addEdgeToSelection: addToEdgeSelection,
    removeEdgeFromSelection: removeFromEdgeSelection,
    clearSelection: clearEdgeSelection,
    setEdgeSelection
  };
}

export default useEditorEdges;
