/**
 * Redux Slice for Project CRUD Operations
 * Handles project list management and selection
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '../types/project';

interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  currentProjectId: null,
  isLoading: false,
  error: null
};

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    // Async state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Project list operations
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
      state.error = null;
    },

    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload);
      state.error = null;
    },

    updateProject: (state, action: PayloadAction<Project>) => {
      const index = state.projects.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.projects[index] = action.payload;
      }
      state.error = null;
    },

    removeProject: (state, action: PayloadAction<string>) => {
      state.projects = state.projects.filter((p) => p.id !== action.payload);
      // Clear current project if it was deleted
      if (state.currentProjectId === action.payload) {
        state.currentProjectId = null;
      }
      state.error = null;
    },

    // Current project selection
    setCurrentProject: (state, action: PayloadAction<string | null>) => {
      state.currentProjectId = action.payload;
    },

    clearProject: (state) => {
      state.currentProjectId = null;
    }
  }
});

export const {
  setLoading,
  setError,
  setProjects,
  addProject,
  updateProject,
  removeProject,
  setCurrentProject,
  clearProject
} = projectSlice.actions;

// Re-export for convenience
export type { ProjectState };

// Selectors
export const selectProjects = (state: { project: ProjectState }) =>
  state.project.projects;

export const selectCurrentProject = (state: { project: ProjectState }) => {
  if (!state.project.currentProjectId) return null;
  return state.project.projects.find((p) => p.id === state.project.currentProjectId);
};

export const selectCurrentProjectId = (state: { project: ProjectState }) =>
  state.project.currentProjectId;

export const selectProjectIsLoading = (state: { project: ProjectState }) =>
  state.project.isLoading;

export const selectProjectError = (state: { project: ProjectState }) =>
  state.project.error;

export default projectSlice.reducer;
