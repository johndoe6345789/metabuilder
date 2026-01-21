export interface ErrorPanelHeaderProps {
  title: string
  scanLabel: string
  scanningLabel: string
  repairAllLabel: string
  repairingLabel: string
  errorCount: number
  warningCount: number
  errorLabel: string
  errorsLabel: string
  warningLabel: string
  warningsLabel: string
  isScanning: boolean
  isRepairing: boolean
  onScan: () => void
  onRepairAll: () => void
}
