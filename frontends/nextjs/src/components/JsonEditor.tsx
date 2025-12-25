import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FloppyDisk, X, Warning, ShieldCheck } from '@phosphor-icons/react'
import Editor from '@monaco-editor/react'
import { securityScanner, type SecurityScanResult } from '@/lib/security-scanner'
import { SecurityWarningDialog } from '@/components/SecurityWarningDialog'
import { toast } from 'sonner'

interface JsonEditorProps {
  open: boolean
  onClose: () => void
  title: string
  value: any
  onSave: (value: any) => void
  schema?: any
}

export function JsonEditor({ open, onClose, title, value, onSave, schema }: JsonEditorProps) {
  const [jsonText, setJsonText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [securityScanResult, setSecurityScanResult] = useState<SecurityScanResult | null>(null)
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)

  useEffect(() => {
    if (open) {
      setJsonText(JSON.stringify(value, null, 2))
      setError(null)
      setSecurityScanResult(null)
    }
  }, [open, value])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText)
      
      const scanResult = securityScanner.scanJSON(jsonText)
      setSecurityScanResult(scanResult)

      if (scanResult.severity === 'critical') {
        setShowSecurityDialog(true)
        toast.error('Critical security issues detected - save blocked')
        return
      }

      if (scanResult.severity === 'high' || scanResult.severity === 'medium') {
        setPendingSave(true)
        setShowSecurityDialog(true)
        toast.warning('Security issues detected - review before saving')
        return
      }

      if (scanResult.issues.length > 0) {
        toast.warning(`${scanResult.issues.length} minor security warning(s)`)
      }

      onSave(parsed)
      setError(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const handleForceSave = () => {
    try {
      const parsed = JSON.parse(jsonText)
      onSave(parsed)
      setError(null)
      setPendingSave(false)
      setShowSecurityDialog(false)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  const handleScan = () => {
    const scanResult = securityScanner.scanJSON(jsonText)
    setSecurityScanResult(scanResult)
    setShowSecurityDialog(true)
    
    if (scanResult.safe) {
      toast.success('No security issues detected')
    } else {
      toast.warning(`${scanResult.issues.length} security issue(s) detected`)
    }
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText)
      setJsonText(JSON.stringify(parsed, null, 2))
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON - cannot format')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <Warning className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {securityScanResult && securityScanResult.severity !== 'safe' && securityScanResult.severity !== 'low' && !showSecurityDialog && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <Warning className="h-5 w-5 text-yellow-600" weight="fill" />
                <AlertDescription className="text-yellow-800">
                  {securityScanResult.issues.length} security {securityScanResult.issues.length === 1 ? 'issue' : 'issues'} detected. 
                  Click Security Scan to review.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="border rounded-lg overflow-hidden">
              <Editor
                height="600px"
                language="json"
                value={jsonText}
                onChange={(value) => {
                  setJsonText(value || '')
                  setError(null)
                }}
                theme="vs-dark"
                options={{
                  minimap: { enabled: true },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  lineNumbers: 'on',
                  roundedSelection: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                  bracketPairColorization: {
                    enabled: true,
                  },
                  folding: true,
                  foldingStrategy: 'indentation',
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleScan}>
              <ShieldCheck className="mr-2" />
              Security Scan
            </Button>
            <Button variant="outline" onClick={handleFormat}>
              Format JSON
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
              <FloppyDisk className="mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {securityScanResult && (
        <SecurityWarningDialog
          open={showSecurityDialog}
          onOpenChange={setShowSecurityDialog}
          scanResult={securityScanResult}
          onProceed={pendingSave ? handleForceSave : undefined}
          onCancel={() => {
            setShowSecurityDialog(false)
            setPendingSave(false)
          }}
          codeType="JSON data"
          showProceedButton={pendingSave}
        />
      )}
    </>
  )
}
