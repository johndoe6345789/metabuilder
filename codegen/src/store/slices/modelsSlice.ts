import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { db } from '@/lib/db'
import { syncToFlask, fetchFromFlask } from '@/store/middleware/flaskSync'

export interface Model {
  id: string
  name: string
  fields: ModelField[]
  updatedAt: number
}

export interface ModelField {
  id: string
  name: string
  type: string
  required: boolean
  defaultValue?: any
}

interface ModelsState {
  models: Model[]
  activeModelId: string | null
  loading: boolean
  error: string | null
}

const initialState: ModelsState = {
  models: [],
  activeModelId: null,
  loading: false,
  error: null,
}

export const loadModels = createAsyncThunk('models/loadModels', async () => {
  const models = await db.getAll('models')
  return models as Model[]
})

export const saveModel = createAsyncThunk(
  'models/saveModel',
  async (model: Model) => {
    await db.put('models', model)
    await syncToFlask('models', model.id, model)
    return model
  }
)

export const deleteModel = createAsyncThunk(
  'models/deleteModel',
  async (modelId: string) => {
    await db.delete('models', modelId)
    await syncToFlask('models', modelId, null, 'delete')
    return modelId
  }
)

const modelsSlice = createSlice({
  name: 'models',
  initialState,
  reducers: {
    setActiveModel: (state, action: PayloadAction<string>) => {
      state.activeModelId = action.payload
    },
    clearActiveModel: (state) => {
      state.activeModelId = null
    },
    addModel: (state, action: PayloadAction<Model>) => {
      state.models.push(action.payload)
    },
    updateModel: (state, action: PayloadAction<Model>) => {
      const index = state.models.findIndex(m => m.id === action.payload.id)
      if (index !== -1) {
        state.models[index] = action.payload
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadModels.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loadModels.fulfilled, (state, action) => {
        state.loading = false
        state.models = action.payload
      })
      .addCase(loadModels.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load models'
      })
      .addCase(saveModel.fulfilled, (state, action) => {
        const index = state.models.findIndex(m => m.id === action.payload.id)
        if (index !== -1) {
          state.models[index] = action.payload
        } else {
          state.models.push(action.payload)
        }
      })
      .addCase(deleteModel.fulfilled, (state, action) => {
        state.models = state.models.filter(m => m.id !== action.payload)
        if (state.activeModelId === action.payload) {
          state.activeModelId = null
        }
      })
  },
})

export const { setActiveModel, clearActiveModel, addModel, updateModel } = modelsSlice.actions
export default modelsSlice.reducer
