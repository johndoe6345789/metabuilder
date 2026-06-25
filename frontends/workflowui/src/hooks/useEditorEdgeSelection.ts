/**
 * useEditorEdgeSelection - Edge selection and drawing state from Redux
 */

'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { editorSlice } from '@metabuilder/redux-slices';

const {
  selectEdge,
  addEdgeToSelection,
  removeEdgeFromSelection,
  setDrawing,
  showContextMenu,
  hideContextMenu,
  setCanvasSize,
  resetEditor,
} = editorSlice.actions;

export function useEditorEdgeSelection() {
  const dispatch = useDispatch();
  const selectedEdges = useSelector(
    (s: RootState) => s.editor.selectedEdges
  );
  const isDrawing = useSelector(
    (s: RootState) => s.editor.isDrawing
  );
  const contextMenu = useSelector(
    (s: RootState) => s.editor.contextMenu
  );
  const canvasSize = useSelector(
    (s: RootState) => s.editor.canvasSize
  );

  return {
    selectedEdges,
    isDrawing,
    contextMenu,
    canvasSize,
    selectEdge: useCallback(
      (id: string) => dispatch(selectEdge(id)),
      [dispatch]
    ),
    addEdgeToSelection: useCallback(
      (id: string) => dispatch(addEdgeToSelection(id)),
      [dispatch]
    ),
    removeEdgeFromSelection: useCallback(
      (id: string) => dispatch(removeEdgeFromSelection(id)),
      [dispatch]
    ),
    setDrawing: useCallback(
      (v: boolean) => dispatch(setDrawing(v)),
      [dispatch]
    ),
    showContextMenu: useCallback(
      (x: number, y: number, nodeId?: string) =>
        dispatch(showContextMenu({ x, y, nodeId })),
      [dispatch]
    ),
    hideContextMenu: useCallback(
      () => dispatch(hideContextMenu()),
      [dispatch]
    ),
    setCanvasSize: useCallback(
      (w: number, h: number) =>
        dispatch(setCanvasSize({ width: w, height: h })),
      [dispatch]
    ),
    reset: useCallback(
      () => dispatch(resetEditor()),
      [dispatch]
    ),
  };
}
