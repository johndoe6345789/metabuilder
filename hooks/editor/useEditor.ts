/**
 * useEditor Hook (Composition)
 * Composes all focused editor hooks into a single interface
 * Provides backward-compatible API with original useEditor
 *
 * Note: This hook requires Redux store with editor slice.
 * Import paths should be configured by the consuming application.
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useEditorZoom, UseEditorZoomReturn, UseEditorZoomOptions } from './useEditorZoom';
import { useEditorPan, UseEditorPanReturn, UseEditorPanOptions } from './useEditorPan';
import { useEditorNodes, UseEditorNodesReturn, UseEditorNodesOptions } from './useEditorNodes';
import { useEditorEdges, UseEditorEdgesReturn, UseEditorEdgesOptions } from './useEditorEdges';
import { useEditorSelection, UseEditorSelectionReturn, UseEditorSelectionOptions } from './useEditorSelection';
import { useEditorClipboard, UseEditorClipboardReturn } from './useEditorClipboard';
import { useEditorHistory, UseEditorHistoryReturn } from './useEditorHistory';

// Type for the editor state slice
export interface EditorState {
  zoom: number;
  pan: { x: number; y: number };
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  isDrawing: boolean;
  contextMenu: any;
  canvasSize: { width: number; height: number };
}

// Type for the root state (to be extended by consuming app)
export interface RootState {
  editor: EditorState;
}

// Action creators - these should be imported from the app's editorSlice
export interface EditorActions {
  // Zoom actions
  setZoom: (zoom: number) => any;
  zoomIn: () => any;
  zoomOut: () => any;
  resetZoom: () => any;
  // Pan actions
  setPan: (payload: { x: number; y: number }) => any;
  panBy: (payload: { dx: number; dy: number }) => any;
  resetPan: () => any;
  // Node actions
  selectNode: (nodeId: string) => any;
  addNodeToSelection: (nodeId: string) => any;
  removeNodeFromSelection: (nodeId: string) => any;
  toggleNodeSelection: (nodeId: string) => any;
  // Edge actions
  selectEdge: (edgeId: string) => any;
  addEdgeToSelection: (edgeId: string) => any;
  removeEdgeFromSelection: (edgeId: string) => any;
  // Selection actions
  clearSelection: () => any;
  setSelection: (payload: { nodes?: string[]; edges?: string[] }) => any;
  setDrawing: (drawing: boolean) => any;
  // Context menu actions
  showContextMenu: (payload: { x: number; y: number; nodeId?: string }) => any;
  hideContextMenu: () => any;
  // Canvas actions
  setCanvasSize: (payload: { width: number; height: number }) => any;
  resetEditor: () => any;
}

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

export interface UseEditorOptions {
  actions: EditorActions;
}

export function useEditor(options: UseEditorOptions): UseEditorReturn {
  const { actions } = options;
  const dispatch = useDispatch();

  // Compose all hooks
  const zoomHook = useEditorZoom({ actions });
  const panHook = useEditorPan({ actions });
  const nodesHook = useEditorNodes({ actions });
  const edgesHook = useEditorEdges({ actions });
  const selectionHook = useEditorSelection({ actions });
  const clipboardHook = useEditorClipboard();
  const historyHook = useEditorHistory();

  // Selectors for state not in composed hooks
  const contextMenu = useSelector((state: RootState) => state.editor.contextMenu);
  const canvasSize = useSelector((state: RootState) => state.editor.canvasSize);

  // Context menu actions
  const showMenu = useCallback(
    (x: number, y: number, nodeId?: string) => {
      dispatch(actions.showContextMenu({ x, y, nodeId }));
    },
    [dispatch, actions]
  );

  const hideMenu = useCallback(() => {
    dispatch(actions.hideContextMenu());
  }, [dispatch, actions]);

  // Canvas actions
  const setSize = useCallback(
    (width: number, height: number) => {
      dispatch(actions.setCanvasSize({ width, height }));
    },
    [dispatch, actions]
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
    dispatch(actions.resetEditor());
  }, [dispatch, actions]);

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
