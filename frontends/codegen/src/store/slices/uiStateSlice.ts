/**
 * uiStateSlice — typed generic UI state store
 *
 * Replaces the untyped kvSlice for cases where dedicated slices
 * aren't practical (generic JSON data hooks, data-source managers,
 * dynamic page configs, etc.).
 *
 * Unlike kvSlice, this has a clear purpose: ephemeral UI state
 * that may need persistence but doesn't warrant its own slice.
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIStateData {
  [key: string]: unknown
}

interface UIStateSlice {
  data: UIStateData
}

const initialState: UIStateSlice = {
  data: {},
}

const uiStateSlice = createSlice({
  name: 'uiState',
  initialState,
  reducers: {
    setUIState: (state, action: PayloadAction<{ key: string; value: unknown }>) => {
      state.data[action.payload.key] = action.payload.value
    },
    deleteUIState: (state, action: PayloadAction<string>) => {
      delete state.data[action.payload]
    },
    clearUIState: (state) => {
      state.data = {}
    },
  },
})

export const { setUIState, deleteUIState, clearUIState } = uiStateSlice.actions
export default uiStateSlice.reducer
