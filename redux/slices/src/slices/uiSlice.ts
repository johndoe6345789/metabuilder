/**
 * UI Redux Slice
 * Manages UI state: modals, notifications, theme, sidebar
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface UIState {
  modals: {
    createWorkflow: boolean;
    importWorkflow: boolean;
    settings: boolean;
    nodeHelp: boolean;
  };
  notifications: Notification[];
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: boolean;
  loadingMessage: string | null;
}

const initialState: UIState = {
  modals: {
    createWorkflow: false,
    importWorkflow: false,
    settings: false,
    nodeHelp: false
  },
  notifications: [],
  theme: 'light',
  sidebarOpen: true,
  loading: false,
  loadingMessage: null
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Modal management
    openModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = true;
    },

    closeModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = false;
    },

    toggleModal: (state, action: PayloadAction<keyof UIState['modals']>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },

    // Notification management
    setNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
      // Note: Auto-remove handled by useUINotifications hook, not here
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Theme management
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload;
      localStorage.setItem('workflow-theme', action.payload);
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('workflow-theme', state.theme);
    },

    // Sidebar management
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
      localStorage.setItem('sidebar-open', action.payload.toString());
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
      localStorage.setItem('sidebar-open', state.sidebarOpen.toString());
    },

    // Loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setLoadingMessage: (state, action: PayloadAction<string | null>) => {
      state.loadingMessage = action.payload;
    }
  }
});

export const {
  openModal,
  closeModal,
  toggleModal,
  setNotification,
  removeNotification,
  clearNotifications,
  setTheme,
  toggleTheme,
  setSidebarOpen,
  toggleSidebar,
  setLoading,
  setLoadingMessage
} = uiSlice.actions;

export default uiSlice.reducer;
