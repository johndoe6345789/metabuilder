import type { ConflictResolutionStrategy } from '@/types/conflicts'
import type { ConflictResolutionCopy } from '@/components/conflict-resolution/types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@metabuilder/fakemui/surfaces'
import { Button } from '@metabuilder/fakemui/inputs'
import { Separator } from '@metabuilder/fakemui/data-display'
import { ArrowsLeftRight, Cloud, Database } from '@metabuilder/fakemui/icons'

interface ConflictResolutionBulkActionsProps {
  copy: ConflictResolutionCopy
  detectingConflicts: boolean
  resolvingConflict: string | null
  autoResolveStrategy: ConflictResolutionStrategy | null
  onResolveAll: (strategy: ConflictResolutionStrategy) => void
  onAutoResolveChange: (strategy: ConflictResolutionStrategy | null) => void
}

export function ConflictResolutionBulkActions({
  copy,
  detectingConflicts,
  resolvingConflict,
  autoResolveStrategy,
  onResolveAll,
  onAutoResolveChange,
}: ConflictResolutionBulkActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <ArrowsLeftRight size={20} />
          {copy.bulk.title}
        </CardTitle>
        <CardDescription>{copy.bulk.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onResolveAll('local')}
          disabled={detectingConflicts || !!resolvingConflict}
        >
          <Database size={16} />
          {copy.buttons.keepAllLocal}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onResolveAll('remote')}
          disabled={detectingConflicts || !!resolvingConflict}
        >
          <Cloud size={16} />
          {copy.buttons.keepAllRemote}
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onResolveAll('merge')}
          disabled={detectingConflicts || !!resolvingConflict}
        >
          <ArrowsLeftRight size={16} />
          {copy.buttons.mergeAll}
        </Button>

        <Separator orientation="vertical" />

        <div>
          <span>{copy.bulk.autoResolveLabel}</span>
          <select
            value={autoResolveStrategy || 'none'}
            onChange={(e) =>
              onAutoResolveChange(
                e.target.value === 'none' ? null : (e.target.value as ConflictResolutionStrategy),
              )
            }
          >
            <option value="none">{copy.bulk.autoResolveOptions.none}</option>
            <option value="local">{copy.bulk.autoResolveOptions.local}</option>
            <option value="remote">{copy.bulk.autoResolveOptions.remote}</option>
            <option value="merge">{copy.bulk.autoResolveOptions.merge}</option>
          </select>
        </div>
      </CardContent>
    </Card>
  )
}
