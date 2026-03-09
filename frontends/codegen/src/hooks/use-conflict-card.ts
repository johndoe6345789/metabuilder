import { useState, useMemo } from 'react'
import { ConflictItem } from '@/types/conflicts'

export function useConflictCard(conflict: ConflictItem) {
  const [expanded, setExpanded] = useState(false)

  const isLocalNewer = conflict.localTimestamp > conflict.remoteTimestamp
  const timeDiff = Math.abs(conflict.localTimestamp - conflict.remoteTimestamp)
  const timeDiffMinutes = Math.round(timeDiff / 1000 / 60)

  const state = useMemo(
    () => ({
      expanded,
      setExpanded,
      isLocalNewer,
      timeDiffMinutes,
    }),
    [expanded, isLocalNewer, timeDiffMinutes]
  )

  return state
}
