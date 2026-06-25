/**
 * useEditorNodes Hook
 * Manages editor node selection state and node-related actions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  selectNode,
  addNodeToSelection,
  removeNodeFromSelection,
  toggleNodeSelection,
  clearSelection,
  setSelection
} from '@metabuilder/redux-slices/editorSlice';

export interface UseEditorNodesReturn {
  selectedNodes: Set<string>;
  selectNode: (nodeId: string) => void;
  addNodeToSelection: (nodeId: string) => void;
  removeNodeFromSelection: (nodeId: string) => void;
  toggleNodeSelection: (nodeId: string) => void;
  clearSelection: () => void;
  setNodeSelection: (nodes: string[], edges?: string[]) => void;
}

export function useEditorNodes(): UseEditorNodesReturn {
  const dispatch = useDispatch();
  const selectedNodes = useSelector((state: RootState) => state.editor.selectedNodes);

  const selectNodeAction = useCallback(
    (nodeId: string) => {
      dispatch(selectNode(nodeId));
    },
    [dispatch]
  );

  const addToNodeSelection = useCallback(
    (nodeId: string) => {
      dispatch(addNodeToSelection(nodeId));
    },
    [dispatch]
  );

  const removeFromNodeSelection = useCallback(
    (nodeId: string) => {
      dispatch(removeNodeFromSelection(nodeId));
    },
    [dispatch]
  );

  const toggleNode = useCallback(
    (nodeId: string) => {
      dispatch(toggleNodeSelection(nodeId));
    },
    [dispatch]
  );

  const clearNodeSelection = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const setNodeSelection = useCallback(
    (nodes: string[], edges?: string[]) => {
      dispatch(setSelection({ nodes, edges }));
    },
    [dispatch]
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
