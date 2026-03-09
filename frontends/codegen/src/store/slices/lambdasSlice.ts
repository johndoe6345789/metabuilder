import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { syncToDBAL, deleteFromDBAL } from '@/store/middleware/dbalSync'

export interface Lambda {
  id: string
  name: string
  description?: string
  code: string
  runtime: string
  handler: string
  updatedAt: number
}

interface LambdasState {
  lambdas: Lambda[]
  activeLambdaId: string | null
  loading: boolean
  error: string | null
}

const initialState: LambdasState = {
  lambdas: [],
  activeLambdaId: null,
  loading: false,
  error: null,
}

const lambdasSlice = createSlice({
  name: 'lambdas',
  initialState,
  reducers: {
    setActiveLambda: (state, action: PayloadAction<string>) => {
      state.activeLambdaId = action.payload
    },
    clearActiveLambda: (state) => {
      state.activeLambdaId = null
    },
    addLambda: (state, action: PayloadAction<Lambda>) => {
      state.lambdas.push(action.payload)
      syncToDBAL('lambdas', action.payload.id, action.payload).catch(console.error)
    },
    updateLambda: (state, action: PayloadAction<Lambda>) => {
      const index = state.lambdas.findIndex(l => l.id === action.payload.id)
      if (index !== -1) {
        state.lambdas[index] = action.payload
        syncToDBAL('lambdas', action.payload.id, action.payload).catch(console.error)
      }
    },
    deleteLambda: (state, action: PayloadAction<string>) => {
      state.lambdas = state.lambdas.filter(l => l.id !== action.payload)
      if (state.activeLambdaId === action.payload) {
        state.activeLambdaId = null
      }
      deleteFromDBAL('lambdas', action.payload).catch(console.error)
    },
    setLambdas: (state, action: PayloadAction<Lambda[]>) => {
      state.lambdas = action.payload
    },
  },
})

export const { 
  setActiveLambda, 
  clearActiveLambda, 
  addLambda, 
  updateLambda, 
  deleteLambda,
  setLambdas 
} = lambdasSlice.actions

export default lambdasSlice.reducer
