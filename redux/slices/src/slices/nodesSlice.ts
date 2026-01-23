/**
 * Nodes Redux Slice
 * Manages node registry and available node types
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NodeType, NodeTemplate } from '../types/workflow';

export interface NodesState {
  registry: NodeType[];
  templates: NodeTemplate[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: NodesState = {
  registry: [],
  templates: [],
  categories: [],
  isLoading: false,
  error: null
};

export const nodesSlice = createSlice({
  name: 'nodes',
  initialState,
  reducers: {
    // Registry management
    setRegistry: (state, action: PayloadAction<NodeType[]>) => {
      state.registry = action.payload;
      // Extract unique categories
      state.categories = Array.from(new Set(action.payload.map((n) => n.category)));
      state.error = null;
    },

    addNodeType: (state, action: PayloadAction<NodeType>) => {
      const exists = state.registry.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.registry.push(action.payload);
        if (!state.categories.includes(action.payload.category)) {
          state.categories.push(action.payload.category);
        }
      }
    },

    removeNodeType: (state, action: PayloadAction<string>) => {
      state.registry = state.registry.filter((n) => n.id !== action.payload);
    },

    // Templates management
    setTemplates: (state, action: PayloadAction<NodeTemplate[]>) => {
      state.templates = action.payload;
    },

    addTemplate: (state, action: PayloadAction<NodeTemplate>) => {
      state.templates.push(action.payload);
    },

    removeTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter((t) => t.id !== action.payload);
    },

    updateTemplate: (
      state,
      action: PayloadAction<{
        id: string;
        data: Partial<NodeTemplate>;
      }>
    ) => {
      const index = state.templates.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.templates[index] = {
          ...state.templates[index],
          ...action.payload.data
        };
      }
    },

    // Categories
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },

    // Loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset
    resetNodes: (state) => {
      return initialState;
    }
  }
});

export const {
  setRegistry,
  addNodeType,
  removeNodeType,
  setTemplates,
  addTemplate,
  removeTemplate,
  updateTemplate,
  setCategories,
  setLoading,
  setError,
  resetNodes
} = nodesSlice.actions;

export default nodesSlice.reducer;
