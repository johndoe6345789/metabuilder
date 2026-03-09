export type SaveIndicatorStatus = 'saved' | 'synced'

export interface SaveIndicatorProps {
  lastSaved?: number | null
  status?: SaveIndicatorStatus
  label?: string
  showLabel?: boolean
  animate?: boolean
  className?: string
}
