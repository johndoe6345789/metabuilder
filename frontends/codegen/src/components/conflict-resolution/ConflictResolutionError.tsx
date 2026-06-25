import type { ConflictResolutionCopy } from '@/components/conflict-resolution/types'

import { Card, CardContent } from '@metabuilder/m3/surfaces'
import { XCircle } from '@metabuilder/m3/icons'
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent>
          <XCircle size={24} weight="duotone" />
          <div>
            <div>{copy.error.title}</div>
            <div>{error}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
