import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { db } from '@/lib/db'
import { syncToFlask, fetchFromFlask } from '@/store/middleware/flaskSync'

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

export const loadProjects = createAsyncThunk(
  'project/loadProjects',
  async () => {
    const projects = await db.getAll('projects')
    return projects as Project[]
  }
)

export const loadProject = createAsyncThunk(
  'project/loadProject',
  async (projectId: string) => {
    const project = await db.get('projects', projectId)
    return project as Project
  }
)

export const saveProject = createAsyncThunk(
  'project/saveProject',
  async (project: Project) => {
    await db.put('projects', project)
    await syncToFlask('projects', project.id, project)
    return project
  }
)

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
    await db.put('projects', project)
    await syncToFlask('projects', project.id, project)
    return project
  }
)

export const deleteProject = createAsyncThunk(
  'project/deleteProject',
  async (projectId: string) => {
    await db.delete('projects', projectId)
    await syncToFlask('projects', projectId, null, 'delete')
    return projectId
  }
)

export const syncProjectFromFlask = createAsyncThunk(
  'project/syncFromFlask',
  async (projectId: string) => {
    const project = await fetchFromFlask('projects', projectId)
    if (project) {
      await db.put('projects', project)
    }
    return project
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProjects.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadProjects.fulfilled, (state, action) => {
        state.loading = false
        state.projects = action.payload
      })
      .addCase(loadProjects.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load projects'
      })
      .addCase(loadProject.fulfilled, (state, action) => {
        state.currentProject = action.payload
      })
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
      .addCase(syncProjectFromFlask.fulfilled, (state, action) => {
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
  markSynced 
} = projectSlice.actions

export default projectSlice.reducer
