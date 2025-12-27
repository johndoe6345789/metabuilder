import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui'
import { Warning } from '@phosphor-icons/react'

interface ClearLogsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clearOnlyResolved: boolean
  onConfirm: () => void
}

export function ClearLogsDialog({ open, onOpenChange, clearOnlyResolved, onConfirm }: ClearLogsDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-300">
            <Warning className="w-6 h-6" weight="fill" />
            Confirm Clear Error Logs
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            {clearOnlyResolved
              ? 'This will permanently delete all resolved error logs. This action cannot be undone.'
              : 'This will permanently delete ALL error logs. This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
          >
            Clear Logs
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
