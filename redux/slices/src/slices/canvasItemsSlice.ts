/**
 * Redux Slice for Canvas Items Management
 * Handles canvas item CRUD operations and bulk updates
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectCanvasItem } from '../types/project';

interface CanvasItemsState {
  canvasItems: ProjectCanvasItem[];
}

const initialState: CanvasItemsState = {
  canvasItems: []
};

export const canvasItemsSlice = createSlice({
  name: 'canvasItems',
  initialState,
  reducers: {
    // Canvas items operations
    setCanvasItems: (state, action: PayloadAction<ProjectCanvasItem[]>) => {
      state.canvasItems = action.payload;
    },

    addCanvasItem: (state, action: PayloadAction<ProjectCanvasItem>) => {
      state.canvasItems.push(action.payload);
    },

    updateCanvasItem: (state, action: PayloadAction<Partial<ProjectCanvasItem> & { id: string }>) => {
      const index = state.canvasItems.findIndex((i) => i.id === action.payload.id);
      if (index !== -1) {
        state.canvasItems[index] = {
          ...state.canvasItems[index],
          ...action.payload
        };
      }
    },

    removeCanvasItem: (state, action: PayloadAction<string>) => {
      state.canvasItems = state.canvasItems.filter((i) => i.id !== action.payload);
    },

    bulkUpdateCanvasItems: (state, action: PayloadAction<Array<Partial<ProjectCanvasItem> & { id: string }>>) => {
      action.payload.forEach((update) => {
        const index = state.canvasItems.findIndex((i) => i.id === update.id);
        if (index !== -1) {
          state.canvasItems[index] = {
            ...state.canvasItems[index],
            ...update
          };
        }
      });
    },

    deleteCanvasItems: (state, action: PayloadAction<string[]>) => {
      const idsToDelete = new Set(action.payload);
      state.canvasItems = state.canvasItems.filter((i) => !idsToDelete.has(i.id));
    },

    duplicateCanvasItems: (state, action: PayloadAction<string[]>) => {
      const idsToDuplicate = new Set(action.payload);
      const itemsToDuplicate = state.canvasItems.filter((i) => idsToDuplicate.has(i.id));
      const newItems = itemsToDuplicate.map((item) => ({
        ...item,
        id: `${item.id}-copy-${Date.now()}`,
        position: {
          x: item.position.x + 20,
          y: item.position.y + 20
        }
      }));
      state.canvasItems.push(...newItems);
    },

    applyAutoLayout: (state, action: PayloadAction<Array<Partial<ProjectCanvasItem> & { id: string }>>) => {
      action.payload.forEach((update) => {
        const index = state.canvasItems.findIndex((i) => i.id === update.id);
        if (index !== -1 && update.position) {
          state.canvasItems[index].position = update.position;
        }
      });
    },

    // Reset
    clearCanvasItems: (state) => {
      state.canvasItems = [];
    }
  }
});

export const {
  setCanvasItems,
  addCanvasItem,
  updateCanvasItem,
  removeCanvasItem,
  bulkUpdateCanvasItems,
  deleteCanvasItems,
  duplicateCanvasItems,
  applyAutoLayout,
  clearCanvasItems
} = canvasItemsSlice.actions;

// Selectors
export const selectCanvasItems = (state: { canvasItems: CanvasItemsState }) =>
  state.canvasItems.canvasItems;

export const selectCanvasItemCount = (state: { canvasItems: CanvasItemsState }) =>
  state.canvasItems.canvasItems.length;

export const selectCanvasItemById = (state: { canvasItems: CanvasItemsState }, itemId: string) =>
  state.canvasItems.canvasItems.find((item) => item.id === itemId);

export const selectCanvasItemsByIds = (state: { canvasItems: CanvasItemsState }, itemIds: string[]) => {
  const idSet = new Set(itemIds);
  return state.canvasItems.canvasItems.filter((item) => idSet.has(item.id));
};

export default canvasItemsSlice.reducer;
