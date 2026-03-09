export interface SeedDataManagerProps {
  isLoaded?: boolean
  isLoading?: boolean
  title?: string
  description?: string
  loadLabel?: string
  loadingLabel?: string
  resetLabel?: string
  resettingLabel?: string
  clearLabel?: string
  clearingLabel?: string
  onLoadSeedData?: () => void
  onResetSeedData?: () => void
  onClearAllData?: () => void
  helperText?: {
    load?: string
    reset?: string
    clear?: string
  }
}
