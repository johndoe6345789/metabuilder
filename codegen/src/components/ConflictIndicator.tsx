import { useConflictResolution } from '@/hooks/use-conflict-resolution'
import { Badge } from '@/components/ui/badge'
import { Warning } from '@phosphor-icons/react'
import { motion, AnimatePresence } from 'framer-motion'

interface ConflictIndicatorProps {
  onClick?: () => void
  showLabel?: boolean
  variant?: 'badge' | 'compact'
}

export function ConflictIndicator({ 
  onClick, 
  showLabel = true,
  variant = 'badge' 
}: ConflictIndicatorProps) {
  const { hasConflicts, stats } = useConflictResolution()

  if (!hasConflicts) return null

  if (variant === 'compact') {
    return (
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          onClick={onClick}
          className="relative"
        >
          <Warning 
            size={20} 
            weight="fill" 
            className="text-destructive animate-pulse" 
          />
          <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {stats.totalConflicts}
          </span>
        </motion.button>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <Badge
          variant="destructive"
          className="cursor-pointer hover:bg-destructive/90 transition-colors gap-1.5 animate-pulse"
          onClick={onClick}
        >
          <Warning size={14} weight="fill" />
          {showLabel && (
            <>
              {stats.totalConflicts} Conflict{stats.totalConflicts === 1 ? '' : 's'}
            </>
          )}
          {!showLabel && stats.totalConflicts}
        </Badge>
      </motion.div>
    </AnimatePresence>
  )
}
