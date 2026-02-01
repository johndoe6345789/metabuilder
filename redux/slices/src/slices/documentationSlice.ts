/**
 * Documentation Redux Slice
 * State management for documentation system
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HelpState, DocCategory } from '../types/documentation';

const initialState: HelpState = {
  isOpen: false,
  currentPageId: null,
  currentCategory: null,
  searchQuery: '',
  searchResults: [],
  history: [],
};

export const documentationSlice = createSlice({
  name: 'documentation',
  initialState,
  reducers: {
    /**
     * Open help modal
     */
    openHelp: (state, action: PayloadAction<{ pageId?: string; category?: DocCategory }>) => {
      state.isOpen = true;
      if (action.payload.pageId) {
        state.currentPageId = action.payload.pageId;
        // Add to history
        if (!state.history.includes(action.payload.pageId)) {
          state.history.unshift(action.payload.pageId);
          state.history = state.history.slice(0, 20); // Keep last 20
        }
      }
      if (action.payload.category) {
        state.currentCategory = action.payload.category;
      }
    },

    /**
     * Close help modal
     */
    closeHelp: (state) => {
      state.isOpen = false;
    },

    /**
     * Navigate to a page
     */
    navigateToPage: (state, action: PayloadAction<string>) => {
      state.currentPageId = action.payload;
      state.searchQuery = '';
      state.searchResults = [];

      // Add to history
      if (!state.history.includes(action.payload)) {
        state.history.unshift(action.payload);
        state.history = state.history.slice(0, 20);
      }
    },

    /**
     * Set current category
     */
    setCategory: (state, action: PayloadAction<DocCategory | null>) => {
      state.currentCategory = action.payload;
      state.currentPageId = null;
    },

    /**
     * Update search query and results
     */
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    /**
     * Set search results
     */
    setSearchResults: (state, action: PayloadAction<string[]>) => {
      state.searchResults = action.payload;
    },

    /**
     * Go back in history
     */
    goBack: (state) => {
      if (state.history.length > 1) {
        state.history.shift(); // Remove current
        state.currentPageId = state.history[0] || null;
      }
    },

    /**
     * Clear search
     */
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },

    /**
     * Clear history
     */
    clearHistory: (state) => {
      state.history = [];
      state.currentPageId = null;
    },

    /**
     * Reset documentation state
     */
    reset: () => initialState,
  },
});

export const {
  openHelp,
  closeHelp,
  navigateToPage,
  setCategory,
  setSearchQuery,
  setSearchResults,
  goBack,
  clearSearch,
  clearHistory,
  reset,
} = documentationSlice.actions;

export default documentationSlice.reducer;
