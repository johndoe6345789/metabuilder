import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { db } from '@/lib/db'
import { syncToFlask, fetchFromFlask } from '@/store/middleware/flaskSync'

export interface Component {
  id: string
  name: string
  type: 'atom' | 'molecule' | 'organism'
  code: string
  props?: ComponentProp[]
  metadata?: Record<string, any>
  updatedAt: number
}

export interface ComponentProp {
  name: string
  type: string
  required: boolean
  defaultValue?: any
  description?: string
}

interface ComponentsState {
  components: Component[]
  activeComponentId: string | null
  loading: boolean
  error: string | null
}

const initialState: ComponentsState = {
  components: [],
  activeComponentId: null,
  loading: false,
  error: null,
}

export const loadComponents = createAsyncThunk(
  'components/loadComponents',
  async () => {
    const components = await db.getAll('components')
    return components as Component[]
  }
)

export const saveComponent = createAsyncThunk(
  'components/saveComponent',
  async (component: Component) => {
    await db.put('components', component)
    await syncToFlask('components', component.id, component)
    return component
  }
)

export const deleteComponent = createAsyncThunk(
  'components/deleteComponent',
  async (componentId: string) => {
    await db.delete('components', componentId)
    await syncToFlask('components', componentId, null, 'delete')
    return componentId
  }
)

const componentsSlice = createSlice({
  name: 'components',
  initialState,
  reducers: {
    setActiveComponent: (state, action: PayloadAction<string>) => {
      state.activeComponentId = action.payload
    },
    clearActiveComponent: (state) => {
      state.activeComponentId = null
    },
    addComponent: (state, action: PayloadAction<Component>) => {
      state.components.push(action.payload)
    },
    updateComponent: (state, action: PayloadAction<Component>) => {
      const index = state.components.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.components[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadComponents.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadComponents.fulfilled, (state, action) => {
        state.loading = false
        state.components = action.payload
      })
      .addCase(loadComponents.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load components'
      })
      .addCase(saveComponent.fulfilled, (state, action) => {
        const index = state.components.findIndex(c => c.id === action.payload.id)
        if (index !== -1) {
          state.components[index] = action.payload
        } else {
          state.components.push(action.payload)
        }
      })
      .addCase(deleteComponent.fulfilled, (state, action) => {
        state.components = state.components.filter(c => c.id !== action.payload)
        if (state.activeComponentId === action.payload) {
          state.activeComponentId = null
        }
      })
  },
})

export const { 
  setActiveComponent, 
  clearActiveComponent, 
  addComponent, 
  updateComponent 
} = componentsSlice.actions

export default componentsSlice.reducer
