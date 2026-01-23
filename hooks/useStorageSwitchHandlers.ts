import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { formatStorageError } from './storageSettingsUtils'
import { storageSettingsCopy, type StorageBackendKey } from './storageSettingsConfig'

type SwitchHandlers = {
  backend: StorageBackendKey | null
  flaskUrl: string
  switchToFlask: (url: string) => Promise<void>
  switchToSQLite: () => Promise<void>
  switchToIndexedDB: () => Promise<void>
}

export const useStorageSwitchHandlers = ({
  backend,
  flaskUrl,
  switchToFlask,
  switchToSQLite,
  switchToIndexedDB,
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
  }, [backend, flaskUrl, switchToFlask])

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
  }, [backend, switchToSQLite])

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
  }, [backend, switchToIndexedDB])

  return {
    isSwitching,
    handleSwitchToFlask,
    handleSwitchToSQLite,
    handleSwitchToIndexedDB,
  }
}
