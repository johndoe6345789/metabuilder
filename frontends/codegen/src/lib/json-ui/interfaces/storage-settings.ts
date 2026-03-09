import type { StorageBackendKey } from '@/components/storage/storageSettingsConfig'

export interface StorageSettingsProps {
  backend?: StorageBackendKey | null
  isLoading?: boolean
  flaskUrl?: string
  isSwitching?: boolean
  onFlaskUrlChange?: (value: string) => void
  onSwitchToFlask?: () => void
  onSwitchToIndexedDB?: () => void
  onSwitchToSQLite?: () => void
  isExporting?: boolean
  isImporting?: boolean
  onExport?: () => void
  onImport?: () => void
}
