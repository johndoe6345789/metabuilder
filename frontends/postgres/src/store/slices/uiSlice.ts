import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  columnPanelWidth: number;
  indexPanelWidth: number;
  constraintPanelWidth: number;
  columnWidths: Record<string, number[]>;
}

const initialState: UiState = {
  columnPanelWidth: 240,
  indexPanelWidth: 240,
  constraintPanelWidth: 240,
  columnWidths: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setColumnPanelWidth: (state, action: PayloadAction<number>) => {
      state.columnPanelWidth = action.payload;
    },
    setIndexPanelWidth: (state, action: PayloadAction<number>) => {
      state.indexPanelWidth = action.payload;
    },
    setConstraintPanelWidth: (state, action: PayloadAction<number>) => {
      state.constraintPanelWidth = action.payload;
    },
    setViewColumnWidths: (
      state,
      action: PayloadAction<{ key: string; widths: number[] }>,
    ) => {
      if (!state.columnWidths) state.columnWidths = {};
      state.columnWidths[action.payload.key] = action.payload.widths;
    },
  },
});

export const {
  setColumnPanelWidth,
  setIndexPanelWidth,
  setConstraintPanelWidth,
  setViewColumnWidths,
} = uiSlice.actions;
export default uiSlice.reducer;
