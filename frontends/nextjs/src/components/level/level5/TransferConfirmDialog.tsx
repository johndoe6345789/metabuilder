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
import { Crown } from '@phosphor-icons/react'
import type { User } from '@/lib/level-types'

interface TransferConfirmDialogProps {
  open: boolean
  allUsers: User[]
  selectedUserId: string
  onClose: (open: boolean) => void
  onConfirm: () => void
}

export function TransferConfirmDialog({ open, allUsers, selectedUserId, onClose, onConfirm }: TransferConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="bg-slate-900 border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-amber-300">
            <Crown className="w-6 h-6" weight="fill" />
            Confirm Power Transfer
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            Are you absolutely sure? This will transfer your Super God privileges to{' '}
            <span className="font-semibold text-white">{allUsers.find(u => u.id === selectedUserId)?.username}</span>.
            You will be downgraded to God level and cannot reverse this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700"
          >
            Transfer Power
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
