/**
 * Workflow Redux Slice
 * Manages workflow state: metadata, nodes, connections, execution
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Workflow, WorkflowNode, WorkflowConnection, ExecutionResult } from '../types/workflow';

export interface WorkflowState {
  current: Workflow | null;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  isDirty: boolean;
  isSaving: boolean;
  saveError: string | null;
  executionHistory: ExecutionResult[];
  currentExecution: ExecutionResult | null;
  lastSaved: number | null;
}

const initialState: WorkflowState = {
  current: null,
  nodes: [],
  connections: [],
  isDirty: false,
  isSaving: false,
  saveError: null,
  executionHistory: [],
  currentExecution: null,
  lastSaved: null
};

/**
 * Workflow slice managing workflow data
 */
export const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    // Workflow lifecycle
    loadWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.current = action.payload;
      state.nodes = action.payload.nodes || [];
      state.connections = action.payload.connections || [];
      state.isDirty = false;
      state.lastSaved = Date.now();
    },

    createWorkflow: (state, action: PayloadAction<Partial<Workflow>>) => {
      state.current = {
        id: action.payload.id || `workflow-${Date.now()}`,
        name: action.payload.name || 'Untitled Workflow',
        version: '1.0.0',
        tenantId: action.payload.tenantId || 'default',
        nodes: [],
        connections: [],
        description: action.payload.description || '',
        tags: action.payload.tags || [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        ...action.payload
      };
      state.nodes = [];
      state.connections = [];
      state.isDirty = true;
    },

    saveWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.current = action.payload;
      state.isDirty = false;
      state.isSaving = false;
      state.lastSaved = Date.now();
      state.saveError = null;
    },

    // Node management
    addNode: (state, action: PayloadAction<WorkflowNode>) => {
      state.nodes.push(action.payload);
      state.isDirty = true;
    },

    updateNode: (state, action: PayloadAction<{ id: string; data: Partial<WorkflowNode> }>) => {
      const index = state.nodes.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.nodes[index] = { ...state.nodes[index], ...action.payload.data };
        state.isDirty = true;
      }
    },

    deleteNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter((n) => n.id !== action.payload);
      state.connections = state.connections.filter(
        (c) => c.source !== action.payload && c.target !== action.payload
      );
      state.isDirty = true;
    },

    // Connection management
    addConnection: (state, action: PayloadAction<WorkflowConnection>) => {
      const exists = state.connections.some(
        (c) => c.source === action.payload.source && c.target === action.payload.target
      );
      if (!exists) {
        state.connections.push(action.payload);
        state.isDirty = true;
      }
    },

    removeConnection: (state, action: PayloadAction<{ source: string; target: string }>) => {
      state.connections = state.connections.filter(
        (c) => !(c.source === action.payload.source && c.target === action.payload.target)
      );
      state.isDirty = true;
    },

    updateConnections: (state, action: PayloadAction<WorkflowConnection[]>) => {
      state.connections = action.payload;
      state.isDirty = true;
    },

    // Batch operations
    setNodesAndConnections: (
      state,
      action: PayloadAction<{ nodes: WorkflowNode[]; connections: WorkflowConnection[] }>
    ) => {
      state.nodes = action.payload.nodes;
      state.connections = action.payload.connections;
      state.isDirty = true;
    },

    // Execution
    startExecution: (state, action: PayloadAction<ExecutionResult>) => {
      state.currentExecution = action.payload;
    },

    endExecution: (state, action: PayloadAction<ExecutionResult>) => {
      state.currentExecution = null;
      state.executionHistory.unshift(action.payload);
      // Keep last 50 executions
      if (state.executionHistory.length > 50) {
        state.executionHistory.pop();
      }
    },

    clearExecutionHistory: (state) => {
      state.executionHistory = [];
      state.currentExecution = null;
    },

    // UI state
    setSaving: (state, action: PayloadAction<boolean>) => {
      state.isSaving = action.payload;
    },

    setSaveError: (state, action: PayloadAction<string | null>) => {
      state.saveError = action.payload;
      state.isSaving = false;
    },

    setDirty: (state, action: PayloadAction<boolean>) => {
      state.isDirty = action.payload;
    },

    // Reset
    resetWorkflow: (state) => {
      return initialState;
    }
  }
});

export const {
  loadWorkflow,
  createWorkflow,
  saveWorkflow,
  addNode,
  updateNode,
  deleteNode,
  addConnection,
  removeConnection,
  updateConnections,
  setNodesAndConnections,
  startExecution,
  endExecution,
  clearExecutionHistory,
  setSaving,
  setSaveError,
  setDirty,
  resetWorkflow
} = workflowSlice.actions;

export default workflowSlice.reducer;

// Selectors
export const selectCurrentWorkflow = (state: { workflow: WorkflowState }) => state.workflow.current;
export const selectWorkflowNodes = (state: { workflow: WorkflowState }) => state.workflow.nodes;
export const selectWorkflowConnections = (state: { workflow: WorkflowState }) => state.workflow.connections;
export const selectWorkflowIsDirty = (state: { workflow: WorkflowState }) => state.workflow.isDirty;
export const selectWorkflowIsSaving = (state: { workflow: WorkflowState }) => state.workflow.isSaving;
export const selectCurrentExecution = (state: { workflow: WorkflowState }) => state.workflow.currentExecution;
export const selectExecutionHistory = (state: { workflow: WorkflowState }) => state.workflow.executionHistory;
export const selectLastSaved = (state: { workflow: WorkflowState }) => state.workflow.lastSaved;
export const selectSaveError = (state: { workflow: WorkflowState }) => state.workflow.saveError;
