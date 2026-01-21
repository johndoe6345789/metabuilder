import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useConflictResolution } from '@/hooks/use-conflict-resolution'
import { ConflictIndicator } from '@/components/ConflictIndicator'
import { db } from '@/lib/db'
import conflictCopy from '@/data/conflict-resolution-copy.json'
import {
  Flask,
  Database,
  Warning,
  CheckCircle,
  ArrowsClockwise,
} from '@phosphor-icons/react'
import { toast } from 'sonner'

const demoCopy = conflictCopy.demo

function DemoHeader() {
  return (
    <div>
      <h2 className="text-2xl font-bold font-mono mb-2">{demoCopy.title}</h2>
      <p className="text-muted-foreground">{demoCopy.subtitle}</p>
    </div>
  )
}

function StatusCard({ hasConflicts, stats }: { hasConflicts: boolean; stats: { totalConflicts: number; conflictsByType: Record<string, number> } }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Database size={20} className="text-primary" weight="duotone" />
          {demoCopy.statusTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{demoCopy.conflictsLabel}</span>
          {hasConflicts ? (
            <Badge variant="destructive">{stats.totalConflicts}</Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle size={12} />
              {demoCopy.noneLabel}
            </Badge>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{demoCopy.filesLabel}</span>
          <span className="text-sm font-medium">{stats.conflictsByType.files || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{demoCopy.modelsLabel}</span>
          <span className="text-sm font-medium">{stats.conflictsByType.models || 0}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function DemoActionsCard({
  hasConflicts,
  simulatingConflict,
  onSimulate,
  onDetect,
  onResolveAll,
  conflictSummary,
}: {
  hasConflicts: boolean
  simulatingConflict: boolean
  onSimulate: () => void
  onDetect: () => void
  onResolveAll: () => void
  conflictSummary: string
}) {
  return (
    <Card className="md:col-span-2">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Flask size={20} className="text-accent" weight="duotone" />
          {demoCopy.demoActionsTitle}
        </CardTitle>
        <CardDescription>{demoCopy.demoActionsDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onSimulate}
            disabled={simulatingConflict}
          >
            <Warning size={16} />
            {demoCopy.simulateConflict}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onDetect}
          >
            <ArrowsClockwise size={16} />
            {demoCopy.detectConflicts}
          </Button>

          {hasConflicts && (
            <>
              <Separator orientation="vertical" className="h-8" />
              <Button
                size="sm"
                variant="destructive"
                onClick={onResolveAll}
              >
                <CheckCircle size={16} />
                {demoCopy.resolveAllLocal}
              </Button>
            </>
          )}
        </div>

        {hasConflicts && (
          <div className="mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/30">
            <div className="flex items-start gap-2">
              <Warning size={20} className="text-destructive mt-0.5" weight="fill" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {conflictSummary}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {demoCopy.navigateMessage}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ResolutionStrategiesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{demoCopy.resolutionStrategiesTitle}</CardTitle>
        <CardDescription>{demoCopy.resolutionStrategiesDescription}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-md border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Database size={16} className="text-primary" />
              <span className="font-medium text-sm">{demoCopy.strategyKeepLocalTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {demoCopy.strategyKeepLocalDescription}
            </p>
          </div>

          <div className="p-3 rounded-md border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <Flask size={16} className="text-accent" />
              <span className="font-medium text-sm">{demoCopy.strategyKeepRemoteTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {demoCopy.strategyKeepRemoteDescription}
            </p>
          </div>

          <div className="p-3 rounded-md border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <ArrowsClockwise size={16} className="text-primary" />
              <span className="font-medium text-sm">{demoCopy.strategyMergeBothTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {demoCopy.strategyMergeBothDescription}
            </p>
          </div>

          <div className="p-3 rounded-md border bg-card">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-accent" />
              <span className="font-medium text-sm">{demoCopy.strategyManualEditTitle}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {demoCopy.strategyManualEditDescription}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConflictIndicatorCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ConflictIndicator variant="compact" showLabel={false} />
          {demoCopy.indicatorTitle}
        </CardTitle>
        <CardDescription>
          {demoCopy.indicatorDescription}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{demoCopy.badgeVariantLabel}</span>
            <ConflictIndicator variant="badge" showLabel={true} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{demoCopy.compactVariantLabel}</span>
            <ConflictIndicator variant="compact" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ConflictResolutionDemo() {
  const { hasConflicts, stats, detect, resolveAll } = useConflictResolution()
  const [simulatingConflict, setSimulatingConflict] = useState(false)

  const conflictSummary = useMemo(() => {
    const count = stats.totalConflicts
    const label = count === 1 ? demoCopy.conflictSingular : demoCopy.conflictPlural
    return `${count} ${label} ${demoCopy.detectedSuffix}`
  }, [stats.totalConflicts])

  const simulateConflict = async () => {
    setSimulatingConflict(true)
    try {
      const testFile = {
        id: 'demo-conflict-file',
        name: 'example.ts',
        path: '/src/example.ts',
        content: 'const local = "This is the local version"',
        language: 'typescript',
        updatedAt: Date.now(),
      }

      await db.put('files', testFile)

      toast.info(demoCopy.toastLocalCreated)

      await new Promise(resolve => setTimeout(resolve, 1000))

      toast.success(demoCopy.toastSimulationComplete)
    } catch (err: any) {
      toast.error(err.message || demoCopy.toastSimulationError)
    } finally {
      setSimulatingConflict(false)
    }
  }

  const handleQuickResolveAll = async () => {
    try {
      await resolveAll('local')
      toast.success(demoCopy.toastResolveAllSuccess)
    } catch (err: any) {
      toast.error(err.message || demoCopy.toastResolveAllError)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <DemoHeader />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard hasConflicts={hasConflicts} stats={stats} />

        <DemoActionsCard
          hasConflicts={hasConflicts}
          simulatingConflict={simulatingConflict}
          onSimulate={simulateConflict}
          onDetect={detect}
          onResolveAll={handleQuickResolveAll}
          conflictSummary={conflictSummary}
        />
      </div>

      <ResolutionStrategiesCard />

      <ConflictIndicatorCard />
    </div>
  )
}
