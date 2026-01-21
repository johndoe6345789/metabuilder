import { useState } from 'react'
import {
  type PersistenceConfig,
  getPersistenceConfig,
  updatePersistenceConfig,
  enablePersistence,
  disablePersistence,
  enableLogging,
  disableLogging,
  setDebounceDelay,
} from '../middleware'

export function usePersistenceConfig() {
  const [config, setConfig] = useState<PersistenceConfig>(getPersistenceConfig())

  const refreshConfig = () => {
    setConfig(getPersistenceConfig())
  }

  const updateConfig = (partial: Partial<PersistenceConfig>) => {
    updatePersistenceConfig(partial)
    refreshConfig()
  }

  const togglePersistence = () => {
    if (config.enabled) {
      disablePersistence()
    } else {
      enablePersistence()
    }
    refreshConfig()
  }

  const toggleLogging = () => {
    if (config.logging) {
      disableLogging()
    } else {
      enableLogging()
    }
    refreshConfig()
  }

  const updateDebounceDelay = (ms: number) => {
    setDebounceDelay(ms)
    refreshConfig()
  }

  return {
    config,
    updateConfig,
    togglePersistence,
    toggleLogging,
    updateDebounceDelay,
    refreshConfig,
  }
}
