import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import Editor from '@monaco-editor/react'
import { FloppyDisk, X } from '@phosphor-icons/react'

interface CodeEditorProps {
  open: boolean
  onClose: () => void
  code: string
  onSave: (code: string) => void
  componentName: string
}

export function CodeEditor({ open, onClose, code, onSave, componentName }: CodeEditorProps) {
  const [editorCode, setEditorCode] = useState(code || '// Write your custom code here\n')

  const handleSave = () => {
    onSave(editorCode)
    onClose()
  }

  const handleEditorChange = (value: string | undefined) => {
    setEditorCode(value || '')
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Code Editor - {componentName}</DialogTitle>
          <DialogDescription>
            Write custom JavaScript code for this component. Access component props via <code className="bg-muted px-1 rounded">props</code>.
          </DialogDescription>
        </DialogHeader>

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

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-primary">
            <FloppyDisk className="mr-2" />
            Save Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
