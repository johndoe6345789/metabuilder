/**
 * Hook for getting storage backend icon and copy
 */
import type { StorageBackendKey } from '@/components/storage/storageSettingsConfig'
import { getBackendCopy } from '@/components/storage/storageSettingsConfig'

export interface BackendInfo {
  iconName: string
  iconWeight: string
  moleculeLabel: string
}

export function useStorageBackendInfo(backend: StorageBackendKey | null): BackendInfo {
  const iconMap: Record<StorageBackendKey | 'null', { iconName: string; iconWeight: string }> = {
    flask: { iconName: 'Cpu', iconWeight: 'regular' },
    indexeddb: { iconName: 'HardDrive', iconWeight: 'regular' },
    sqlite: { iconName: 'Database', iconWeight: 'regular' },
    sparkkv: { iconName: 'Cloud', iconWeight: 'regular' },
    null: { iconName: 'Database', iconWeight: 'regular' }
  }
  
  const icon = iconMap[backend || 'null']
  const backendCopy = getBackendCopy(backend)
  
  return {
    iconName: icon.iconName,
    iconWeight: icon.iconWeight,
    moleculeLabel: backendCopy.moleculeLabel
  }
}
