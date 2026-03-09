export interface PWACacheSectionProps {
  cacheSize: string
  hasRegistration: boolean
  onClearCache: () => void
  title: string
  description: string
  sizeLabel: string
  serviceWorkerLabel: string
  activeStatus: string
  inactiveStatus: string
  clearAction: string
  helper: string
}
