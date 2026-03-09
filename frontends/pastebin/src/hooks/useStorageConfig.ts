import { useState, useCallback } from 'react'
import { toast } from '@metabuilder/components/fakemui'
import {
  saveStorageConfig,
  loadStorageConfig,
  type StorageBackend
} from '@/lib/storage'
import { useTranslation } from '@/hooks/useTranslation'

export function useStorageConfig() {
  const t = useTranslation()
  const [storageBackend, setStorageBackend] = useState<StorageBackend>('indexeddb')
  const [envVarSet, setEnvVarSet] = useState(false)

  const loadConfig = useCallback(() => {
    const config = loadStorageConfig()
    const envDbalUrl = process.env.NEXT_PUBLIC_DBAL_API_URL
    const isEnvSet = Boolean(envDbalUrl)

    setEnvVarSet(isEnvSet)
    setStorageBackend(config.backend)
  }, [])

  const handleSaveStorageConfig = useCallback(async (onSuccess?: () => Promise<void>) => {
    saveStorageConfig({
      backend: storageBackend,
    })

    toast.success(t.settings.storage.backendUpdated)

    if (onSuccess) {
      await onSuccess()
    }
  }, [storageBackend])

  return {
    storageBackend,
    setStorageBackend,
    envVarSet,
    loadConfig,
    handleSaveStorageConfig,
  }
}
