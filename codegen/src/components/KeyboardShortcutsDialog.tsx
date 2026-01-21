import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Keyboard } from '@phosphor-icons/react'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const isMac = navigator.platform.includes('Mac')
  const ctrlKey = isMac ? '⌘' : 'Ctrl'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard size={24} weight="duotone" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Speed up your workflow with these shortcuts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Navigation</h3>
            <div className="space-y-2">
              <ShortcutRow
                keys={[ctrlKey, '1']}
                description="Go to Dashboard"
              />
              <ShortcutRow
                keys={[ctrlKey, '2']}
                description="Go to Code Editor"
              />
              <ShortcutRow
                keys={[ctrlKey, '3']}
                description="Go to Models"
              />
              <ShortcutRow
                keys={[ctrlKey, '4']}
                description="Go to Components"
              />
              <ShortcutRow
                keys={[ctrlKey, '5']}
                description="Go to Component Trees"
              />
              <ShortcutRow
                keys={[ctrlKey, '6']}
                description="Go to Workflows"
              />
              <ShortcutRow
                keys={[ctrlKey, '7']}
                description="Go to Lambdas"
              />
              <ShortcutRow
                keys={[ctrlKey, '8']}
                description="Go to Styling"
              />
              <ShortcutRow
                keys={[ctrlKey, '9']}
                description="Go to Favicon Designer"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Actions</h3>
            <div className="space-y-2">
              <ShortcutRow
                keys={[ctrlKey, 'K']}
                description="Search Everything"
              />
              <ShortcutRow
                keys={[ctrlKey, 'E']}
                description="Export Project"
              />
              <ShortcutRow
                keys={[ctrlKey, 'Shift', 'G']}
                description="AI Generate"
              />
              <ShortcutRow
                keys={[ctrlKey, '/']}
                description="Show Keyboard Shortcuts"
              />
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Code Editor</h3>
            <div className="space-y-2">
              <ShortcutRow
                keys={[ctrlKey, 'F']}
                description="Find in file"
              />
              <ShortcutRow
                keys={[ctrlKey, 'H']}
                description="Find and replace"
              />
              <ShortcutRow
                keys={[ctrlKey, 'Z']}
                description="Undo"
              />
              <ShortcutRow
                keys={[ctrlKey, 'Shift', 'Z']}
                description="Redo"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ShortcutRow({ keys, description }: { keys: string[]; description: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{description}</span>
      <div className="flex gap-1">
        {keys.map((key, index) => (
          <kbd
            key={index}
            className="px-2 py-1 text-xs font-semibold bg-muted border border-border rounded"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  )
}
