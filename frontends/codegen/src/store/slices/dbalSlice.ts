/**
 * DBAL Redux Slice
 *
 * Replaces syncSlice.ts — manages DBAL connection state, sync operations,
 * and admin functions (adapter switching, seed data).
 *
 * State shape:
 *   status      — 'idle' | 'syncing' | 'success' | 'error'
 *   lastSyncedAt — timestamp of last successful sync
 *   dbalConnected — whether the DBAL daemon is reachable
 *   dbalConfig    — current adapter + URL from the daemon
 *   dbalAdapters  — available database adapters
 *   seedResult    — last seed operation result
 *   error         — human-readable error message
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import {
  syncAllToDBAL,
  fetchAllFromDBAL,
  getDBALHealth,
  getDBALConfig,
  getDBALAdapters,
  testDBALConnection,
  switchDBALAdapter,
  seedDBAL,
} from '@/store/middleware/dbalSync'
import type {
  DBALConfigResponse,
  DBALAdapterInfo,
  DBALSeedResult,
} from '@/store/middleware/dbalSync'

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

export type DBALSyncStatus = 'idle' | 'syncing' | 'success' | 'error'

interface DBALState {
  status: DBALSyncStatus
  lastSyncedAt: number | null
  dbalConnected: boolean
  dbalConfig: DBALConfigResponse | null
  dbalAdapters: DBALAdapterInfo[]
  seedResult: DBALSeedResult | null
  error: string | null
}

const initialState: DBALState = {
  status: 'idle',
  lastSyncedAt: null,
  dbalConnected: false,
  dbalConfig: null,
  dbalAdapters: [],
  seedResult: null,
  error: null,
}

// ─────────────────────────────────────────────────────────────────────────────
// Thunks
// ─────────────────────────────────────────────────────────────────────────────

/** Push Redux state to DBAL (bulk sync) */
export const syncToDBALBulk = createAsyncThunk(
  'dbal/syncToDBALBulk',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as any
      const data: Record<string, any[]> = {}

      // Collect all synced slices
      if (state.files?.files) data.files = state.files.files
      if (state.models?.models) data.models = state.models.models
      if (state.components?.components) data.components = state.components.components
      if (state.componentTrees?.trees) data.componentTrees = state.componentTrees.trees
      if (state.workflows?.workflows) data.workflows = state.workflows.workflows
      if (state.lambdas?.lambdas) data.lambdas = state.lambdas.lambdas
      if (state.project) data.project = [state.project]
      if (state.uiState?.data) data.uiState = Object.values(state.uiState.data)

      const result = await syncAllToDBAL(data)
      console.info(`[DBAL] Synced ${result.synced} records, ${result.failed} failed`)
      return Date.now()
    } catch (error: any) {
      return rejectWithValue(error.message || 'Sync to DBAL failed')
    }
  }
)

/** Pull data from DBAL into Redux */
export interface SyncFromDBALPayload {
  timestamp: number
  data: Record<string, any[]>
}

export const syncFromDBALBulk = createAsyncThunk(
  'dbal/syncFromDBALBulk',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchAllFromDBAL()
      return { timestamp: Date.now(), data } as SyncFromDBALPayload
    } catch (error: any) {
      return rejectWithValue(error.message || 'Sync from DBAL failed')
    }
  }
)

/** Check DBAL daemon health and fetch config */
export const checkDBALConnection = createAsyncThunk(
  'dbal/checkConnection',
  async (_, { rejectWithValue }) => {
    try {
      await getDBALHealth()
      const config = await getDBALConfig()
      return { connected: true, config }
    } catch (error: any) {
      return rejectWithValue(error.message || 'DBAL not reachable')
    }
  }
)

/** Fetch available database adapters */
export const fetchDBALAdapters = createAsyncThunk(
  'dbal/fetchAdapters',
  async (_, { rejectWithValue }) => {
    try {
      return await getDBALAdapters()
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch adapters')
    }
  }
)

/** Switch the active database adapter */
export const switchDBALDatabase = createAsyncThunk(
  'dbal/switchDatabase',
  async (
    { adapter, databaseUrl }: { adapter: string; databaseUrl: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await switchDBALAdapter(adapter, databaseUrl)
      if (!result.success) {
        return rejectWithValue(result.message || 'Switch failed')
      }
      // Re-fetch config after switch
      const config = await getDBALConfig()
      return config
    } catch (error: any) {
      return rejectWithValue(error.message || 'Switch failed')
    }
  }
)

/** Test a database connection without switching */
export const testDBALConnectionThunk = createAsyncThunk(
  'dbal/testConnection',
  async (
    { adapter, databaseUrl }: { adapter: string; databaseUrl: string },
    { rejectWithValue }
  ) => {
    try {
      return await testDBALConnection(adapter, databaseUrl)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Test connection failed')
    }
  }
)

/** Load seed data into the database */
export const seedDBALDatabase = createAsyncThunk(
  'dbal/seedDatabase',
  async (
    { force, seedDir }: { force?: boolean; seedDir?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      return await seedDBAL(force, seedDir)
    } catch (error: any) {
      return rejectWithValue(error.message || 'Seed failed')
    }
  }
)

// ─────────────────────────────────────────────────────────────────────────────
// Slice
// ─────────────────────────────────────────────────────────────────────────────

const dbalSlice = createSlice({
  name: 'dbal',
  initialState,
  reducers: {
    resetDBALStatus: (state) => {
      state.status = 'idle'
      state.error = null
    },
    setDBALConnected: (state, action: PayloadAction<boolean>) => {
      state.dbalConnected = action.payload
    },
    clearSeedResult: (state) => {
      state.seedResult = null
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Sync TO DBAL ──────────────────────────────────────
      .addCase(syncToDBALBulk.pending, (state) => {
        state.status = 'syncing'
        state.error = null
      })
      .addCase(syncToDBALBulk.fulfilled, (state, action) => {
        state.status = 'success'
        state.lastSyncedAt = action.payload
      })
      .addCase(syncToDBALBulk.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })

      // ── Sync FROM DBAL ────────────────────────────────────
      .addCase(syncFromDBALBulk.pending, (state) => {
        state.status = 'syncing'
        state.error = null
      })
      .addCase(syncFromDBALBulk.fulfilled, (state, action) => {
        state.status = 'success'
        state.lastSyncedAt = action.payload.timestamp
      })
      .addCase(syncFromDBALBulk.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.payload as string
      })

      // ── Check Connection ──────────────────────────────────
      .addCase(checkDBALConnection.fulfilled, (state, action) => {
        state.dbalConnected = action.payload.connected
        state.dbalConfig = action.payload.config
      })
      .addCase(checkDBALConnection.rejected, (state) => {
        state.dbalConnected = false
        state.dbalConfig = null
      })

      // ── Fetch Adapters ────────────────────────────────────
      .addCase(fetchDBALAdapters.fulfilled, (state, action) => {
        state.dbalAdapters = action.payload
      })

      // ── Switch Database ───────────────────────────────────
      .addCase(switchDBALDatabase.fulfilled, (state, action) => {
        state.dbalConfig = action.payload
      })
      .addCase(switchDBALDatabase.rejected, (state, action) => {
        state.error = action.payload as string
      })

      // ── Seed Database ─────────────────────────────────────
      .addCase(seedDBALDatabase.fulfilled, (state, action) => {
        state.seedResult = action.payload
      })
      .addCase(seedDBALDatabase.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { resetDBALStatus, setDBALConnected, clearSeedResult } = dbalSlice.actions
export default dbalSlice.reducer
