import { useState, useMemo } from 'react'
import { ConflictItem } from '@/types/conflicts'

type ConflictTab = 'local' | 'remote' | 'diff'

type ConflictDiffItem = {
  key: string
  localValue: unknown
  remoteValue: unknown
  isDifferent: boolean
  onlyInLocal: boolean
  onlyInRemote: boolean
}

function getConflictDiff(conflict: ConflictItem): ConflictDiffItem[] {
  const localKeys = Object.keys(conflict.localVersion)
  const remoteKeys = Object.keys(conflict.remoteVersion)
  const allKeys = Array.from(new Set([...localKeys, ...remoteKeys]))

  return allKeys.map((key) => {
    const localValue = conflict.localVersion[key]
    const remoteValue = conflict.remoteVersion[key]
    const isDifferent = JSON.stringify(localValue) !== JSON.stringify(remoteValue)
    const onlyInLocal = !(key in conflict.remoteVersion)
    const onlyInRemote = !(key in conflict.localVersion)

    return {
      key,
      localValue,
      remoteValue,
      isDifferent,
      onlyInLocal,
      onlyInRemote,
    }
  })
}

export function useConflictDetailsDialog(conflict: ConflictItem | null) {
  const [activeTab, setActiveTab] = useState<ConflictTab>('diff')

  const dialogState = useMemo(() => {
    if (!conflict) {
      return {
        activeTab,
        setActiveTab,
        isLocalNewer: false,
        localJson: '',
        remoteJson: '',
        diff: [],
        conflictingKeys: [],
      }
    }

    const isLocalNewer = conflict.localTimestamp > conflict.remoteTimestamp
    const localJson = JSON.stringify(conflict.localVersion, null, 2)
    const remoteJson = JSON.stringify(conflict.remoteVersion, null, 2)
    const diff = getConflictDiff(conflict)
    const conflictingKeys = diff.filter((item) => item.isDifferent)

    return {
      activeTab,
      setActiveTab,
      isLocalNewer,
      localJson,
      remoteJson,
      diff,
      conflictingKeys,
    }
  }, [conflict, activeTab])

  return dialogState
}
