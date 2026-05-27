/**
 * editorTypes - Return type interface for useEditor hook
 */

export interface UseEditorReturn {
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
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  setPan: (x: number, y: number) => void;
  panBy: (dx: number, dy: number) => void;
  resetPan: () => void;
  selectNode: (nodeId: string) => void;
  addNodeToSelection: (nodeId: string) => void;
  removeNodeFromSelection: (nodeId: string) => void;
  toggleNodeSelection: (nodeId: string) => void;
  clearSelection: () => void;
  setSelection: (
    nodes?: string[],
    edges?: string[]
  ) => void;
  selectEdge: (edgeId: string) => void;
  addEdgeToSelection: (edgeId: string) => void;
  removeEdgeFromSelection: (edgeId: string) => void;
  setDrawing: (isDrawing: boolean) => void;
  showContextMenu: (
    x: number,
    y: number,
    nodeId?: string
  ) => void;
  hideContextMenu: () => void;
  setCanvasSize: (width: number, height: number) => void;
  fitToScreen: () => void;
  centerOnNode: (
    nodeId: string,
    nodes: Array<{
      id: string;
      position: { x: number; y: number };
      width: number;
      height: number;
    }>
  ) => void;
  reset: () => void;
}
