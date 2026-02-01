/**
 * Redux Slice for Real-time Collaboration State
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ConnectedUser {
  userId: string;
  userName: string;
  userColor: string;
  cursorPosition?: { x: number; y: number };
  lockedItemId?: string;
}

interface RealtimeState {
  isConnected: boolean;
  connectedUsers: ConnectedUser[];
  remoteCursors: Map<string, { x: number; y: number }>;
  lockedItems: Map<string, string>; // itemId -> userId mapping
  error: string | null;
}

const initialState: RealtimeState = {
  isConnected: false,
  connectedUsers: [],
  remoteCursors: new Map(),
  lockedItems: new Map(),
  error: null
};

export const realtimeSlice = createSlice({
  name: 'realtime',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.error = null;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    addConnectedUser: (state, action: PayloadAction<ConnectedUser>) => {
      const exists = state.connectedUsers.find((u) => u.userId === action.payload.userId);
      if (!exists) {
        state.connectedUsers.push(action.payload);
      }
    },

    removeConnectedUser: (state, action: PayloadAction<string>) => {
      state.connectedUsers = state.connectedUsers.filter((u) => u.userId !== action.payload);
      state.remoteCursors.delete(action.payload);

      // Remove item locks for this user
      for (const [itemId, userId] of state.lockedItems.entries()) {
        if (userId === action.payload) {
          state.lockedItems.delete(itemId);
        }
      }
    },

    updateRemoteCursor: (state, action: PayloadAction<{ userId: string; position: { x: number; y: number } }>) => {
      state.remoteCursors.set(action.payload.userId, action.payload.position);

      // Update user cursor position in connected users
      const user = state.connectedUsers.find((u) => u.userId === action.payload.userId);
      if (user) {
        user.cursorPosition = action.payload.position;
      }
    },

    lockItem: (state, action: PayloadAction<{ itemId: string; userId: string }>) => {
      state.lockedItems.set(action.payload.itemId, action.payload.userId);

      // Update user's locked item
      const user = state.connectedUsers.find((u) => u.userId === action.payload.userId);
      if (user) {
        user.lockedItemId = action.payload.itemId;
      }
    },

    releaseItem: (state, action: PayloadAction<string>) => {
      const userId = state.lockedItems.get(action.payload);
      state.lockedItems.delete(action.payload);

      // Update user's locked item
      if (userId) {
        const user = state.connectedUsers.find((u) => u.userId === userId);
        if (user) {
          user.lockedItemId = undefined;
        }
      }
    },

    clearRemoteCursor: (state, action: PayloadAction<string>) => {
      state.remoteCursors.delete(action.payload);
    },

    clearAllRemote: (state) => {
      state.connectedUsers = [];
      state.remoteCursors.clear();
      state.lockedItems.clear();
    }
  }
});

export const {
  setConnected,
  setError,
  addConnectedUser,
  removeConnectedUser,
  updateRemoteCursor,
  lockItem,
  releaseItem,
  clearRemoteCursor,
  clearAllRemote
} = realtimeSlice.actions;

// Selectors
export const selectIsConnected = (state: { realtime: RealtimeState }) =>
  state.realtime.isConnected;

export const selectConnectedUsers = (state: { realtime: RealtimeState }) =>
  state.realtime.connectedUsers;

export const selectRemoteCursors = (state: { realtime: RealtimeState }) =>
  Array.from(state.realtime.remoteCursors.entries()).map(([userId, position]) => ({
    userId,
    position
  }));

export const selectLockedItems = (state: { realtime: RealtimeState }) =>
  Array.from(state.realtime.lockedItems.entries()).map(([itemId, userId]) => ({
    itemId,
    userId
  }));

export default realtimeSlice.reducer;
