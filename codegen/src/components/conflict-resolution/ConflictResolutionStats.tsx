import type { ReactNode } from 'react'
import type { ConflictResolutionCopy, ConflictResolutionStats } from '@/components/conflict-resolution/types'

import { Card, CardContent } from '@/components/ui/card'
import { Warning, Database, Cloud } from '@phosphor-icons/react'

interface ConflictResolutionStatsProps {
  copy: ConflictResolutionCopy
  stats: ConflictResolutionStats
}

function StatsCard({ count, label, icon }: { count: number; label: string; icon: ReactNode }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

export function ConflictResolutionStatsSection({ copy, stats }: ConflictResolutionStatsProps) {
  const otherCount =
    (stats.conflictsByType.components || 0) + (stats.conflictsByType.workflows || 0)

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        count={stats.totalConflicts}
        label={copy.stats.total}
        icon={<Warning size={24} className="text-destructive" weight="duotone" />}
      />
      <StatsCard
        count={stats.conflictsByType.files || 0}
        label={copy.stats.files}
        icon={<Database size={24} className="text-primary" weight="duotone" />}
      />
      <StatsCard
        count={stats.conflictsByType.models || 0}
        label={copy.stats.models}
        icon={<Database size={24} className="text-accent" weight="duotone" />}
      />
      <StatsCard
        count={otherCount}
        label={copy.stats.other}
        icon={<Cloud size={24} className="text-muted-foreground" weight="duotone" />}
      />
    </div>
  )
}
