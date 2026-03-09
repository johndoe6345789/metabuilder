import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ConflictItem, ConflictResolutionStrategy, ConflictResolutionResult, EntityType } from '@/types/conflicts'
import { fetchAllFromDBAL } from '@/store/middleware/dbalSync'

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

const STORE_STATE_KEYS: Record<string, { stateKey: string; itemsKey: string }> = {
  files: { stateKey: 'files', itemsKey: 'files' },
  models: { stateKey: 'models', itemsKey: 'models' },
  components: { stateKey: 'components', itemsKey: 'components' },
  workflows: { stateKey: 'workflows', itemsKey: 'workflows' },
  lambdas: { stateKey: 'lambdas', itemsKey: 'lambdas' },
  componentTrees: { stateKey: 'componentTrees', itemsKey: 'trees' },
}

const UPDATE_ACTION_TYPES: Record<string, string> = {
  files: 'files/updateFile',
  models: 'models/updateModel',
  components: 'components/updateComponent',
  workflows: 'workflows/updateWorkflow',
  lambdas: 'lambdas/updateLambda',
  componentTrees: 'componentTrees/updateTree',
}

export const detectConflicts = createAsyncThunk(
  'conflicts/detectConflicts',
  async (_, { getState, rejectWithValue }) => {
    try {
      const remoteData = await fetchAllFromDBAL()
      const state = getState() as any
      const conflicts: ConflictItem[] = []

      for (const [key, remoteValue] of Object.entries(remoteData)) {
        const [storeName, id] = key.split(':')

        const mapping = STORE_STATE_KEYS[storeName]
        if (!mapping) continue

        const localItems = state[mapping.stateKey]?.[mapping.itemsKey] as any[]
        if (!localItems) continue

        const localValue = localItems.find((item: any) => item.id === id)

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
    { getState, dispatch, rejectWithValue }
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

      const actionType = UPDATE_ACTION_TYPES[storeName]
      if (actionType) {
        dispatch({ type: actionType, payload: { ...resolvedVersion, id } })
      }

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
