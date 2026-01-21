import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ConflictItem, ConflictResolutionStrategy, ConflictResolutionResult, EntityType } from '@/types/conflicts'
import { db } from '@/lib/db'
import { fetchAllFromFlask } from '@/store/middleware/flaskSync'

interface ConflictsState {
  conflicts: ConflictItem[]
  autoResolveStrategy: ConflictResolutionStrategy | null
  detectingConflicts: boolean
  resolvingConflict: string | null
  error: string | null
}

const initialState: ConflictsState = {
  conflicts: [],
  autoResolveStrategy: null,
  detectingConflicts: false,
  resolvingConflict: null,
  error: null,
}

export const detectConflicts = createAsyncThunk(
  'conflicts/detectConflicts',
  async (_, { rejectWithValue }) => {
    try {
      const remoteData = await fetchAllFromFlask()
      const conflicts: ConflictItem[] = []

      for (const [key, remoteValue] of Object.entries(remoteData)) {
        const [storeName, id] = key.split(':')
        
        if (storeName === 'files' || 
            storeName === 'models' || 
            storeName === 'components' || 
            storeName === 'workflows' ||
            storeName === 'lambdas' ||
            storeName === 'componentTrees') {
          
          const localValue = await db.get(storeName as any, id)
          
          if (localValue && remoteValue) {
            const localTimestamp = localValue.updatedAt || localValue.timestamp || 0
            const remoteTimestamp = (remoteValue as any).updatedAt || (remoteValue as any).timestamp || 0
            
            if (localTimestamp !== remoteTimestamp) {
              const localHash = JSON.stringify(localValue)
              const remoteHash = JSON.stringify(remoteValue)
              
              if (localHash !== remoteHash) {
                conflicts.push({
                  id: `${storeName}:${id}`,
                  entityType: storeName as EntityType,
                  localVersion: localValue,
                  remoteVersion: remoteValue,
                  localTimestamp,
                  remoteTimestamp,
                  conflictDetectedAt: Date.now(),
                })
              }
            }
          }
        }
      }

      return conflicts
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const resolveConflict = createAsyncThunk(
  'conflicts/resolveConflict',
  async (
    { conflictId, strategy, customVersion }: { 
      conflictId: string
      strategy: ConflictResolutionStrategy
      customVersion?: any 
    },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as any
      const conflict = state.conflicts.conflicts.find((c: ConflictItem) => c.id === conflictId)
      
      if (!conflict) {
        throw new Error('Conflict not found')
      }

      let resolvedVersion: any

      switch (strategy) {
        case 'local':
          resolvedVersion = conflict.localVersion
          break
        case 'remote':
          resolvedVersion = conflict.remoteVersion
          break
        case 'manual':
          if (!customVersion) {
            throw new Error('Custom version required for manual resolution')
          }
          resolvedVersion = customVersion
          break
        case 'merge':
          resolvedVersion = {
            ...conflict.remoteVersion,
            ...conflict.localVersion,
            updatedAt: Date.now(),
            mergedAt: Date.now(),
          }
          break
        default:
          throw new Error('Invalid resolution strategy')
      }

      const [storeName, id] = conflict.id.split(':')
      await db.put(storeName as any, { ...resolvedVersion, id })

      const result: ConflictResolutionResult = {
        conflictId,
        strategy,
        resolvedVersion,
        timestamp: Date.now(),
      }

      return result
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const resolveAllConflicts = createAsyncThunk(
  'conflicts/resolveAllConflicts',
  async (strategy: ConflictResolutionStrategy, { getState, dispatch, rejectWithValue }) => {
    try {
      const state = getState() as any
      const conflicts = state.conflicts.conflicts as ConflictItem[]

      const results: ConflictResolutionResult[] = []

      for (const conflict of conflicts) {
        const result = await dispatch(
          resolveConflict({ conflictId: conflict.id, strategy })
        ).unwrap()
        results.push(result)
      }

      return results
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const conflictsSlice = createSlice({
  name: 'conflicts',
  initialState,
  reducers: {
    clearConflicts: (state) => {
      state.conflicts = []
      state.error = null
    },
    setAutoResolveStrategy: (state, action: PayloadAction<ConflictResolutionStrategy | null>) => {
      state.autoResolveStrategy = action.payload
    },
    removeConflict: (state, action: PayloadAction<string>) => {
      state.conflicts = state.conflicts.filter(c => c.id !== action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(detectConflicts.pending, (state) => {
        state.detectingConflicts = true
        state.error = null
      })
      .addCase(detectConflicts.fulfilled, (state, action) => {
        state.detectingConflicts = false
        state.conflicts = action.payload
      })
      .addCase(detectConflicts.rejected, (state, action) => {
        state.detectingConflicts = false
        state.error = action.payload as string
      })
      .addCase(resolveConflict.pending, (state, action) => {
        state.resolvingConflict = action.meta.arg.conflictId
        state.error = null
      })
      .addCase(resolveConflict.fulfilled, (state, action) => {
        state.resolvingConflict = null
        state.conflicts = state.conflicts.filter(c => c.id !== action.payload.conflictId)
      })
      .addCase(resolveConflict.rejected, (state, action) => {
        state.resolvingConflict = null
        state.error = action.payload as string
      })
      .addCase(resolveAllConflicts.pending, (state) => {
        state.error = null
      })
      .addCase(resolveAllConflicts.fulfilled, (state) => {
        state.conflicts = []
      })
      .addCase(resolveAllConflicts.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearConflicts, setAutoResolveStrategy, removeConflict } = conflictsSlice.actions
export default conflictsSlice.reducer
