import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { SchemaConfig } from '@/lib/schema-types'
import { FloppyDisk, X, Warning } from '@phosphor-icons/react'

interface SchemaEditorProps {
  open: boolean
  onClose: () => void
  schema: SchemaConfig
  onSave: (schema: SchemaConfig) => void
}

export function SchemaEditor({ open, onClose, schema, onSave }: SchemaEditorProps) {
  const [schemaText, setSchemaText] = useState(JSON.stringify(schema, null, 2))
  const [error, setError] = useState<string | null>(null)

  const handleSave = () => {
    try {
      const parsed = JSON.parse(schemaText)
      
      if (!parsed.apps || !Array.isArray(parsed.apps)) {
        setError('Schema must have an "apps" array')
        return
      }

      onSave(parsed)
      setError(null)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit Schema Configuration</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <Warning className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Textarea
            value={schemaText}
            onChange={(e) => {
              setSchemaText(e.target.value)
              setError(null)
            }}
            className="font-mono text-sm min-h-[500px]"
            placeholder="Enter JSON schema..."
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
            <FloppyDisk className="mr-2" />
            Save Schema
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
