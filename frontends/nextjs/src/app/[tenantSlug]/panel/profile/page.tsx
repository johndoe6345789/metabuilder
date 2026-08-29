'use client'

import { LevelGate } from '@/components/layout/LevelGate'
import { WorkspacePageSlot } from '@/components/workspace/WorkspacePageSlot'
import { ProfileContent } from './ProfileContent'

export default function ProfilePage() {
  return (
    <WorkspacePageSlot path="/profile">
      <LevelGate minLevel={1} levelName="User">
        <ProfileContent />
      </LevelGate>
    </WorkspacePageSlot>
  )
}
