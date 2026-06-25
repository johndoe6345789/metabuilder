/**
 * Connection Redux Slice
 * Manages connection drawing state and validation
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConnectionState {
  isActive: boolean;
  source: string | null;
  sourceHandle: string | null;
  target: string | null;
  targetHandle: string | null;
  currentPosition: {
    x: number;
    y: number;
  } | null;
  isValid: boolean;
  validationError: string | null;
}

const initialState: ConnectionState = {
  isActive: false,
  source: null,
  sourceHandle: null,
  target: null,
  targetHandle: null,
  currentPosition: null,
  isValid: true,
  validationError: null
};

export const connectionSlice = createSlice({
  name: 'connection',
  initialState,
  reducers: {
    // Connection lifecycle
    startConnection: (
      state,
      action: PayloadAction<{
        source: string;
        sourceHandle: string;
      }>
    ) => {
      state.isActive = true;
      state.source = action.payload.source;
      state.sourceHandle = action.payload.sourceHandle;
      state.target = null;
      state.targetHandle = null;
      state.isValid = true;
      state.validationError = null;
    },

    updateConnectionPosition: (
      state,
      action: PayloadAction<{
        x: number;
        y: number;
      }>
    ) => {
      state.currentPosition = action.payload;
    },

    validateConnection: (
      state,
      action: PayloadAction<{
        target: string;
        targetHandle: string;
        isValid: boolean;
        error?: string;
      }>
    ) => {
      state.target = action.payload.target;
      state.targetHandle = action.payload.targetHandle;
      state.isValid = action.payload.isValid;
      state.validationError = action.payload.error || null;
    },

    completeConnection: (state) => {
      state.isActive = false;
      state.currentPosition = null;
    },

    cancelConnection: (state) => {
      return initialState;
    },

    // Validation errors
    setValidationError: (state, action: PayloadAction<string | null>) => {
      state.validationError = action.payload;
      state.isValid = !action.payload;
    },

    // Reset
    resetConnection: (state) => {
      return initialState;
    }
  }
});

export const {
  startConnection,
  updateConnectionPosition,
  validateConnection,
  completeConnection,
  cancelConnection,
  setValidationError,
  resetConnection
} = connectionSlice.actions;

export default connectionSlice.reducer;
