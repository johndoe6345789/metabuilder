import type { ConflictResolutionCopy } from '@/components/conflict-resolution/types'

import { Card, CardContent } from '@/components/ui/card'
import { XCircle } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ConflictResolutionErrorProps {
  copy: ConflictResolutionCopy
  error: string | null
}

export function ConflictResolutionError({ copy, error }: ConflictResolutionErrorProps) {
  if (!error) {
    return null
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
      <Card className="border-destructive">
        <CardContent className="pt-6 flex items-center gap-3">
          <XCircle size={24} className="text-destructive" weight="duotone" />
          <div className="flex-1">
            <div className="font-medium">{copy.error.title}</div>
            <div className="text-sm text-muted-foreground">{error}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
