import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { syncToDBAL, deleteFromDBAL } from '@/store/middleware/dbalSync'

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

export const saveComponent = createAsyncThunk(
  'components/saveComponent',
  async (component: Component) => {
    await syncToDBAL('components', component.id, component)
    return component
  }
)

export const deleteComponent = createAsyncThunk(
  'components/deleteComponent',
  async (componentId: string) => {
    await deleteFromDBAL('components', componentId)
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
    removeComponent: (state, action: PayloadAction<string>) => {
      state.components = state.components.filter(c => c.id !== action.payload)
      if (state.activeComponentId === action.payload) {
        state.activeComponentId = null
      }
    },
    setComponents: (state, action: PayloadAction<Component[]>) => {
      state.components = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addMatcher(
        (action) => action.type === 'dbal/syncFromDBALBulk/fulfilled',
        (state, action: any) => {
          if (action.payload?.data?.components) {
            state.components = action.payload.data.components
          }
        }
      )
  },
})

export const {
  setActiveComponent,
  clearActiveComponent,
  addComponent,
  updateComponent,
  removeComponent,
  setComponents,
} = componentsSlice.actions

export default componentsSlice.reducer
