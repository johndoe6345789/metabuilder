import type {
  ConflictResolutionCopy,
  ConflictResolutionItem,
  ConflictResolveHandler,
} from '@/components/conflict-resolution/types'

import { ScrollArea } from '@/components/ui/scroll-area'
import { ConflictCard } from '@/components/ConflictCard'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, ArrowsClockwise } from '@phosphor-icons/react'

interface ConflictResolutionListProps {
  copy: ConflictResolutionCopy
  conflicts: ConflictResolutionItem[]
  hasConflicts: boolean
  isDetecting: boolean
  resolvingConflict: string | null
  onResolve: ConflictResolveHandler
  onViewDetails: (conflict: ConflictResolutionItem) => void
  onDetect: () => void
}

export function ConflictResolutionList({
  copy,
  conflicts,
  hasConflicts,
  isDetecting,
  resolvingConflict,
  onResolve,
  onViewDetails,
  onDetect,
}: ConflictResolutionListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-500px)]">
      <div className="space-y-4 pr-4">
        <AnimatePresence mode="popLayout">
          {conflicts.length > 0 ? (
            conflicts.map((conflict) => (
              <ConflictCard
                key={conflict.id}
                conflict={conflict}
                onResolve={onResolve}
                onViewDetails={onViewDetails}
                isResolving={resolvingConflict === conflict.id}
              />
            ))
          ) : hasConflicts ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <XCircle size={48} className="mx-auto text-muted-foreground mb-4" weight="duotone" />
              <p className="text-muted-foreground">{copy.emptyStates.filtered}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <CheckCircle size={64} className="mx-auto text-accent mb-4" weight="duotone" />
              <h3 className="text-xl font-semibold mb-2">{copy.emptyStates.noConflictsTitle}</h3>
              <p className="text-muted-foreground mb-6">{copy.emptyStates.noConflictsDescription}</p>
              <Button onClick={onDetect} disabled={isDetecting}>
                <ArrowsClockwise size={16} />
                {copy.buttons.checkAgain}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ScrollArea>
  )
}
