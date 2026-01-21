import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import projectSettingsCopy from '@/data/project-settings.json'

interface ScriptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scriptKey: string
  scriptValue: string
  setScriptKey: (value: string) => void
  setScriptValue: (value: string) => void
  editingScriptKey: string | null
  onSave: () => void
}

export function ScriptDialog({
  open,
  onOpenChange,
  scriptKey,
  scriptValue,
  setScriptKey,
  setScriptValue,
  editingScriptKey,
  onSave,
}: ScriptDialogProps) {
  const copy = projectSettingsCopy.scripts.dialog

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingScriptKey ? copy.title.edit : copy.title.add}</DialogTitle>
          <DialogDescription>{copy.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="script-name">{copy.fields.name.label}</Label>
            <Input
              id="script-name"
              value={scriptKey}
              onChange={(e) => setScriptKey(e.target.value)}
              placeholder={copy.fields.name.placeholder}
            />
          </div>
          <div>
            <Label htmlFor="script-command">{copy.fields.command.label}</Label>
            <Input
              id="script-command"
              value={scriptValue}
              onChange={(e) => setScriptValue(e.target.value)}
              placeholder={copy.fields.command.placeholder}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save Script</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
