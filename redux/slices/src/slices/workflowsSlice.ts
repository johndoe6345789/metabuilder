/**
 * Redux Slice for Workflow List Management
 * Manages the list of workflows (distinct from workflowSlice which manages a single open DAG)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workflow } from '../types/workflow';

export interface WorkflowsState {
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
}

const initialState: WorkflowsState = {
  workflows: [],
  isLoading: false,
  error: null,
};

export const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setWorkflows: (state, action: PayloadAction<Workflow[]>) => {
      state.workflows = action.payload;
      state.error = null;
    },

    addWorkflowToList: (state, action: PayloadAction<Workflow>) => {
      state.workflows.unshift(action.payload);
      state.error = null;
    },

    updateWorkflowInList: (state, action: PayloadAction<Workflow>) => {
      const index = state.workflows.findIndex((w) => w.id === action.payload.id);
      if (index !== -1) {
        state.workflows[index] = action.payload;
      }
      state.error = null;
    },

    removeWorkflowFromList: (state, action: PayloadAction<string>) => {
      state.workflows = state.workflows.filter((w) => w.id !== action.payload);
      state.error = null;
    },

    clearWorkflows: (state) => {
      state.workflows = [];
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  setWorkflows,
  addWorkflowToList,
  updateWorkflowInList,
  removeWorkflowFromList,
  clearWorkflows,
} = workflowsSlice.actions;

// Selectors
export const selectWorkflows = (state: { workflows: WorkflowsState }) =>
  state.workflows.workflows;

export const selectWorkflowsIsLoading = (state: { workflows: WorkflowsState }) =>
  state.workflows.isLoading;

export const selectWorkflowsError = (state: { workflows: WorkflowsState }) =>
  state.workflows.error;

export default workflowsSlice.reducer;
