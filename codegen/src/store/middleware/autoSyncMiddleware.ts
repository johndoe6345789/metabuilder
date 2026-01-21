import { Middleware } from '@reduxjs/toolkit'
import { syncToFlaskBulk, checkFlaskConnection } from '../slices/syncSlice'
import { RootState } from '../index'
import { itemChangeActionTypes } from '../actionNames'

interface AutoSyncConfig {
  enabled: boolean
  intervalMs: number
  syncOnChange: boolean
  maxQueueSize: number
}

export class AutoSyncManager {
  private config: AutoSyncConfig = {
    enabled: false,
    intervalMs: 30000,
    syncOnChange: false,
    maxQueueSize: 50,
  }

  private timer: ReturnType<typeof setTimeout> | null = null
  private lastSyncTime = 0
  private changeCounter = 0
  private inFlight = false
  private pendingSync = false
  private dispatch: any = null

  configure(config: Partial<AutoSyncConfig>) {
    this.config = { ...this.config, ...config }
    
    if (this.config.enabled) {
      this.start()
    } else {
      this.stop()
    }
  }

  setDispatch(dispatch: any) {
    this.dispatch = dispatch
  }

  start() {
    if (this.timer || !this.dispatch) return

    this.timer = setInterval(() => {
      if (this.shouldSync()) {
        this.performSync()
      }
    }, this.config.intervalMs)

    this.dispatch(checkFlaskConnection())
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private shouldSync(): boolean {
    if (!this.config.enabled) return false

    const timeSinceLastSync = Date.now() - this.lastSyncTime
    if (timeSinceLastSync < this.config.intervalMs) return false

    if (this.config.syncOnChange && this.changeCounter === 0) return false

    return true
  }

  private async performSync() {
    if (!this.dispatch) return
    if (this.inFlight) {
      this.pendingSync = true
      return
    }

    this.inFlight = true
    try {
      await this.dispatch(syncToFlaskBulk())
      this.lastSyncTime = Date.now()
      this.changeCounter = 0
    } catch (error) {
      console.error('[AutoSync] Sync failed:', error)
    } finally {
      this.inFlight = false
    }

    if (this.pendingSync) {
      this.pendingSync = false
      await this.performSync()
    }
  }

  trackChange() {
    this.changeCounter++
    if (this.inFlight) {
      this.pendingSync = true
    }
    
    if (this.changeCounter >= this.config.maxQueueSize && this.config.syncOnChange) {
      this.performSync()
    }
  }

  getConfig(): AutoSyncConfig {
    return { ...this.config }
  }

  getStatus() {
    return {
      enabled: this.config.enabled,
      lastSyncTime: this.lastSyncTime,
      changeCounter: this.changeCounter,
      nextSyncIn: this.config.enabled 
        ? Math.max(0, this.config.intervalMs - (Date.now() - this.lastSyncTime))
        : null,
    }
  }

  async syncNow() {
    await this.performSync()
  }
}

export const autoSyncManager = new AutoSyncManager()

export const createAutoSyncMiddleware = (): Middleware => {
  return (storeAPI) => {
    autoSyncManager.setDispatch(storeAPI.dispatch)

    return (next) => (action: any) => {
      const result = next(action)

      if (!action.type) return result

      if (action.type === 'settings/updateSettings' && action.payload?.autoSync !== undefined) {
        const state = storeAPI.getState() as RootState
        const { autoSync, autoSyncInterval } = (state.settings as any) || {}
        
        autoSyncManager.configure({
          enabled: autoSync ?? false,
          intervalMs: autoSyncInterval ?? 30000,
        })
      }

      if (itemChangeActionTypes.has(action.type)) {
        autoSyncManager.trackChange()
      }

      return result
    }
  }
}

export const configureAutoSync = (config: Partial<AutoSyncConfig>) => autoSyncManager.configure(config)
export const getAutoSyncStatus = () => autoSyncManager.getStatus()
export const triggerAutoSync = () => autoSyncManager.syncNow()
