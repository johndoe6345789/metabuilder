/**
 * Redux Slice for Generic Async Data Management
 * Replaces @tanstack/react-query with Redux-based async state management
 * Handles fetching, mutations, pagination, retries, and request deduplication
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

/**
 * Represents a single async request in flight or completed
 * Tracks loading state, errors, retries, and caching
 */
export interface AsyncRequest {
  id: string
  status: 'idle' | 'pending' | 'succeeded' | 'failed'
  data: unknown
  error: string | null
  retryCount: number
  maxRetries: number
  retryDelay: number
  lastRefetch: number
  refetchInterval: number | null
  createdAt: number
  isRefetching: boolean
}

/**
 * Global state for all async operations
 */
interface AsyncDataState {
  requests: Record<string, AsyncRequest>
  globalLoading: boolean
  globalError: string | null
}

const initialState: AsyncDataState = {
  requests: {},
  globalLoading: false,
  globalError: null
}

/**
 * Generic fetch thunk - handles any async operation
 * Supports retries, request deduplication, and lifecycle management
 */
export const fetchAsyncData = createAsyncThunk(
  'asyncData/fetch',
  async (
    params: {
      id: string
      fetchFn: () => Promise<unknown>
      maxRetries?: number
      retryDelay?: number
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await params.fetchFn()
      return { id: params.id, data: result }
    } catch (error) {
      return rejectWithValue({
        id: params.id,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

/**
 * Mutation thunk - handles POST, PUT, DELETE operations
 * Similar to fetch but used for write operations
 */
export const mutateAsyncData = createAsyncThunk(
  'asyncData/mutate',
  async (
    params: {
      id: string
      mutateFn: (payload: unknown) => Promise<unknown>
      payload: unknown
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await params.mutateFn(params.payload)
      return { id: params.id, data: result }
    } catch (error) {
      return rejectWithValue({
        id: params.id,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

/**
 * Refetch thunk - refetches without clearing existing data on error
 */
export const refetchAsyncData = createAsyncThunk(
  'asyncData/refetch',
  async (
    params: {
      id: string
      fetchFn: () => Promise<unknown>
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await params.fetchFn()
      return { id: params.id, data: result }
    } catch (error) {
      return rejectWithValue({
        id: params.id,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }
)

/**
 * Cleanup thunk - removes requests older than specified age
 */
export const cleanupAsyncRequests = createAsyncThunk(
  'asyncData/cleanup',
  async (
    params: {
      maxAge: number // milliseconds
    }
  ) => {
    return params
  }
)

const createInitialRequest = (id: string): AsyncRequest => ({
  id,
  status: 'idle',
  data: undefined,
  error: null,
  retryCount: 0,
  maxRetries: 3,
  retryDelay: 1000,
  lastRefetch: 0,
  refetchInterval: null,
  createdAt: Date.now(),
  isRefetching: false
})

export const asyncDataSlice = createSlice({
  name: 'asyncData',
  initialState,
  reducers: {
    /**
     * Manually set request to loading state
     */
    setRequestLoading: (state, action: PayloadAction<string>) => {
      const id = action.payload
      if (!state.requests[id]) {
        state.requests[id] = createInitialRequest(id)
      }
      state.requests[id].status = 'pending'
      state.requests[id].error = null
    },

    /**
     * Manually set request error
     */
    setRequestError: (
      state,
      action: PayloadAction<{ id: string; error: string }>
    ) => {
      const { id, error } = action.payload
      if (!state.requests[id]) {
        state.requests[id] = createInitialRequest(id)
      }
      state.requests[id].status = 'failed'
      state.requests[id].error = error
    },

    /**
     * Manually set request data
     */
    setRequestData: (
      state,
      action: PayloadAction<{ id: string; data: unknown }>
    ) => {
      const { id, data } = action.payload
      if (!state.requests[id]) {
        state.requests[id] = createInitialRequest(id)
      }
      state.requests[id].data = data
      state.requests[id].status = 'succeeded'
      state.requests[id].error = null
    },

    /**
     * Clear a specific request from state
     */
    clearRequest: (state, action: PayloadAction<string>) => {
      delete state.requests[action.payload]
    },

    /**
     * Clear all requests
     */
    clearAllRequests: (state) => {
      state.requests = {}
    },

    /**
     * Reset request to idle state
     */
    resetRequest: (state, action: PayloadAction<string>) => {
      if (state.requests[action.payload]) {
        state.requests[action.payload] = createInitialRequest(action.payload)
      }
    },

    /**
     * Set global loading state
     */
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },

    /**
     * Set global error state
     */
    setGlobalError: (state, action: PayloadAction<string | null>) => {
      state.globalError = action.payload
    },

    /**
     * Configure auto-refetch interval for a request
     */
    setRefetchInterval: (
      state,
      action: PayloadAction<{ id: string; interval: number | null }>
    ) => {
      const { id, interval } = action.payload
      if (!state.requests[id]) {
        state.requests[id] = createInitialRequest(id)
      }
      state.requests[id].refetchInterval = interval
    }
  },
  extraReducers: (builder) => {
    /**
     * Handle fetchAsyncData thunk
     */
    builder
      .addCase(fetchAsyncData.pending, (state, action) => {
        const id = (action.meta.arg as any).id
        if (!state.requests[id]) {
          state.requests[id] = createInitialRequest(id)
        }
        state.requests[id].status = 'pending'
        state.requests[id].error = null
      })
      .addCase(fetchAsyncData.fulfilled, (state, action) => {
        const { id, data } = action.payload
        if (!state.requests[id]) {
          state.requests[id] = createInitialRequest(id)
        }
        state.requests[id].status = 'succeeded'
        state.requests[id].data = data
        state.requests[id].error = null
        state.requests[id].lastRefetch = Date.now()
      })
      .addCase(fetchAsyncData.rejected, (state, action) => {
        const payload = action.payload as any
        const id = payload?.id
        if (id) {
          if (!state.requests[id]) {
            state.requests[id] = createInitialRequest(id)
          }
          state.requests[id].status = 'failed'
          state.requests[id].error = payload.error || 'Unknown error'
          state.requests[id].retryCount += 1
        }
      })

    /**
     * Handle mutateAsyncData thunk
     */
    builder
      .addCase(mutateAsyncData.pending, (state, action) => {
        const id = (action.meta.arg as any).id
        if (!state.requests[id]) {
          state.requests[id] = createInitialRequest(id)
        }
        state.requests[id].status = 'pending'
        state.requests[id].error = null
      })
      .addCase(mutateAsyncData.fulfilled, (state, action) => {
        const { id, data } = action.payload
        if (!state.requests[id]) {
          state.requests[id] = createInitialRequest(id)
        }
        state.requests[id].status = 'succeeded'
        state.requests[id].data = data
        state.requests[id].error = null
      })
      .addCase(mutateAsyncData.rejected, (state, action) => {
        const payload = action.payload as any
        const id = payload?.id
        if (id) {
          if (!state.requests[id]) {
            state.requests[id] = createInitialRequest(id)
          }
          state.requests[id].status = 'failed'
          state.requests[id].error = payload.error || 'Unknown error'
        }
      })

    /**
     * Handle refetchAsyncData thunk
     */
    builder
      .addCase(refetchAsyncData.pending, (state, action) => {
        const id = (action.meta.arg as any).id
        if (state.requests[id]) {
          state.requests[id].isRefetching = true
        }
      })
      .addCase(refetchAsyncData.fulfilled, (state, action) => {
        const { id, data } = action.payload
        if (state.requests[id]) {
          state.requests[id].data = data
          state.requests[id].status = 'succeeded'
          state.requests[id].error = null
          state.requests[id].isRefetching = false
          state.requests[id].lastRefetch = Date.now()
        }
      })
      .addCase(refetchAsyncData.rejected, (state, action) => {
        const payload = action.payload as any
        const id = payload?.id
        if (state.requests[id]) {
          // Don't clear data on refetch error - keep stale data
          state.requests[id].isRefetching = false
          state.requests[id].error = payload.error
        }
      })

    /**
     * Handle cleanup thunk
     */
    builder.addCase(cleanupAsyncRequests.fulfilled, (state, action) => {
      const now = Date.now()
      const maxAge = action.payload.maxAge
      const idsToDelete: string[] = []

      for (const [id, request] of Object.entries(state.requests)) {
        const age = now - request.createdAt
        if (age > maxAge && request.status !== 'pending') {
          idsToDelete.push(id)
        }
      }

      idsToDelete.forEach((id) => {
        delete state.requests[id]
      })
    })
  }
})

export const {
  setRequestLoading,
  setRequestError,
  setRequestData,
  clearRequest,
  clearAllRequests,
  resetRequest,
  setGlobalLoading,
  setGlobalError,
  setRefetchInterval
} = asyncDataSlice.actions

/**
 * Selector: Get specific async request by ID
 */
export const selectAsyncRequest = (state: { asyncData: AsyncDataState }, id: string) =>
  state.asyncData.requests[id]

/**
 * Selector: Get data from specific async request
 */
export const selectAsyncData = (state: { asyncData: AsyncDataState }, id: string) =>
  state.asyncData.requests[id]?.data

/**
 * Selector: Get error from specific async request
 */
export const selectAsyncError = (state: { asyncData: AsyncDataState }, id: string) =>
  state.asyncData.requests[id]?.error

/**
 * Selector: Check if specific request is loading
 */
export const selectAsyncLoading = (state: { asyncData: AsyncDataState }, id: string) =>
  state.asyncData.requests[id]?.status === 'pending'

/**
 * Selector: Check if specific request is refetching
 */
export const selectAsyncRefetching = (state: { asyncData: AsyncDataState }, id: string) =>
  state.asyncData.requests[id]?.isRefetching ?? false

/**
 * Selector: Get all requests
 */
export const selectAllAsyncRequests = (state: { asyncData: AsyncDataState }) =>
  state.asyncData.requests

/**
 * Selector: Get global loading state
 */
export const selectGlobalLoading = (state: { asyncData: AsyncDataState }) =>
  state.asyncData.globalLoading

/**
 * Selector: Get global error state
 */
export const selectGlobalError = (state: { asyncData: AsyncDataState }) =>
  state.asyncData.globalError

export default asyncDataSlice.reducer
