import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { syncToDBAL, fetchFromDBAL, deleteFromDBAL } from '@/store/middleware/dbalSync'

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: number
  updatedAt: number
}

interface ProjectState {
  currentProject: Project | null
  projects: Project[]
  loading: boolean
  error: string | null
  lastSyncedAt: number | null
}

const initialState: ProjectState = {
  currentProject: null,
  projects: [],
  loading: false,
  error: null,
  lastSyncedAt: null,
}

export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData: { name: string; description?: string }) => {
    const project: Project = {
      id: `project-${Date.now()}`,
      name: projectData.name,
      description: projectData.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await syncToDBAL('projects', project.id, project)
    return project
  }
)

export const saveProject = createAsyncThunk(
  'project/saveProject',
  async (project: Project) => {
    await syncToDBAL('projects', project.id, project)
    return project
  }
)

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId: string) => {
    await deleteFromDBAL('projects', projectId)
    return projectId
  }
)

export const syncProjectFromDBAL = createAsyncThunk(
  'project/syncFromDBAL',
  async (projectId: string) => {
    return await fetchFromDBAL('projects', projectId)
  }
)

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    setCurrentProject: (state, action: PayloadAction<Project>) => {
      state.currentProject = action.payload
    },
    clearCurrentProject: (state) => {
      state.currentProject = null
    },
    updateProjectMetadata: (state, action: PayloadAction<Partial<Project>>) => {
      if (state.currentProject) {
        state.currentProject = {
          ...state.currentProject,
          ...action.payload,
          updatedAt: Date.now(),
        }
      }
    },
    markSynced: (state) => {
      state.lastSyncedAt = Date.now()
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.push(action.payload)
    },
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.push(action.payload)
        state.currentProject = action.payload
      })
      .addCase(saveProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p.id === action.payload.id)
        if (index !== -1) {
          state.projects[index] = action.payload
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload
        }
        state.lastSyncedAt = Date.now()
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.projects = state.projects.filter(p => p.id !== action.payload)
        if (state.currentProject?.id === action.payload) {
          state.currentProject = null
        }
      })
      .addCase(syncProjectFromDBAL.fulfilled, (state, action) => {
        if (action.payload) {
          const index = state.projects.findIndex(p => p.id === action.payload.id)
          if (index !== -1) {
            state.projects[index] = action.payload
          } else {
            state.projects.push(action.payload)
          }
          if (state.currentProject?.id === action.payload.id) {
            state.currentProject = action.payload
          }
        }
        state.lastSyncedAt = Date.now()
      })
  },
})

export const {
  setCurrentProject,
  clearCurrentProject,
  updateProjectMetadata,
  markSynced,
  addProject,
  setProjects,
} = projectSlice.actions

export default projectSlice.reducer
