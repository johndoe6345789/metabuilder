/**
 * Redux Slice for Workspace Management
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workspace } from '../types/project';

export interface WorkspaceState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  currentWorkspaceId: null,
  isLoading: false,
  error: null
};

export const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    // Async state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Workspace list operations
    setWorkspaces: (state, action: PayloadAction<Workspace[]>) => {
      state.workspaces = action.payload;
      state.error = null;
    },

    addWorkspace: (state, action: PayloadAction<Workspace>) => {
      state.workspaces.push(action.payload);
      state.error = null;
    },

    updateWorkspace: (state, action: PayloadAction<Workspace>) => {
      const index = state.workspaces.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.workspaces[index] = action.payload;
      }
      state.error = null;
    },

    removeWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
      // Clear current workspace if it was deleted
      if (state.currentWorkspaceId === action.payload) {
        state.currentWorkspaceId = state.workspaces[0]?.id || null;
      }
      state.error = null;
    },

    // Current workspace selection
    setCurrentWorkspace: (state, action: PayloadAction<string | null>) => {
      state.currentWorkspaceId = action.payload;
    },

    // Batch operations
    clearWorkspaces: (state) => {
      state.workspaces = [];
      state.currentWorkspaceId = null;
      state.error = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setWorkspaces,
  addWorkspace,
  updateWorkspace,
  removeWorkspace,
  setCurrentWorkspace,
  clearWorkspaces
} = workspaceSlice.actions;

// Selectors
export const selectWorkspaces = (state: { workspace: WorkspaceState }) =>
  state.workspace.workspaces;

export const selectCurrentWorkspace = (state: { workspace: WorkspaceState }) => {
  if (!state.workspace.currentWorkspaceId) return null;
  return state.workspace.workspaces.find((w) => w.id === state.workspace.currentWorkspaceId);
};

export const selectCurrentWorkspaceId = (state: { workspace: WorkspaceState }) =>
  state.workspace.currentWorkspaceId;

export const selectWorkspaceIsLoading = (state: { workspace: WorkspaceState }) =>
  state.workspace.isLoading;

export const selectWorkspaceError = (state: { workspace: WorkspaceState }) =>
  state.workspace.error;

export default workspaceSlice.reducer;
