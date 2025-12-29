import { Button } from '@/components/ui'
import { DialogFooter } from '@/components/ui'

interface ComponentConfigActionsProps {
  onClose: () => void
  onSave: () => Promise<void> | void
}

export function ComponentConfigActions({ onClose, onSave }: ComponentConfigActionsProps) {
  return (
    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={() => void onSave()}>Save Configuration</Button>
    </DialogFooter>
  )
}
