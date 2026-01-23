/**
 * useEditor Hook
 * Hook for canvas/editor state management
 */

import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@store/store';
import {
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
  resetEditor
} from '@store/slices/editorSlice';

export function useEditor() {
  const dispatch = useDispatch();

  // Selectors
  const zoom = useSelector((state: RootState) => state.editor.zoom);
  const pan = useSelector((state: RootState) => state.editor.pan);
  const selectedNodes = useSelector((state: RootState) => state.editor.selectedNodes);
  const selectedEdges = useSelector((state: RootState) => state.editor.selectedEdges);
  const isDrawing = useSelector((state: RootState) => state.editor.isDrawing);
  const contextMenu = useSelector((state: RootState) => state.editor.contextMenu);
  const canvasSize = useSelector((state: RootState) => state.editor.canvasSize);

  // Zoom actions
  const setCurrentZoom = useCallback(
    (newZoom: number) => {
      dispatch(setZoom(newZoom));
    },
    [dispatch]
  );

  const zoomInCanvas = useCallback(() => {
    dispatch(zoomIn());
  }, [dispatch]);

  const zoomOutCanvas = useCallback(() => {
    dispatch(zoomOut());
  }, [dispatch]);

  const resetCanvasZoom = useCallback(() => {
    dispatch(resetZoom());
  }, [dispatch]);

  // Pan actions
  const setPanPosition = useCallback(
    (x: number, y: number) => {
      dispatch(setPan({ x, y }));
    },
    [dispatch]
  );

  const panCanvas = useCallback(
    (dx: number, dy: number) => {
      dispatch(panBy({ dx, dy }));
    },
    [dispatch]
  );

  const resetCanvasPan = useCallback(() => {
    dispatch(resetPan());
  }, [dispatch]);

  // Selection actions
  const selectSingleNode = useCallback(
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

  const clearCurrentSelection = useCallback(() => {
    dispatch(clearSelection());
  }, [dispatch]);

  const setCurrentSelection = useCallback(
    (nodes?: string[], edges?: string[]) => {
      dispatch(setSelection({ nodes, edges }));
    },
    [dispatch]
  );

  // Edge selection actions
  const selectSingleEdge = useCallback(
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

  // Drawing actions
  const setIsDrawing = useCallback(
    (drawing: boolean) => {
      dispatch(setDrawing(drawing));
    },
    [dispatch]
  );

  // Context menu actions
  const showMenu = useCallback(
    (x: number, y: number, nodeId?: string) => {
      dispatch(showContextMenu({ x, y, nodeId }));
    },
    [dispatch]
  );

  const hideMenu = useCallback(() => {
    dispatch(hideContextMenu());
  }, [dispatch]
  );

  // Canvas size actions
  const setSize = useCallback(
    (width: number, height: number) => {
      dispatch(setCanvasSize({ width, height }));
    },
    [dispatch]
  );

  // Reset all editor state
  const reset = useCallback(() => {
    dispatch(resetEditor());
  }, [dispatch]);

  // Utility: Fit all nodes in view
  const fitToScreen = useCallback(() => {
    // This would typically calculate bounds and set zoom/pan accordingly
    // For now, reset to default
    resetCanvasZoom();
    resetCanvasPan();
  }, [resetCanvasZoom, resetCanvasPan]);

  // Utility: Center view on node
  const centerOnNode = useCallback(
    (nodeId: string, nodes: any[]) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        setPanPosition(
          canvasSize.width / 2 - (node.position.x + node.width / 2),
          canvasSize.height / 2 - (node.position.y + node.height / 2)
        );
      }
    },
    [canvasSize, setPanPosition]
  );

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
    setZoom: setCurrentZoom,
    zoomIn: zoomInCanvas,
    zoomOut: zoomOutCanvas,
    resetZoom: resetCanvasZoom,

    // Pan actions
    setPan: setPanPosition,
    pan: panCanvas,
    resetPan: resetCanvasPan,

    // Selection actions
    selectNode: selectSingleNode,
    addNodeToSelection: addToNodeSelection,
    removeNodeFromSelection: removeFromNodeSelection,
    toggleNodeSelection: toggleNode,
    clearSelection: clearCurrentSelection,
    setSelection: setCurrentSelection,

    // Edge selection actions
    selectEdge: selectSingleEdge,
    addEdgeToSelection: addToEdgeSelection,
    removeEdgeFromSelection: removeFromEdgeSelection,

    // Drawing actions
    setDrawing: setIsDrawing,

    // Context menu actions
    showContextMenu: showMenu,
    hideContextMenu: hideMenu,

    // Canvas actions
    setCanvasSize: setSize,
    fitToScreen,
    centerOnNode,

    // Reset
    reset
  };
}
