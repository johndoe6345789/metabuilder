import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { syncToFlask } from '@/store/middleware/flaskSync'

export interface Settings {
  autoSave: boolean
  autoSync: boolean
  syncInterval: number
  flaskApiUrl: string
  useIndexedDB: boolean
  theme: 'light' | 'dark' | 'system'
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
    flaskApiUrl: 'http://localhost:5001',
    useIndexedDB: true,
    theme: 'dark',
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
      syncToFlask('settings', 'app', state.settings).catch(console.error)
    },
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.settings = action.payload
    },
    toggleAutoSave: (state) => {
      state.settings.autoSave = !state.settings.autoSave
      syncToFlask('settings', 'app', state.settings).catch(console.error)
    },
    toggleAutoSync: (state) => {
      state.settings.autoSync = !state.settings.autoSync
      syncToFlask('settings', 'app', state.settings).catch(console.error)
    },
    setSyncInterval: (state, action: PayloadAction<number>) => {
      state.settings.syncInterval = action.payload
      syncToFlask('settings', 'app', state.settings).catch(console.error)
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
