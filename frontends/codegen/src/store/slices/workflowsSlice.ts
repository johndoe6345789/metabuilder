import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { syncToDBAL, deleteFromDBAL } from '@/store/middleware/dbalSync'

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

export const saveWorkflow = createAsyncThunk(
  'workflows/saveWorkflow',
  async (workflow: Workflow) => {
    await syncToDBAL('workflows', workflow.id, workflow)
    return workflow
  }
)

export const deleteWorkflow = createAsyncThunk(
  'workflows/deleteWorkflow',
  async (workflowId: string) => {
    await deleteFromDBAL('workflows', workflowId)
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
    removeWorkflow: (state, action: PayloadAction<string>) => {
      state.workflows = state.workflows.filter(w => w.id !== action.payload)
      if (state.activeWorkflowId === action.payload) {
        state.activeWorkflowId = null
      }
    },
    setWorkflows: (state, action: PayloadAction<Workflow[]>) => {
      state.workflows = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addMatcher(
        (action) => action.type === 'dbal/syncFromDBALBulk/fulfilled',
        (state, action: any) => {
          if (action.payload?.data?.workflows) {
            state.workflows = action.payload.data.workflows
          }
        }
      )
  },
})

export const {
  setActiveWorkflow,
  clearActiveWorkflow,
  addWorkflow,
  updateWorkflow,
  removeWorkflow,
  setWorkflows,
} = workflowsSlice.actions

export default workflowsSlice.reducer
