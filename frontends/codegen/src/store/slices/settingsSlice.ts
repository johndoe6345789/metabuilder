import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { syncToDBAL } from '@/store/middleware/dbalSync'

export interface Settings {
  autoSave: boolean
  autoSync: boolean
  syncInterval: number
  dbalApiUrl: string
  useIndexedDB: boolean
  theme: 'light' | 'dark' | 'system'
  locale: string
}

interface SettingsState {
  settings: Settings
  loading: boolean
  error: string | null
}

const initialState: SettingsState = {
  settings: {
    autoSave: true,
    autoSync: true,
    syncInterval: 30000,
    dbalApiUrl: 'http://localhost:8080',
    useIndexedDB: true,
    theme: 'dark',
    locale: 'en',
  },
  loading: false,
  error: null,
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      state.settings = {
        ...state.settings,
        ...action.payload,
      }
      syncToDBAL('settings', 'app', state.settings).catch(console.error)
    },
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.settings = action.payload
    },
    toggleAutoSave: (state) => {
      state.settings.autoSave = !state.settings.autoSave
      syncToDBAL('settings', 'app', state.settings).catch(console.error)
    },
    toggleAutoSync: (state) => {
      state.settings.autoSync = !state.settings.autoSync
      syncToDBAL('settings', 'app', state.settings).catch(console.error)
    },
    setSyncInterval: (state, action: PayloadAction<number>) => {
      state.settings.syncInterval = action.payload
      syncToDBAL('settings', 'app', state.settings).catch(console.error)
    },
  },
})

export const { 
  updateSettings, 
  setSettings, 
  toggleAutoSave, 
  toggleAutoSync, 
  setSyncInterval 
} = settingsSlice.actions

export default settingsSlice.reducer
