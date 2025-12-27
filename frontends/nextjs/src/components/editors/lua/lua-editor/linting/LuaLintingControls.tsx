import { SecurityWarningDialog } from '@/components/organisms/security/SecurityWarningDialog'
import type { SecurityScanResult } from '@/lib/security-scanner'

interface LuaLintingControlsProps {
  scanResult: SecurityScanResult | null
  showDialog: boolean
  onDialogChange: (open: boolean) => void
  onProceed: () => void
}

export const LuaLintingControls = ({
  scanResult,
  showDialog,
  onDialogChange,
  onProceed,
}: LuaLintingControlsProps) => {
  if (!scanResult) return null

  return (
    <SecurityWarningDialog
      open={showDialog}
      onOpenChange={onDialogChange}
      scanResult={scanResult}
      onProceed={onProceed}
      onCancel={() => onDialogChange(false)}
      codeType="Lua script"
      showProceedButton
    />
  )
}
