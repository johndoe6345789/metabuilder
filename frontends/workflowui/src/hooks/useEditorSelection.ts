/**
 * useEditorSelection - Node/edge selection from Redux editor slice
 * Composes useEditorEdgeSelection with node selection actions
 */

'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { editorSlice } from '@metabuilder/redux-slices';
import { useEditorEdgeSelection } from './useEditorEdgeSelection';

const {
  selectNode,
  addNodeToSelection,
  removeNodeFromSelection,
  toggleNodeSelection,
  clearSelection,
  setSelection,
  resetZoom,
  resetPan,
  setPan,
} = editorSlice.actions;

export function useEditorSelection() {
  const dispatch = useDispatch();
  const selectedNodes = useSelector(
    (s: RootState) => s.editor.selectedNodes
  );

  const edgeSelection = useEditorEdgeSelection();

  return {
    selectedNodes,
    ...edgeSelection,
    selectNode: useCallback(
      (id: string) => dispatch(selectNode(id)),
      [dispatch]
    ),
    addNodeToSelection: useCallback(
      (id: string) => dispatch(addNodeToSelection(id)),
      [dispatch]
    ),
    removeNodeFromSelection: useCallback(
      (id: string) => dispatch(removeNodeFromSelection(id)),
      [dispatch]
    ),
    toggleNodeSelection: useCallback(
      (id: string) => dispatch(toggleNodeSelection(id)),
      [dispatch]
    ),
    clearSelection: useCallback(
      () => dispatch(clearSelection()),
      [dispatch]
    ),
    setSelection: useCallback(
      (nodes?: string[], edges?: string[]) =>
        dispatch(setSelection({ nodes, edges })),
      [dispatch]
    ),
  };
}
