/**
 * useEditor Hook
 *
 * Local editor hook for workflowui that provides zoom, pan, and selection
 * functionality using the editorSlice from @metabuilder/redux-slices.
 *
 * This hook wraps Redux state and actions to provide a simple interface
 * for editor components like ViewToolbar.
 */

'use client';

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  editorSlice,
} from '@metabuilder/redux-slices';

const {
  setZoom,
  zoomIn,
  zoomOut,
  resetZoom,
  setPan,
  panBy,
  resetPan,
  selectNode,
  addNodeToSelection,
  removeNodeFromSelection,
  toggleNodeSelection,
  clearSelection,
  setSelection,
  selectEdge,
  addEdgeToSelection,
  removeEdgeFromSelection,
  setDrawing,
  showContextMenu,
  hideContextMenu,
  setCanvasSize,
  resetEditor,
} = editorSlice.actions;

export interface UseEditorReturn {
  // State
  zoom: number;
  pan: { x: number; y: number };
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  isDrawing: boolean;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    nodeId?: string;
  };
  canvasSize: { width: number; height: number };

  // Zoom actions
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  // Pan actions
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  resetPan: () => void;

  // Node selection actions
  selectNode: (nodeId: string) => void;
  addNodeToSelection: (nodeId: string) => void;
  removeNodeFromSelection: (nodeId: string) => void;
  toggleNodeSelection: (nodeId: string) => void;
  clearSelection: () => void;
  setSelection: (nodes?: string[], edges?: string[]) => void;

  // Edge selection actions
  selectEdge: (edgeId: string) => void;
  addEdgeToSelection: (edgeId: string) => void;
  removeEdgeFromSelection: (edgeId: string) => void;

  // Drawing state
  setDrawing: (isDrawing: boolean) => void;

  // Context menu actions
  showContextMenu: (x: number, y: number, nodeId?: string) => void;
  hideContextMenu: () => void;

  // Canvas actions
  setCanvasSize: (width: number, height: number) => void;
  fitToScreen: () => void;
  centerOnNode: (nodeId: string, nodes: Array<{ id: string; position: { x: number; y: number }; width: number; height: number }>) => void;

  // Reset
  reset: () => void;
}

