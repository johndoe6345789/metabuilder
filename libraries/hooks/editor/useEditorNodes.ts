/**
 * useEditorNodes Hook
 * Manages editor node selection state and node-related actions
 *
 * Note: This hook requires Redux store with editor slice.
 * Import paths should be configured by the consuming application.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Type for the editor state slice
export interface EditorState {
  selectedNodes: Set<string>;
}

// Type for the root state (to be extended by consuming app)
export interface RootState {
  editor: EditorState;
}

// Action creators - these should be imported from the app's editorSlice
export interface EditorActions {
  selectNode: (nodeId: string) => any;
  addNodeToSelection: (nodeId: string) => any;
  removeNodeFromSelection: (nodeId: string) => any;
  toggleNodeSelection: (nodeId: string) => any;
  clearSelection: () => any;
  setSelection: (payload: { nodes?: string[]; edges?: string[] }) => any;
}

export interface UseEditorNodesReturn {
  selectedNodes: Set<string>;
  selectNode: (nodeId: string) => void;
  addNodeToSelection: (nodeId: string) => void;
  removeNodeFromSelection: (nodeId: string) => void;
  toggleNodeSelection: (nodeId: string) => void;
  clearSelection: () => void;
  setNodeSelection: (nodes: string[], edges?: string[]) => void;
}

export interface UseEditorNodesOptions {
  actions: EditorActions;
}

export function useEditorNodes(options: UseEditorNodesOptions): UseEditorNodesReturn {
  const { actions } = options;
  const dispatch = useDispatch();
  const selectedNodes = useSelector((state: RootState) => state.editor.selectedNodes);

  const selectNodeAction = useCallback(
    (nodeId: string) => {
      dispatch(actions.selectNode(nodeId));
    },
    [dispatch, actions]
  );

  const addToNodeSelection = useCallback(
    (nodeId: string) => {
      dispatch(actions.addNodeToSelection(nodeId));
    },
    [dispatch, actions]
  );

  const removeFromNodeSelection = useCallback(
    (nodeId: string) => {
      dispatch(actions.removeNodeFromSelection(nodeId));
    },
    [dispatch, actions]
  );

  const toggleNode = useCallback(
    (nodeId: string) => {
      dispatch(actions.toggleNodeSelection(nodeId));
    },
    [dispatch, actions]
  );

  const clearNodeSelection = useCallback(() => {
    dispatch(actions.clearSelection());
  }, [dispatch, actions]);

  const setNodeSelection = useCallback(
    (nodes: string[], edges?: string[]) => {
      dispatch(actions.setSelection({ nodes, edges }));
    },
    [dispatch, actions]
  );

  return {
    selectedNodes,
    selectNode: selectNodeAction,
    addNodeToSelection: addToNodeSelection,
    removeNodeFromSelection: removeFromNodeSelection,
    toggleNodeSelection: toggleNode,
    clearSelection: clearNodeSelection,
    setNodeSelection
  };
}

export default useEditorNodes;
