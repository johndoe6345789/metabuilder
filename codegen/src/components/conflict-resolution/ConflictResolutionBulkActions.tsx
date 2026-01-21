import type { ConflictResolutionStrategy } from '@/types/conflicts'
import type { ConflictResolutionCopy } from '@/components/conflict-resolution/types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowsLeftRight, Cloud, Database } from '@phosphor-icons/react'

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
    <Card className="border-destructive/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowsLeftRight size={20} />
          {copy.bulk.title}
        </CardTitle>
        <CardDescription>{copy.bulk.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolveAll('local')}
          disabled={detectingConflicts || !!resolvingConflict}
        >
          <Database size={16} />
          {copy.buttons.keepAllLocal}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolveAll('remote')}
          disabled={detectingConflicts || !!resolvingConflict}
        >
          <Cloud size={16} />
          {copy.buttons.keepAllRemote}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onResolveAll('merge')}
          disabled={detectingConflicts || !!resolvingConflict}
        >
          <ArrowsLeftRight size={16} />
          {copy.buttons.mergeAll}
        </Button>

        <Separator orientation="vertical" className="h-8 mx-2" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{copy.bulk.autoResolveLabel}</span>
          <Select
            value={autoResolveStrategy || 'none'}
            onValueChange={(value) =>
              onAutoResolveChange(
                value === 'none' ? null : (value as ConflictResolutionStrategy),
              )
            }
          >
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{copy.bulk.autoResolveOptions.none}</SelectItem>
              <SelectItem value="local">{copy.bulk.autoResolveOptions.local}</SelectItem>
              <SelectItem value="remote">{copy.bulk.autoResolveOptions.remote}</SelectItem>
              <SelectItem value="merge">{copy.bulk.autoResolveOptions.merge}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