export function useEditor(): UseEditorReturn {
  const dispatch = useDispatch();

  // Select state from Redux
  const zoom = useSelector((state: RootState) => state.editor.zoom);
  const pan = useSelector((state: RootState) => state.editor.pan);
  const selectedNodes = useSelector((state: RootState) => state.editor.selectedNodes);
  const selectedEdges = useSelector((state: RootState) => state.editor.selectedEdges);
  const isDrawing = useSelector((state: RootState) => state.editor.isDrawing);
  const contextMenu = useSelector((state: RootState) => state.editor.contextMenu);
  const canvasSize = useSelector((state: RootState) => state.editor.canvasSize);

  // Zoom actions
  const setZoomAction = useCallback(
    (newZoom: number) => {
      dispatch(setZoom(newZoom));
    },
    [dispatch]
  );

  const zoomInAction = useCallback(() => {
    dispatch(zoomIn());
  }, [dispatch]);

  const zoomOutAction = useCallback(() => {
    dispatch(zoomOut());
  }, [dispatch]);

  const resetZoomAction = useCallback(() => {
    dispatch(resetZoom());
  }, [dispatch]);

  // Pan actions
  const setPanAction = useCallback(
    (x: number, y: number) => {
      dispatch(setPan({ x, y }));
    },
    [dispatch]
  );

  const panByAction = useCallback(
    (dx: number, dy: number) => {
      dispatch(panBy({ dx, dy }));
    },
    [dispatch]
  );

  const resetPanAction = useCallback(() => {
    dispatch(resetPan());
  }, [dispatch]);

  // Node selection actions
  const selectNodeAction = useCallback(
    (nodeId: string) => {
      dispatch(selectNode(nodeId));
    },
    [dispatch]
  );

  const addNodeToSelectionAction = useCallback(
    (nodeId: string) => {
      dispatch(addNodeToSelection(nodeId));
    },
    [dispatch]
  );

  const removeNodeFromSelectionAction = useCallback(
    (nodeId: string) => {
      dispatch(removeNodeFromSelection(nodeId));
    },
    [dispatch]
  );

  const toggleNodeSelectionAction = useCallback(
    (nodeId: string) => {
      dispatch(toggleNodeSelection(nodeId));
    },
    [dispatch]
  );

  const clearSelectionAction = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const setSelectionAction = useCallback(
    (nodes?: string[], edges?: string[]) => {
      dispatch(setSelection({ nodes, edges }));
    },
    [dispatch]
  );

  // Edge selection actions
  const selectEdgeAction = useCallback(
    (edgeId: string) => {
      dispatch(selectEdge(edgeId));
    },
    [dispatch]
  );

  const addEdgeToSelectionAction = useCallback(
    (edgeId: string) => {
      dispatch(addEdgeToSelection(edgeId));
    },
    [dispatch]
  );

  const removeEdgeFromSelectionAction = useCallback(
    (edgeId: string) => {
      dispatch(removeEdgeFromSelection(edgeId));
    },
    [dispatch]
  );

  // Drawing state
  const setDrawingAction = useCallback(
    (drawing: boolean) => {
      dispatch(setDrawing(drawing));
    },
    [dispatch]
  );

  // Context menu actions
  const showContextMenuAction = useCallback(
    (x: number, y: number, nodeId?: string) => {
      dispatch(showContextMenu({ x, y, nodeId }));
    },
    [dispatch]
  );

  const hideContextMenuAction = useCallback(() => {
    dispatch(hideContextMenu());
  }, [dispatch]);

  // Canvas actions
  const setCanvasSizeAction = useCallback(
    (width: number, height: number) => {
      dispatch(setCanvasSize({ width, height }));
    },
    [dispatch]
  );

  const fitToScreen = useCallback(() => {
    dispatch(resetZoom());
    dispatch(resetPan());
  }, [dispatch]);

  const centerOnNode = useCallback(
    (nodeId: string, nodes: Array<{ id: string; position: { x: number; y: number }; width: number; height: number }>) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        dispatch(
          setPan({
            x: canvasSize.width / 2 - (node.position.x + node.width / 2),
            y: canvasSize.height / 2 - (node.position.y + node.height / 2),
          })
        );
      }
    },
    [dispatch, canvasSize]
  );

  // Reset
  const reset = useCallback(() => {
    dispatch(resetEditor());
  }, [dispatch]);

  return {
    // State
    zoom,
    pan,
    selectedNodes,
    selectedEdges,
    isDrawing,
    contextMenu,
    canvasSize,

    // Zoom actions
    setZoom: setZoomAction,
    zoomIn: zoomInAction,
    zoomOut: zoomOutAction,
    resetZoom: resetZoomAction,

    // Pan actions
    setPan: setPanAction,
    panBy: panByAction,
    resetPan: resetPanAction,

    // Node selection actions
    selectNode: selectNodeAction,
    addNodeToSelection: addNodeToSelectionAction,
    removeNodeFromSelection: removeNodeFromSelectionAction,
    toggleNodeSelection: toggleNodeSelectionAction,
    clearSelection: clearSelectionAction,
    setSelection: setSelectionAction,

    // Edge selection actions
    selectEdge: selectEdgeAction,
    addEdgeToSelection: addEdgeToSelectionAction,
    removeEdgeFromSelection: removeEdgeFromSelectionAction,

    // Drawing state
    setDrawing: setDrawingAction,

    // Context menu actions
    showContextMenu: showContextMenuAction,
    hideContextMenu: hideContextMenuAction,

    // Canvas actions
    setCanvasSize: setCanvasSizeAction,
    fitToScreen,
    centerOnNode,

    // Reset
    reset,
  };
}

export default useEditor;
