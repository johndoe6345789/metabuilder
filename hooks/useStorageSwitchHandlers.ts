import { useCallback, useState } from 'react'
import { formatStorageError } from './storageSettingsUtils'
import { storageSettingsCopy, type StorageBackendKey } from './storageSettingsConfig'
import type { ToastNotifier } from './useStorageDataHandlers'

/**
 * Extended toast notifier with info method for informational messages
 */
export type ToastNotifierWithInfo = ToastNotifier & {
  info: (message: string) => void
}

/**
 * Default no-op toast implementation
 */
const noopToast: ToastNotifierWithInfo = {
  success: () => {},
  error: () => {},
  info: () => {},
}

type SwitchHandlers = {
  backend: StorageBackendKey | null
  flaskUrl: string
  switchToFlask: (url: string) => Promise<void>
  switchToSQLite: () => Promise<void>
  switchToIndexedDB: () => Promise<void>
  /** Optional toast notifier - if not provided, notifications are silently ignored */
  toast?: ToastNotifierWithInfo
}

export const useStorageSwitchHandlers = ({
  backend,
  flaskUrl,
  switchToFlask,
  switchToSQLite,
  switchToIndexedDB,
  toast = noopToast,
}: SwitchHandlers) => {
  const [isSwitching, setIsSwitching] = useState(false)

  const handleSwitchToFlask = useCallback(async () => {
    if (backend === 'flask') {
      toast.info(storageSettingsCopy.toasts.alreadyUsing.flask)
      return
    }

    if (!flaskUrl) {
      toast.error(storageSettingsCopy.toasts.errors.missingFlaskUrl)
      return
    }

    setIsSwitching(true)
    try {
      await switchToFlask(flaskUrl)
      toast.success(storageSettingsCopy.toasts.success.switchFlask)
    } catch (error) {
      toast.error(`${storageSettingsCopy.toasts.failure.switchFlask}: ${formatStorageError(error)}`)
    } finally {
      setIsSwitching(false)
    }
  }, [backend, flaskUrl, switchToFlask, toast])

  const handleSwitchToSQLite = useCallback(async () => {
    if (backend === 'sqlite') {
      toast.info(storageSettingsCopy.toasts.alreadyUsing.sqlite)
      return
    }

    setIsSwitching(true)
    try {
      await switchToSQLite()
      toast.success(storageSettingsCopy.toasts.success.switchSQLite)
    } catch (error) {
      toast.error(`${storageSettingsCopy.toasts.failure.switchSQLite}: ${formatStorageError(error)}`)
    } finally {
      setIsSwitching(false)
    }
  }, [backend, switchToSQLite, toast])

  const handleSwitchToIndexedDB = useCallback(async () => {
    if (backend === 'indexeddb') {
      toast.info(storageSettingsCopy.toasts.alreadyUsing.indexeddb)
      return
    }

    setIsSwitching(true)
    try {
      await switchToIndexedDB()
      toast.success(storageSettingsCopy.toasts.success.switchIndexedDB)
    } catch (error) {
      toast.error(`${storageSettingsCopy.toasts.failure.switchIndexedDB}: ${formatStorageError(error)}`)
    } finally {
      setIsSwitching(false)
    }
  }, [backend, switchToIndexedDB, toast])

  return {
    isSwitching,
    handleSwitchToFlask,
    handleSwitchToSQLite,
    handleSwitchToIndexedDB,
  }
}
