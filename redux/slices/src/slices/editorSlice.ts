/**
 * Editor Redux Slice
 * Manages canvas state: zoom, pan, selection, drawing
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface EditorState {
  zoom: number;
  pan: {
    x: number;
    y: number;
  };
  selectedNodes: Set<string>;
  selectedEdges: Set<string>;
  isDrawing: boolean;
  contextMenu: {
    visible: boolean;
    x: number;
    y: number;
    nodeId?: string;
  };
  canvasSize: {
    width: number;
    height: number;
  };
}

const initialState: EditorState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedNodes: new Set(),
  selectedEdges: new Set(),
  isDrawing: false,
  contextMenu: {
    visible: false,
    x: 0,
    y: 0
  },
  canvasSize: {
    width: 0,
    height: 0
  }
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    // Zoom management
    setZoom: (state, action: PayloadAction<number>) => {
      state.zoom = Math.max(0.1, Math.min(2, action.payload));
    },

    zoomIn: (state) => {
      state.zoom = Math.min(2, state.zoom + 0.1);
    },

    zoomOut: (state) => {
      state.zoom = Math.max(0.1, state.zoom - 0.1);
    },

    resetZoom: (state) => {
      state.zoom = 1;
    },

    // Pan management
    setPan: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
      }>
    ) => {
      state.pan = action.payload;
    },

    panBy: (
      state,
      action: PayloadAction<{
        dx: number;
        dy: number;
      }>
    ) => {
      state.pan.x += action.payload.dx;
      state.pan.y += action.payload.dy;
    },

    resetPan: (state) => {
      state.pan = { x: 0, y: 0 };
    },

    // Node selection
    selectNode: (state, action: PayloadAction<string>) => {
      state.selectedNodes = new Set([action.payload]);
    },

    addNodeToSelection: (state, action: PayloadAction<string>) => {
      state.selectedNodes.add(action.payload);
    },

    removeNodeFromSelection: (state, action: PayloadAction<string>) => {
      state.selectedNodes.delete(action.payload);
    },

    toggleNodeSelection: (state, action: PayloadAction<string>) => {
      if (state.selectedNodes.has(action.payload)) {
        state.selectedNodes.delete(action.payload);
      } else {
        state.selectedNodes.add(action.payload);
      }
    },

    clearSelection: (state) => {
      state.selectedNodes.clear();
      state.selectedEdges.clear();
    },

    setSelection: (
      state,
      action: PayloadAction<{
        nodes?: string[];
        edges?: string[];
      }>
    ) => {
      if (action.payload.nodes) {
        state.selectedNodes = new Set(action.payload.nodes);
      }
      if (action.payload.edges) {
        state.selectedEdges = new Set(action.payload.edges);
      }
    },

    // Edge selection
    selectEdge: (state, action: PayloadAction<string>) => {
      state.selectedEdges = new Set([action.payload]);
    },

    addEdgeToSelection: (state, action: PayloadAction<string>) => {
      state.selectedEdges.add(action.payload);
    },

    removeEdgeFromSelection: (state, action: PayloadAction<string>) => {
      state.selectedEdges.delete(action.payload);
    },

    // Drawing state
    setDrawing: (state, action: PayloadAction<boolean>) => {
      state.isDrawing = action.payload;
    },

    // Context menu
    showContextMenu: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
        nodeId?: string;
      }>
    ) => {
      state.contextMenu = {
        visible: true,
        ...action.payload
      };
    },

    hideContextMenu: (state) => {
      state.contextMenu.visible = false;
    },

    // Canvas size
    setCanvasSize: (
      state,
      action: PayloadAction<{
        width: number;
        height: number;
      }>
    ) => {
      state.canvasSize = action.payload;
    },

    // Reset
    resetEditor: (state) => {
      return initialState;
    }
  }
});

export const {
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
} = editorSlice.actions;

export default editorSlice.reducer;
