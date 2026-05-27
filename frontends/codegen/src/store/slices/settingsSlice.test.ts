import { describe, expect, it, vi } from 'vitest'

vi.mock('@/store/middleware/dbalSync', () => ({
  syncToDBAL: vi.fn().mockResolvedValue(undefined),
}))

import reducer, {
  updateSettings,
  setSettings,
  toggleAutoSave,
  toggleAutoSync,
  setSyncInterval,
  type Settings,
} from './settingsSlice'

describe('settingsSlice reducer', () => {
  const defaultSettings: Settings = {
    autoSave: true,
    autoSync: true,
    syncInterval: 30000,
    dbalApiUrl: 'http://localhost:8080',
    useIndexedDB: true,
    theme: 'dark',
    locale: 'en',
  }

  it('returns initial state', () => {
    const state = reducer(undefined, { type: '@@INIT' })
    expect(state.settings).toEqual(defaultSettings)
    expect(state.loading).toBe(false)
    expect(state.error).toBeNull()
  })

  describe('updateSettings', () => {
    it('merges partial settings', () => {
      const state = reducer(undefined, updateSettings({ theme: 'light' }))
      expect(state.settings.theme).toBe('light')
      // other defaults preserved
      expect(state.settings.autoSave).toBe(true)
    })

    it('merges multiple fields at once', () => {
      const state = reducer(undefined, updateSettings({ locale: 'es', syncInterval: 60000 }))
      expect(state.settings.locale).toBe('es')
      expect(state.settings.syncInterval).toBe(60000)
    })
  })

  describe('setSettings', () => {
    it('replaces settings completely', () => {
      const newSettings: Settings = { ...defaultSettings, autoSave: false, theme: 'light' }
      const state = reducer(undefined, setSettings(newSettings))
      expect(state.settings).toEqual(newSettings)
    })
  })

  describe('toggleAutoSave', () => {
    it('toggles autoSave from true to false', () => {
      const state = reducer(undefined, toggleAutoSave())
      expect(state.settings.autoSave).toBe(false)
    })

    it('toggles autoSave from false to true', () => {
      let state = reducer(undefined, toggleAutoSave())
      state = reducer(state, toggleAutoSave())
      expect(state.settings.autoSave).toBe(true)
    })
  })

  describe('toggleAutoSync', () => {
    it('toggles autoSync', () => {
      const state = reducer(undefined, toggleAutoSync())
      expect(state.settings.autoSync).toBe(false)
    })
  })

  describe('setSyncInterval', () => {
    it('sets the sync interval', () => {
      const state = reducer(undefined, setSyncInterval(5000))
      expect(state.settings.syncInterval).toBe(5000)
    })
  })
})
