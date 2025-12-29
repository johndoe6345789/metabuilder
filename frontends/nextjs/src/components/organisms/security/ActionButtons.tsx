import { Button } from '@/components/ui'
import { DialogFooter } from '@/components/ui'
import type { SecurityScanResult } from '@/lib/security/scanner/security-scanner'

interface ActionButtonsProps {
  scanResult: SecurityScanResult
  onCancel: () => void
  onProceed?: () => void
  showProceedButton?: boolean
}

export function ActionButtons({
  scanResult,
  onCancel,
  onProceed,
  showProceedButton = false,
}: ActionButtonsProps) {
  const disableProceed = scanResult.severity === 'critical'

  return (
    <DialogFooter className="flex-col sm:flex-row gap-2">
      <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
        {scanResult.safe ? 'Close' : 'Cancel'}
      </Button>

      {!scanResult.safe && showProceedButton && (
        <Button
          variant={scanResult.severity === 'critical' ? 'destructive' : 'default'}
          onClick={onProceed}
          disabled={disableProceed}
          className="w-full sm:w-auto"
        >
          {scanResult.severity === 'critical'
            ? 'Force Proceed (Not Recommended)'
            : 'Proceed Anyway'}
        </Button>
      )}
    </DialogFooter>
  )
}
