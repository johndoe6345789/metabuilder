/**
 * useEditor Hook
 * Composite editor hook — wraps Redux editor state.
 * Provides zoom, pan, selection, and canvas management.
 */

'use client';

import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { editorSlice } from '@metabuilder/redux-slices';
import { useEditorZoom } from './useEditorZoom';
import { useEditorPan } from './useEditorPan';
import { useEditorSelection } from './useEditorSelection';
import type { UseEditorReturn } from './editorTypes';

export type { UseEditorReturn } from './editorTypes';

const { resetZoom, resetPan, setPan } = editorSlice.actions;

export function useEditor(): UseEditorReturn {
  const dispatch = useDispatch();
  const zoomHook = useEditorZoom();
  const panHook = useEditorPan();
  const selectionHook = useEditorSelection();

  const fitToScreen = useCallback(() => {
    dispatch(resetZoom());
    dispatch(resetPan());
  }, [dispatch]);

  const centerOnNode = useCallback(
    (
      nodeId: string,
      nodes: Array<{
        id: string;
        position: { x: number; y: number };
        width: number;
        height: number;
      }>
    ) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        dispatch(
          setPan({
            x:
              selectionHook.canvasSize.width / 2 -
              (node.position.x + node.width / 2),
            y:
              selectionHook.canvasSize.height / 2 -
              (node.position.y + node.height / 2),
          })
        );
      }
    },
    [dispatch, selectionHook.canvasSize]
  );

  return {
    ...zoomHook,
    ...panHook,
    ...selectionHook,
    fitToScreen,
    centerOnNode,
  };
}

export default useEditor;
