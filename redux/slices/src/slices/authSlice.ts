/**
 * Redux Slice for Authentication State
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login/Register
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    setAuthenticated: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
      state.isLoading = false;
    },

    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Restore from storage
    restoreFromStorage: (state, action: PayloadAction<{ user: User | null; token: string | null }>) => {
      if (action.payload.token && action.payload.user) {
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      } else {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      }
    }
  }
});

export const {
  setLoading,
  setError,
  setAuthenticated,
  setUser,
  logout,
  clearError,
  restoreFromStorage
} = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export const selectUser = (state: { auth: AuthState }) =>
  state.auth.user;

export const selectToken = (state: { auth: AuthState }) =>
  state.auth.token;

export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;

export const selectError = (state: { auth: AuthState }) =>
  state.auth.error;

export default authSlice.reducer;
