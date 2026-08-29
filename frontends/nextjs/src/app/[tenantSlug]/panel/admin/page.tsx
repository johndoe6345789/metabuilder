'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { AdminContent } from './AdminContent'

export default function AdminPage() {
  return (
    <WorkspacePageSlot path="/admin/users">
      <LevelGate minLevel={3} levelName="Admin">
        <AdminContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
