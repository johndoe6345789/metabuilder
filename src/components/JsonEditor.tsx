import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FloppyDisk, X, Warning } from '@phosphor-icons/react'
import Editor from '@monaco-editor/react'

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

  useEffect(() => {
    if (open) {
      setJsonText(JSON.stringify(value, null, 2))
      setError(null)
    }
  }, [open, value])

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonText)
      onSave(parsed)
      setError(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
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
  )
}
