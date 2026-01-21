import { useConflictResolutionPage } from '@/hooks/use-conflict-resolution-page'
import conflictResolutionCopy from '@/data/conflict-resolution.json'
import { ConflictResolutionHeader } from '@/components/conflict-resolution/ConflictResolutionHeader'
import { ConflictResolutionStatsSection } from '@/components/conflict-resolution/ConflictResolutionStats'
import { ConflictResolutionBulkActions } from '@/components/conflict-resolution/ConflictResolutionBulkActions'
import { ConflictResolutionFilters } from '@/components/conflict-resolution/ConflictResolutionFilters'
import { ConflictResolutionList } from '@/components/conflict-resolution/ConflictResolutionList'
import { ConflictResolutionError } from '@/components/conflict-resolution/ConflictResolutionError'
import { ConflictResolutionDetails } from '@/components/conflict-resolution/ConflictResolutionDetails'
import type { ConflictResolutionCopy } from '@/components/conflict-resolution/types'

export function ConflictResolutionPage() {
  const copy = conflictResolutionCopy as ConflictResolutionCopy
  const {
    conflicts,
    stats,
    autoResolveStrategy,
    detectingConflicts,
    resolvingConflict,
    error,
    hasConflicts,
    clear,
    setAutoResolve,
    filterType,
    setFilterType,
    selectedConflict,
    detailsDialogOpen,
    setDetailsDialogOpen,
    handleDetect,
    handleResolve,
    handleResolveAll,
    handleViewDetails,
  } = useConflictResolutionPage(copy)

  const filteredConflicts = filterType === 'all'
    ? conflicts
    : conflicts.filter(c => c.entityType === filterType)

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="flex-none border-b bg-card/50">
        <div className="p-6 space-y-4">
          <ConflictResolutionHeader
            copy={copy}
            hasConflicts={hasConflicts}
            detectingConflicts={detectingConflicts}
            onDetect={handleDetect}
            onClear={clear}
          />
          <ConflictResolutionStatsSection copy={copy} stats={stats} />
          {hasConflicts && (
            <ConflictResolutionBulkActions
              copy={copy}
              detectingConflicts={detectingConflicts}
              resolvingConflict={resolvingConflict}
              autoResolveStrategy={autoResolveStrategy}
              onResolveAll={handleResolveAll}
              onAutoResolveChange={(value) => setAutoResolve(value)}
            />
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <ConflictResolutionFilters
          copy={copy}
          hasConflicts={hasConflicts}
          filterType={filterType}
          onFilterChange={setFilterType}
          conflictCount={filteredConflicts.length}
        />

        <ConflictResolutionList
          copy={copy}
          conflicts={filteredConflicts}
          hasConflicts={hasConflicts}
          isDetecting={detectingConflicts}
          resolvingConflict={resolvingConflict}
          onResolve={handleResolve}
          onViewDetails={handleViewDetails}
          onDetect={handleDetect}
        />

        <ConflictResolutionError copy={copy} error={error} />
      </div>

      <ConflictResolutionDetails
        conflict={selectedConflict}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onResolve={handleResolve}
        isResolving={!!resolvingConflict}
      />
    </div>
  )
}
