import { Button, DialogFooter } from '@/components/ui'
import { FloppyDisk, ShieldCheck, X } from '@/fakemui/icons'

interface ToolbarProps {
  onScan: () => void
  onFormat: () => void
  onCancel: () => void
  onSave: () => void
}

export function Toolbar({ onScan, onFormat, onCancel, onSave }: ToolbarProps) {
  return (
    <DialogFooter className="gap-2">
      <Button variant="outline" onClick={onScan}>
        <ShieldCheck className="mr-2" />
        Security Scan
      </Button>
      <Button variant="outline" onClick={onFormat}>
        Format JSON
      </Button>
      <Button variant="outline" onClick={onCancel}>
        <X className="mr-2" />
        Cancel
      </Button>
      <Button onClick={onSave} className="bg-accent text-accent-foreground hover:bg-accent/90">
        <FloppyDisk className="mr-2" />
        Save
      </Button>
    </DialogFooter>
  )
}
