/**
 * KeyboardShortcutsDialogProps - JSON definition interface
 * Dialog for displaying keyboard shortcuts
 */
export interface KeyboardShortcutsDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
}
