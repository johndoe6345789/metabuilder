/**
 * useEditorSelection Hook
 * Manages combined node and edge selection state and unified selection actions
 */

import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@metabuilder/redux-slices";
import {
  clearSelection,
  setSelection,
  setDrawing,
} from "@metabuilder/redux-slices/editorSlice";

export interface UseEditorSelectionReturn {
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  isDrawing: boolean;
  clearSelection: () => void;
  setSelection: (nodes?: string[], edges?: string[]) => void;
  setDrawing: (drawing: boolean) => void;
}

export function useEditorSelection(): UseEditorSelectionReturn {
  const dispatch = useDispatch();
  const selectedNodeIds = useSelector(
    (state: RootState) => state.editor.selectedNodes,
  );
  const selectedEdgeIds = useSelector(
    (state: RootState) => state.editor.selectedEdges,
  );
  const isDrawing = useSelector((state: RootState) => state.editor.isDrawing);
  const selectedNodes = useMemo(
    () => new Set(selectedNodeIds),
    [selectedNodeIds],
  );
  const selectedEdges = useMemo(
    () => new Set(selectedEdgeIds),
    [selectedEdgeIds],
  );

  const clearCurrentSelection = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const setCurrentSelection = useCallback(
    (nodes?: string[], edges?: string[]) => {
      dispatch(setSelection({ nodes, edges }));
    },
    [dispatch],
  );

  const setIsDrawing = useCallback(
    (drawing: boolean) => {
      dispatch(setDrawing(drawing));
    },
    [dispatch],
  );

  return {
    selectedNodes,
    selectedEdges,
    isDrawing,
    clearSelection: clearCurrentSelection,
    setSelection: setCurrentSelection,
    setDrawing: setIsDrawing,
  };
}

export default useEditorSelection;
