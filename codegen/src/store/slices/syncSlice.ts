import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { 
  syncAllToFlask, 
  fetchAllFromFlask, 
  getFlaskStats, 
  clearFlaskStorage 
} from '@/store/middleware/flaskSync'
import { db } from '@/lib/db'

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error'

const SYNCABLE_STORES = new Set(['files', 'models', 'components', 'workflows'])

interface SyncState {
  status: SyncStatus
  lastSyncedAt: number | null
  flaskConnected: boolean
  flaskStats: {
    totalKeys: number
    totalSizeBytes: number
  } | null
  error: string | null
}

const initialState: SyncState = {
  status: 'idle',
  lastSyncedAt: null,
  flaskConnected: false,
  flaskStats: null,
  error: null,
}

export const syncToFlaskBulk = createAsyncThunk(
  'sync/syncToFlaskBulk',
  async (_, { rejectWithValue }) => {
    try {
      const data: Record<string, any> = {}
      
      const files = await db.getAll('files')
      const models = await db.getAll('models')
      const components = await db.getAll('components')
      const workflows = await db.getAll('workflows')
      
      files.forEach((file: any) => {
        data[`files:${file.id}`] = file
      })
      
      models.forEach((model: any) => {
        data[`models:${model.id}`] = model
      })
      
      components.forEach((component: any) => {
        data[`components:${component.id}`] = component
      })
      
      workflows.forEach((workflow: any) => {
        data[`workflows:${workflow.id}`] = workflow
      })
      
      await syncAllToFlask(data)
      return Date.now()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const syncFromFlaskBulk = createAsyncThunk(
  'sync/syncFromFlaskBulk',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllFromFlask()
      const allowedStoreNames = new Set(['files', 'models', 'components', 'workflows'])
      const serverIdsByStore = {
        files: new Set<string>(),
        models: new Set<string>(),
        components: new Set<string>(),
        workflows: new Set<string>(),
      }

      for (const [key, value] of Object.entries(data)) {
        if (typeof key !== 'string') {
          continue
        }

        const parts = key.split(':')
        if (parts.length !== 2) {
          continue
        }

        const [storeName, id] = parts
        if (!storeName || !id) {
          continue
        }

        if (!allowedStoreNames.has(storeName)) {
          continue
        }

        serverIdsByStore[storeName as keyof typeof serverIdsByStore].add(id)
        await db.put(storeName as any, value)
      }

      // Explicit merge strategy: server is source of truth; delete local records missing from server response.
      const storeNames = Array.from(allowedStoreNames)
      for (const storeName of storeNames) {
        const localRecords = await db.getAll(storeName as any)
        for (const record of localRecords) {
          const recordId = record?.id
          const recordIdString = recordId == null ? '' : String(recordId)
          if (!serverIdsByStore[storeName as keyof typeof serverIdsByStore].has(recordIdString)) {
            await db.delete(storeName as any, recordId)
          }
        }
      }
      
      return Date.now()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const checkFlaskConnection = createAsyncThunk(
  'sync/checkConnection',
  async (_, { rejectWithValue }) => {
    try {
      const stats = await getFlaskStats()
      return {
        connected: true,
        stats: {
          totalKeys: stats.total_keys,
          totalSizeBytes: stats.total_size_bytes,
        },
      }
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

export const clearFlask = createAsyncThunk(
  'sync/clearFlask',
  async (_, { rejectWithValue }) => {
    try {
      await clearFlaskStorage()
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    resetSyncStatus: (state) => {
      state.status = 'idle'
      state.error = null
    },
    setFlaskConnected: (state, action: PayloadAction<boolean>) => {
      state.flaskConnected = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncToFlaskBulk.pending, (state) => {
        state.status = 'syncing'
        state.error = null
      })
      .addCase(syncToFlaskBulk.fulfilled, (state, action) => {
        state.status = 'success'
        state.lastSyncedAt = action.payload
      })
      .addCase(syncToFlaskBulk.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })
      .addCase(syncFromFlaskBulk.pending, (state) => {
        state.status = 'syncing'
        state.error = null
      })
      .addCase(syncFromFlaskBulk.fulfilled, (state, action) => {
        state.status = 'success'
        state.lastSyncedAt = action.payload
      })
      .addCase(syncFromFlaskBulk.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })
      .addCase(checkFlaskConnection.fulfilled, (state, action) => {
        state.flaskConnected = action.payload.connected
        state.flaskStats = action.payload.stats
      })
      .addCase(checkFlaskConnection.rejected, (state) => {
        state.flaskConnected = false
        state.flaskStats = null
      })
      .addCase(clearFlask.fulfilled, (state) => {
        state.flaskStats = {
          totalKeys: 0,
          totalSizeBytes: 0,
        }
      })
  },
})

export const { resetSyncStatus, setFlaskConnected } = syncSlice.actions
export default syncSlice.reducer
