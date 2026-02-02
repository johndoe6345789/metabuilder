import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from '@phosphor-icons/react'
import {
  KeyboardShortcutsContent,
  getPlatformModifier,
  type ShortcutCategory,
} from '@metabuilder/components'

interface KeyboardShortcutsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Get codegen-specific keyboard shortcuts
 * Shortcuts are defined as data for easy maintenance and localization
 */
function getCodegenShortcuts(): ShortcutCategory[] {
  const ctrlKey = getPlatformModifier()

  return [
    {
      category: 'Navigation',
      items: [
        { keys: [ctrlKey, '1'], description: 'Go to Dashboard' },
        { keys: [ctrlKey, '2'], description: 'Go to Code Editor' },
        { keys: [ctrlKey, '3'], description: 'Go to Models' },
        { keys: [ctrlKey, '4'], description: 'Go to Components' },
        { keys: [ctrlKey, '5'], description: 'Go to Component Trees' },
        { keys: [ctrlKey, '6'], description: 'Go to Workflows' },
        { keys: [ctrlKey, '7'], description: 'Go to Lambdas' },
        { keys: [ctrlKey, '8'], description: 'Go to Styling' },
        { keys: [ctrlKey, '9'], description: 'Go to Favicon Designer' },
      ],
    },
    {
      category: 'Actions',
      items: [
        { keys: [ctrlKey, 'K'], description: 'Search Everything' },
        { keys: [ctrlKey, 'E'], description: 'Export Project' },
        { keys: [ctrlKey, 'Shift', 'G'], description: 'AI Generate' },
        { keys: [ctrlKey, '/'], description: 'Show Keyboard Shortcuts' },
      ],
    },
    {
      category: 'Code Editor',
      items: [
        { keys: [ctrlKey, 'F'], description: 'Find in file' },
        { keys: [ctrlKey, 'H'], description: 'Find and replace' },
        { keys: [ctrlKey, 'Z'], description: 'Undo' },
        { keys: [ctrlKey, 'Shift', 'Z'], description: 'Redo' },
      ],
    },
  ]
}

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  const shortcuts = getCodegenShortcuts()

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

        <KeyboardShortcutsContent
          shortcuts={shortcuts}
          title=""
          description=""
        />
      </DialogContent>
    </Dialog>
  )
}
