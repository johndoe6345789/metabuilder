/**
 * useEditorEdges Hook
 * Manages editor edge/connection selection state and edge-related actions
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  selectEdge,
  addEdgeToSelection,
  removeEdgeFromSelection,
  clearSelection,
  setSelection
} from '@metabuilder/redux-slices/editorSlice';

export interface UseEditorEdgesReturn {
  selectedEdges: Set<string>;
  selectEdge: (edgeId: string) => void;
  addEdgeToSelection: (edgeId: string) => void;
  removeEdgeFromSelection: (edgeId: string) => void;
  clearSelection: () => void;
  setEdgeSelection: (edges: string[], nodes?: string[]) => void;
}

export function useEditorEdges(): UseEditorEdgesReturn {
  const dispatch = useDispatch();
  const selectedEdges = useSelector((state: RootState) => state.editor.selectedEdges);

  const selectEdgeAction = useCallback(
    (edgeId: string) => {
      dispatch(selectEdge(edgeId));
    },
    [dispatch]
  );

  const addToEdgeSelection = useCallback(
    (edgeId: string) => {
      dispatch(addEdgeToSelection(edgeId));
    },
    [dispatch]
  );

  const removeFromEdgeSelection = useCallback(
    (edgeId: string) => {
      dispatch(removeEdgeFromSelection(edgeId));
    },
    [dispatch]
  );

  const clearEdgeSelection = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const setEdgeSelection = useCallback(
    (edges: string[], nodes?: string[]) => {
      dispatch(setSelection({ nodes, edges }));
    },
    [dispatch]
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
