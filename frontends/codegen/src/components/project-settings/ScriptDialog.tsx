import { Dialog } from '@metabuilder/fakemui/feedback'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogContentText,
  DialogActions,
} from '@metabuilder/fakemui/utils'
import { Button } from '@metabuilder/fakemui/inputs'
import { Input } from '@metabuilder/fakemui/inputs'
import { Label } from '@metabuilder/fakemui/atoms'
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
    <Dialog open={open} onClose={() => onOpenChange(false)}>
      <DialogHeader>
        <DialogTitle>{editingScriptKey ? copy.title.edit : copy.title.add}</DialogTitle>
        <DialogContentText>{copy.description}</DialogContentText>
      </DialogHeader>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="filled" onClick={onSave}>
          Save Script
        </Button>
      </DialogActions>
    </Dialog>
  )
}
