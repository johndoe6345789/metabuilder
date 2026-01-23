/**
 * Redux Slice for Canvas Viewport State
 * Handles canvas zoom, pan, and interaction state
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectCanvasState, CanvasPosition } from '../types/project';

interface CanvasViewState {
  canvasState: ProjectCanvasState;
}

const initialCanvasState: ProjectCanvasState = {
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedItemIds: new Set<string>(),
  isDragging: false,
  isResizing: false,
  gridSnap: true,
  showGrid: true,
  snapSize: 20
};

const initialState: CanvasViewState = {
  canvasState: initialCanvasState
};

export const canvasSlice = createSlice({
  name: 'canvas',
  initialState,
  reducers: {
    setCanvasZoom: (state, action: PayloadAction<number>) => {
      state.canvasState.zoom = Math.max(0.1, Math.min(3, action.payload));
    },
    setCanvasPan: (state, action: PayloadAction<CanvasPosition>) => {
      state.canvasState.pan = action.payload;
    },
    panCanvas: (state, action: PayloadAction<CanvasPosition>) => {
      state.canvasState.pan.x += action.payload.x;
      state.canvasState.pan.y += action.payload.y;
    },
    resetCanvasView: (state) => {
      state.canvasState.zoom = 1;
      state.canvasState.pan = { x: 0, y: 0 };
    },
    selectCanvasItem: (state, action: PayloadAction<string>) => {
      state.canvasState.selectedItemIds.clear();
      state.canvasState.selectedItemIds.add(action.payload);
    },
    addToSelection: (state, action: PayloadAction<string>) => {
      state.canvasState.selectedItemIds.add(action.payload);
    },
    removeFromSelection: (state, action: PayloadAction<string>) => {
      state.canvasState.selectedItemIds.delete(action.payload);
    },
    toggleSelection: (state, action: PayloadAction<string>) => {
      if (state.canvasState.selectedItemIds.has(action.payload)) {
        state.canvasState.selectedItemIds.delete(action.payload);
      } else {
        state.canvasState.selectedItemIds.add(action.payload);
      }
    },
    setSelection: (state, action: PayloadAction<Set<string>>) => {
      state.canvasState.selectedItemIds = action.payload;
    },
    clearSelection: (state) => {
      state.canvasState.selectedItemIds.clear();
    },
    setDragging: (state, action: PayloadAction<boolean>) => {
      state.canvasState.isDragging = action.payload;
    },
    setResizing: (state, action: PayloadAction<boolean>) => {
      state.canvasState.isResizing = action.payload;
    },
    setGridSnap: (state, action: PayloadAction<boolean>) => {
      state.canvasState.gridSnap = action.payload;
    },
    setShowGrid: (state, action: PayloadAction<boolean>) => {
      state.canvasState.showGrid = action.payload;
    },
    setSnapSize: (state, action: PayloadAction<number>) => {
      state.canvasState.snapSize = Math.max(5, Math.min(100, action.payload));
    },
    resetCanvasState: (state) => {
      state.canvasState = initialCanvasState;
    }
  }
});

export const {
  setCanvasZoom,
  setCanvasPan,
  panCanvas,
  resetCanvasView,
  selectCanvasItem,
  addToSelection,
  removeFromSelection,
  toggleSelection,
  setSelection,
  clearSelection,
  setDragging,
  setResizing,
  setGridSnap,
  setShowGrid,
  setSnapSize,
  resetCanvasState
} = canvasSlice.actions;

const selectCanvasState = (state: { canvas: CanvasViewState }) => state.canvas.canvasState;
export const selectCanvasZoom = (state: { canvas: CanvasViewState }) => selectCanvasState(state).zoom;
export const selectCanvasPan = (state: { canvas: CanvasViewState }) => selectCanvasState(state).pan;
export const selectGridSnap = (state: { canvas: CanvasViewState }) => selectCanvasState(state).gridSnap;
export const selectShowGrid = (state: { canvas: CanvasViewState }) => selectCanvasState(state).showGrid;
export const selectSnapSize = (state: { canvas: CanvasViewState }) => selectCanvasState(state).snapSize;
export const selectIsDragging = (state: { canvas: CanvasViewState }) => selectCanvasState(state).isDragging;
export const selectIsResizing = (state: { canvas: CanvasViewState }) => selectCanvasState(state).isResizing;
export const selectSelectedItemIds = (state: { canvas: CanvasViewState }) => selectCanvasState(state).selectedItemIds;

export default canvasSlice.reducer;
