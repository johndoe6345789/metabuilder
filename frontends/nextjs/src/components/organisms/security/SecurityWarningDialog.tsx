/**
 * SecurityWarningDialog - Organism Component
 *
 * This component is categorized as an organism (not a molecule) because:
 * 1. It contains complex data processing (groups security issues by severity)
 * 2. It implements security-specific business rules (severity ordering, badge variants)
 * 3. It's a feature-specific component for security scanning results
 * 4. It exceeds the recommended 150 LOC guideline for molecules (235 LOC)
 *
 * See: docs/analysis/molecule-organism-audit.md for full categorization analysis
 */

import { Dialog, DialogContent } from '@/components/ui'
import type { SecurityScanResult } from '@/lib/security/scanner/security-scanner'

import { ActionButtons } from './ActionButtons'
import { SecurityMessage } from './SecurityMessage'

interface SecurityWarningDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scanResult: SecurityScanResult
  onProceed?: () => void
  onCancel?: () => void
  codeType?: string
  showProceedButton?: boolean
}

export function SecurityWarningDialog({
  open,
  onOpenChange,
  scanResult,
  onProceed,
  onCancel,
  codeType = 'code',
  showProceedButton = false,
}: SecurityWarningDialogProps) {
  const closeDialog = () => {
    onOpenChange(false)
  }

  const handleProceed = () => {
    if (onProceed) {
      onProceed()
    }
    closeDialog()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    closeDialog()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <SecurityMessage scanResult={scanResult} codeType={codeType} />
        <ActionButtons
          scanResult={scanResult}
          onCancel={handleCancel}
          onProceed={showProceedButton ? handleProceed : undefined}
          showProceedButton={showProceedButton}
        />
      </DialogContent>
    </Dialog>
  )
}
