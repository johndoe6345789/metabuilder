import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Editor from '@monaco-editor/react'
import { FloppyDisk, X, ShieldCheck, Warning } from '@phosphor-icons/react'
import { securityScanner, type SecurityScanResult } from '@/lib/security-scanner'
import { SecurityWarningDialog } from '@/components/SecurityWarningDialog'
import { toast } from 'sonner'

interface CodeEditorProps {
  open: boolean
  onClose: () => void
  code: string
  onSave: (code: string) => void
  componentName: string
}

export function CodeEditor({ open, onClose, code, onSave, componentName }: CodeEditorProps) {
  const [editorCode, setEditorCode] = useState(code || '// Write your custom code here\n')
  const [securityScanResult, setSecurityScanResult] = useState<SecurityScanResult | null>(null)
  const [showSecurityDialog, setShowSecurityDialog] = useState(false)
  const [pendingSave, setPendingSave] = useState(false)

  const handleSave = () => {
    const scanResult = securityScanner.scanJavaScript(editorCode)
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

    onSave(editorCode)
    onClose()
  }

  const handleForceSave = () => {
    setPendingSave(false)
    setShowSecurityDialog(false)
    onSave(editorCode)
    onClose()
  }

  const handleScan = () => {
    const scanResult = securityScanner.scanJavaScript(editorCode)
    setSecurityScanResult(scanResult)
    setShowSecurityDialog(true)
    
    if (scanResult.safe) {
      toast.success('No security issues detected')
    } else {
      toast.warning(`${scanResult.issues.length} security issue(s) detected`)
    }
  }

  const handleEditorChange = (value: string | undefined) => {
    setEditorCode(value || '')
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Code Editor - {componentName}</DialogTitle>
            <DialogDescription>
              Write custom JavaScript code for this component. Access component props via <code className="bg-muted px-1 rounded">props</code>.
            </DialogDescription>
          </DialogHeader>

          {securityScanResult && securityScanResult.severity !== 'safe' && securityScanResult.severity !== 'low' && !showSecurityDialog && (
            <Alert className="border-yellow-200 bg-yellow-50">
              <Warning className="h-5 w-5 text-yellow-600" weight="fill" />
              <AlertDescription className="text-yellow-800">
                {securityScanResult.issues.length} security {securityScanResult.issues.length === 1 ? 'issue' : 'issues'} detected. 
                Click Security Scan to review.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex-1 border rounded-md overflow-hidden">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={editorCode}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
              }}
            />
          </div>

          <div className="flex justify-between gap-2 pt-4">
            <Button variant="outline" onClick={handleScan}>
              <ShieldCheck className="mr-2" />
              Security Scan
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-primary">
                <FloppyDisk className="mr-2" />
                Save Code
              </Button>
            </div>
          </div>
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
          codeType="JavaScript code"
          showProceedButton={pendingSave}
        />
      )}
    </>
  )
}
