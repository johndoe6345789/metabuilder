/**
 * useEditor Hook (Composition)
 * Composes all focused editor hooks into a single interface
 * Provides backward-compatible API with original useEditor
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@metabuilder/redux-slices';
import {
  showContextMenu,
  hideContextMenu,
  setCanvasSize,
  resetEditor
} from '@metabuilder/redux-slices/editorSlice';
import { useEditorZoom, UseEditorZoomReturn } from './useEditorZoom';
import { useEditorPan, UseEditorPanReturn } from './useEditorPan';
import { useEditorNodes, UseEditorNodesReturn } from './useEditorNodes';
import { useEditorEdges, UseEditorEdgesReturn } from './useEditorEdges';
import { useEditorSelection, UseEditorSelectionReturn } from './useEditorSelection';
import { useEditorClipboard, UseEditorClipboardReturn } from './useEditorClipboard';
import { useEditorHistory, UseEditorHistoryReturn } from './useEditorHistory';

export interface UseEditorReturn {
  // Composed hooks for fine-grained usage
  zoomHook: UseEditorZoomReturn;
  panHook: UseEditorPanReturn;
  nodesHook: UseEditorNodesReturn;
  edgesHook: UseEditorEdgesReturn;
  selectionHook: UseEditorSelectionReturn;
  clipboardHook: UseEditorClipboardReturn;
  historyHook: UseEditorHistoryReturn;

  // Backward compatible flattened state
  zoom: number;
  pan: { x: number; y: number };
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  isDrawing: boolean;
  contextMenu: any;
  canvasSize: { width: number; height: number };

  // Zoom methods (flattened from zoomHook)
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setZoom: (zoom: number) => void;

  // Pan methods (flattened from panHook)
  setPan: (x: number, y: number) => void;
  resetPan: () => void;

  // Context menu actions
  showContextMenu: (x: number, y: number, nodeId?: string) => void;
  hideContextMenu: () => void;

  // Canvas actions
  setCanvasSize: (width: number, height: number) => void;
  fitToScreen: () => void;
  centerOnNode: (nodeId: string, nodes: any[]) => void;

  // Reset
  reset: () => void;
}

export function useEditor(): UseEditorReturn {
  const dispatch = useDispatch();

  // Compose all hooks
  const zoomHook = useEditorZoom();
  const panHook = useEditorPan();
  const nodesHook = useEditorNodes();
  const edgesHook = useEditorEdges();
  const selectionHook = useEditorSelection();
  const clipboardHook = useEditorClipboard();
  const historyHook = useEditorHistory();

  // Selectors for state not in composed hooks
  const contextMenu = useSelector((state: RootState) => state.editor.contextMenu);
  const canvasSize = useSelector((state: RootState) => state.editor.canvasSize);

  // Context menu actions
  const showMenu = useCallback(
    (x: number, y: number, nodeId?: string) => {
      dispatch(showContextMenu({ x, y, nodeId }));
    },
    [dispatch]
  );

  const hideMenu = useCallback(() => {
    dispatch(hideContextMenu());
  }, [dispatch]);

  // Canvas actions
  const setSize = useCallback(
    (width: number, height: number) => {
      dispatch(setCanvasSize({ width, height }));
    },
    [dispatch]
  );

  const fitToScreen = useCallback(() => {
    zoomHook.resetZoom();
    panHook.resetPan();
  }, [zoomHook, panHook]);

  const centerOnNode = useCallback(
    (nodeId: string, nodes: any[]) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        panHook.setPan(
          canvasSize.width / 2 - (node.position.x + node.width / 2),
          canvasSize.height / 2 - (node.position.y + node.height / 2)
        );
      }
    },
    [canvasSize, panHook]
  );

  // Reset
  const reset = useCallback(() => {
    dispatch(resetEditor());
  }, [dispatch]);

  return {
    // Composed hooks
    zoomHook,
    panHook,
    nodesHook,
    edgesHook,
    selectionHook,
    clipboardHook,
    historyHook,

    // Backward compatible flattened state
    zoom: zoomHook.zoom,
    pan: panHook.pan,
    selectedNodes: nodesHook.selectedNodes,
    selectedEdges: edgesHook.selectedEdges,
    isDrawing: selectionHook.isDrawing,
    contextMenu,
    canvasSize,

    // Zoom methods (flattened)
    zoomIn: zoomHook.zoomIn,
    zoomOut: zoomHook.zoomOut,
    resetZoom: zoomHook.resetZoom,
    setZoom: zoomHook.setZoom,

    // Pan methods (flattened)
    setPan: panHook.setPan,
    resetPan: panHook.resetPan,

    // Context menu
    showContextMenu: showMenu,
    hideContextMenu: hideMenu,

    // Canvas
    setCanvasSize: setSize,
    fitToScreen,
    centerOnNode,

    // Reset
    reset
  };
}

export default useEditor;
