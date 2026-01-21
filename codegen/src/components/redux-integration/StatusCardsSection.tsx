import { IndexedDbStatusCard } from '@/components/redux-integration/IndexedDbStatusCard'
import { FlaskStatusCard } from '@/components/redux-integration/FlaskStatusCard'
import { SyncStatusCard } from '@/components/redux-integration/SyncStatusCard'
import { SyncStatus } from '@/store/slices/syncSlice'

type FlaskStats = {
  totalKeys: number
  totalSizeBytes: number
} | null

type StatusCardsSectionProps = {
  filesCount: number
  treesCount: number
  flaskConnected: boolean
  flaskStats: FlaskStats
  status: SyncStatus
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
  flaskConnected,
  flaskStats,
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
      <FlaskStatusCard
        flaskConnected={flaskConnected}
        flaskStats={flaskStats}
        onCheckConnection={onCheckConnection}
      />
      <SyncStatusCard
        status={status}
        lastSyncedAt={lastSyncedAt}
        autoSyncEnabled={autoSyncEnabled}
        flaskConnected={flaskConnected}
        onSyncUp={onSyncUp}
        onSyncDown={onSyncDown}
      />
    </div>
  )
}
