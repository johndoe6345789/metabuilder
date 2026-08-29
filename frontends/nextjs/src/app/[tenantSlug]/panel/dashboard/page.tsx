'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { DashboardContent } from './DashboardContent'

export default function DashboardPage() {
  return (
    <WorkspacePageSlot path="/dashboard">
      <LevelGate minLevel={1} levelName="User">
        <DashboardContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
