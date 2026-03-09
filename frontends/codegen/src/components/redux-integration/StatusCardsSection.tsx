import { IndexedDbStatusCard } from '@/components/redux-integration/IndexedDbStatusCard'
import { DBALStatusCard } from '@/components/redux-integration/FlaskStatusCard'
import { SyncStatusCard } from '@/components/redux-integration/SyncStatusCard'
import { DBALSyncStatus } from '@/store/slices/dbalSlice'
import type { DBALConfigResponse } from '@/store/middleware/dbalSync'

type StatusCardsSectionProps = {
  filesCount: number
  treesCount: number
  dbalConnected: boolean
  dbalStats: DBALConfigResponse | null
  status: DBALSyncStatus
  lastSyncedAt: number | null
  autoSyncEnabled: boolean
  onCreateTestFile: () => void
  onCheckConnection: () => void
  onSyncUp: () => void
  onSyncDown: () => void
}

export function StatusCardsSection({
  filesCount,
  treesCount,
  dbalConnected,
  dbalStats,
  status,
  lastSyncedAt,
  autoSyncEnabled,
  onCreateTestFile,
  onCheckConnection,
  onSyncUp,
  onSyncDown,
}: StatusCardsSectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <IndexedDbStatusCard
        filesCount={filesCount}
        treesCount={treesCount}
        onCreateTestFile={onCreateTestFile}
      />
      <DBALStatusCard
        dbalConnected={dbalConnected}
        dbalStats={dbalStats}
        onCheckConnection={onCheckConnection}
      />
      <SyncStatusCard
        status={status}
        lastSyncedAt={lastSyncedAt}
        autoSyncEnabled={autoSyncEnabled}
        dbalConnected={dbalConnected}
        onSyncUp={onSyncUp}
        onSyncDown={onSyncDown}
      />
    </div>
  )
}
