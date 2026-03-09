import type {
  ConflictResolutionCopy,
  ConflictResolutionItem,
  ConflictResolveHandler,
} from '@/components/conflict-resolution/types'

import { ScrollArea } from '@/components/ui/scroll-area'
import { MetabuilderWidgetConflictCard as ConflictCard } from '@/lib/json-ui/json-components'
import { Button } from '@metabuilder/fakemui/inputs'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, ArrowsClockwise } from '@metabuilder/fakemui/icons'

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
    <ScrollArea>
      <div>
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
            >
              <XCircle size={48} weight="duotone" />
              <p>{copy.emptyStates.filtered}</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <CheckCircle size={64} weight="duotone" />
              <h3>{copy.emptyStates.noConflictsTitle}</h3>
              <p>{copy.emptyStates.noConflictsDescription}</p>
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
