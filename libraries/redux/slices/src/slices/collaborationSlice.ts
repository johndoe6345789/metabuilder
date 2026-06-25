/**
 * Redux Slice for Project-Level Collaboration State
 * Handles activity feed, conflicts, and real-time presence
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivityFeedEntry, ConflictItem } from '../types/project';

interface CollaborationState {
  activityFeed: ActivityFeedEntry[];
  conflicts: ConflictItem[];
  isActivityLoading: boolean;
  hasUnresolvedConflicts: boolean;
}

const initialState: CollaborationState = {
  activityFeed: [],
  conflicts: [],
  isActivityLoading: false,
  hasUnresolvedConflicts: false
};

export const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    // Activity feed operations
    addActivityEntry: (state, action: PayloadAction<ActivityFeedEntry>) => {
      state.activityFeed.unshift(action.payload);
      // Keep activity feed reasonably sized (last 100 entries)
      if (state.activityFeed.length > 100) {
        state.activityFeed = state.activityFeed.slice(0, 100);
      }
    },

    setActivityFeed: (state, action: PayloadAction<ActivityFeedEntry[]>) => {
      state.activityFeed = action.payload;
    },

    clearActivityFeed: (state) => {
      state.activityFeed = [];
    },

    setActivityLoading: (state, action: PayloadAction<boolean>) => {
      state.isActivityLoading = action.payload;
    },

    // Conflict management
    addConflict: (state, action: PayloadAction<ConflictItem>) => {
      const exists = state.conflicts.find((c) => c.itemId === action.payload.itemId);
      if (!exists) {
        state.conflicts.push(action.payload);
        state.hasUnresolvedConflicts = true;
      }
    },

    resolveConflict: (state, action: PayloadAction<string>) => {
      state.conflicts = state.conflicts.filter((c) => c.itemId !== action.payload);
      state.hasUnresolvedConflicts = state.conflicts.length > 0;
    },

    resolveAllConflicts: (state) => {
      state.conflicts = [];
      state.hasUnresolvedConflicts = false;
    },

    updateConflictResolution: (
      state,
      action: PayloadAction<{ itemId: string; resolution: 'local' | 'remote' | 'merge' }>
    ) => {
      const conflict = state.conflicts.find((c) => c.itemId === action.payload.itemId);
      if (conflict) {
        conflict.resolution = action.payload.resolution;
      }
    },

    clearConflicts: (state) => {
      state.conflicts = [];
      state.hasUnresolvedConflicts = false;
    }
  }
});

export const {
  addActivityEntry,
  setActivityFeed,
  clearActivityFeed,
  setActivityLoading,
  addConflict,
  resolveConflict,
  resolveAllConflicts,
  updateConflictResolution,
  clearConflicts
} = collaborationSlice.actions;

// Selectors
export const selectActivityFeed = (state: { collaboration: CollaborationState }) =>
  state.collaboration.activityFeed;

export const selectActivityLoading = (state: { collaboration: CollaborationState }) =>
  state.collaboration.isActivityLoading;

export const selectConflicts = (state: { collaboration: CollaborationState }) =>
  state.collaboration.conflicts;

export const selectHasUnresolvedConflicts = (state: { collaboration: CollaborationState }) =>
  state.collaboration.hasUnresolvedConflicts;

export const selectConflictCount = (state: { collaboration: CollaborationState }) =>
  state.collaboration.conflicts.length;

export const selectConflictByItemId = (state: { collaboration: CollaborationState }, itemId: string) =>
  state.collaboration.conflicts.find((c) => c.itemId === itemId);

export default collaborationSlice.reducer;
