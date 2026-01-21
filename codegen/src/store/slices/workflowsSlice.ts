import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { db } from '@/lib/db'
import { syncToFlask, fetchFromFlask } from '@/store/middleware/flaskSync'

export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  updatedAt: number
}

export interface WorkflowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, any>
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

interface WorkflowsState {
  workflows: Workflow[]
  activeWorkflowId: string | null
  loading: boolean
  error: string | null
}

const initialState: WorkflowsState = {
  workflows: [],
  activeWorkflowId: null,
  loading: false,
  error: null,
}

export const loadWorkflows = createAsyncThunk(
  'workflows/loadWorkflows',
  async () => {
    const workflows = await db.getAll('workflows')
    return workflows as Workflow[]
  }
)

export const saveWorkflow = createAsyncThunk(
  'workflows/saveWorkflow',
  async (workflow: Workflow) => {
    await db.put('workflows', workflow)
    await syncToFlask('workflows', workflow.id, workflow)
    return workflow
  }
)

export const deleteWorkflow = createAsyncThunk(
  'workflows/deleteWorkflow',
  async (workflowId: string) => {
    await db.delete('workflows', workflowId)
    await syncToFlask('workflows', workflowId, null, 'delete')
    return workflowId
  }
)

const workflowsSlice = createSlice({
  name: 'workflows',
  initialState,
  reducers: {
    setActiveWorkflow: (state, action: PayloadAction<string>) => {
      state.activeWorkflowId = action.payload
    },
    clearActiveWorkflow: (state) => {
      state.activeWorkflowId = null
    },
    addWorkflow: (state, action: PayloadAction<Workflow>) => {
      state.workflows.push(action.payload)
    },
    updateWorkflow: (state, action: PayloadAction<Workflow>) => {
      const index = state.workflows.findIndex(w => w.id === action.payload.id)
      if (index !== -1) {
        state.workflows[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWorkflows.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadWorkflows.fulfilled, (state, action) => {
        state.loading = false
        state.workflows = action.payload
      })
      .addCase(loadWorkflows.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load workflows'
      })
      .addCase(saveWorkflow.fulfilled, (state, action) => {
        const index = state.workflows.findIndex(w => w.id === action.payload.id)
        if (index !== -1) {
          state.workflows[index] = action.payload
        } else {
          state.workflows.push(action.payload)
        }
      })
      .addCase(deleteWorkflow.fulfilled, (state, action) => {
        state.workflows = state.workflows.filter(w => w.id !== action.payload)
        if (state.activeWorkflowId === action.payload) {
          state.activeWorkflowId = null
        }
      })
  },
})

export const { 
  setActiveWorkflow, 
  clearActiveWorkflow, 
  addWorkflow, 
  updateWorkflow 
} = workflowsSlice.actions

export default workflowsSlice.reducer
